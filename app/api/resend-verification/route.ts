import { NextResponse } from "next/server"
import { z } from "zod"
import { executeQueryWithRetry } from "@/lib/db"
import { sendEmail } from "@/lib/resend"
import crypto from "crypto"

// Esquema de validación actualizado para aceptar email o username
const schema = z.object({
  identifier: z.string().min(1, "Email o nombre de usuario requerido").max(50),
  isEmail: z.boolean().optional(),
  specificUsername: z.string().optional(), // Nuevo: para seleccionar cuenta específica
})

// Cache para prevenir spam de reenvíos
const recentResends = new Map<string, number>()
const RESEND_COOLDOWN = 60000 // 1 minuto entre reenvíos

// Limpiar cache periódicamente
setInterval(() => {
  const now = Date.now()
  for (const [key, timestamp] of recentResends.entries()) {
    if (now - timestamp > RESEND_COOLDOWN) {
      recentResends.delete(key)
    }
  }
}, 30000)

// Función para detectar si es email o username
function isEmailFormat(input: string): boolean {
  return input.includes('@')
}

export async function POST(req: Request) {
  try {
    console.log("[RESEND] === INICIO DE SOLICITUD ===")
    
    const data = await req.json()
    console.log("[RESEND] Datos recibidos:", data)

    // Validar datos
    const parsed = schema.safeParse(data)
    if (!parsed.success) {
      console.log("[RESEND] Error de validación:", parsed.error)
      return NextResponse.json({ 
        success: false,
        error: "Email o nombre de usuario inválido" 
      }, { status: 400 })
    }

    const { identifier, specificUsername } = parsed.data
    const isEmail = data.isEmail ?? isEmailFormat(identifier)
    const keyIdentifier = isEmail ? identifier.toLowerCase() : identifier
    const cacheKey = `resend_${keyIdentifier}${specificUsername ? '_' + specificUsername : ''}`
    const now = Date.now()

    console.log("[RESEND] Identificador:", identifier, "Es email:", isEmail, "Username específico:", specificUsername)
    console.log("[RESEND] Verificando cooldown...")

    // Verificar cooldown
    if (recentResends.has(cacheKey)) {
      const lastResend = recentResends.get(cacheKey)!
      const timeLeft = RESEND_COOLDOWN - (now - lastResend)
      if (timeLeft > 0) {
        console.log("[RESEND] Cooldown activo, tiempo restante:", timeLeft)
        return NextResponse.json({ 
          success: false,
          error: `Debes esperar ${Math.ceil(timeLeft / 1000)} segundos antes de reenviar` 
        }, { status: 429 })
      }
    }

    console.log("[RESEND] Cooldown OK, ejecutando consulta BD...")

    const result = await executeQueryWithRetry(async (pool) => {
      console.log("[RESEND] Conectado a BD, buscando cuenta pendiente...")
      
      let pendingAccount = null
      let email = ""
      let multipleAccounts = []

      if (isEmail) {
        // Buscar por email - puede haber múltiples cuentas pendientes
      const pendingResult = await pool
        .request()
          .input("email", identifier)
          .query("SELECT username, password, verification_token, expires_at, email, created_at FROM PendingAccounts WHERE email = @email ORDER BY created_at DESC")

        console.log("[RESEND] Búsqueda por email:", pendingResult.recordset.length, "registros encontrados")

        if (pendingResult.recordset.length === 0) {
          throw new Error("EMAIL_NOT_FOUND")
        }

        multipleAccounts = pendingResult.recordset

        if (specificUsername) {
          // Buscar username específico dentro de las cuentas con este email
          pendingAccount = multipleAccounts.find(acc => acc.username === specificUsername)
          if (!pendingAccount) {
            throw new Error("USERNAME_NOT_FOUND_FOR_EMAIL")
          }
          console.log("[RESEND] Cuenta pendiente específica encontrada:", pendingAccount.username)
        } else if (multipleAccounts.length === 1) {
          // Solo una cuenta pendiente con este email
          pendingAccount = multipleAccounts[0]
          console.log("[RESEND] Única cuenta pendiente por email:", pendingAccount.username)
        } else {
          // Múltiples cuentas pendientes - devolver lista para que el usuario elija
          console.log("[RESEND] Múltiples cuentas pendientes encontradas:", multipleAccounts.length)
          const accountsList = multipleAccounts.map(acc => ({
            username: acc.username,
            createdAt: acc.created_at,
            isExpired: new Date() > new Date(acc.expires_at)
          }))
          
          throw new Error(JSON.stringify({
            type: "MULTIPLE_ACCOUNTS",
            accounts: accountsList,
            email: identifier
          }))
        }

        email = pendingAccount.email
      } else {
        // Buscar por username específico
        const pendingResult = await pool
        .request()
          .input("username", identifier)
          .query("SELECT username, password, verification_token, expires_at, email FROM PendingAccounts WHERE username = @username")

        console.log("[RESEND] Búsqueda por username:", pendingResult.recordset.length, "registros encontrados")

      if (pendingResult.recordset.length === 0) {
          throw new Error("USERNAME_NOT_FOUND")
      }

        pendingAccount = pendingResult.recordset[0]
        email = pendingAccount.email
        
        console.log("[RESEND] Cuenta pendiente por username:", pendingAccount.username)
      }

      // Verificar si el token actual ha expirado
      const currentTime = new Date()
      const expiresAt = new Date(pendingAccount.expires_at)
      console.log("[RESEND] Verificando expiración. Ahora:", currentTime, "Expira:", expiresAt)

      if (currentTime > expiresAt) {
        console.log("[RESEND] Token expirado, generando nuevo...")
        
        // Token expirado, generar uno nuevo
        const newToken = crypto.randomBytes(32).toString("hex")
        const newExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas

        console.log("[RESEND] Nuevo token generado, actualizando BD...")

        await pool
          .request()
          .input("username", pendingAccount.username)
          .input("newToken", newToken)
          .input("newExpiresAt", newExpiresAt)
          .query(`
            UPDATE PendingAccounts 
            SET verification_token = @newToken, expires_at = @newExpiresAt 
            WHERE username = @username
          `)

        console.log("[RESEND] BD actualizada con nuevo token")

        return {
          username: pendingAccount.username,
          email: email,
          verificationToken: newToken,
          isEmail,
          isTokenRenewed: true
        }
      } else {
        console.log("[RESEND] Token aún válido, usando existente")
        
        // Token aún válido, usar el existente
        return {
          username: pendingAccount.username,
          email: email,
          verificationToken: pendingAccount.verification_token,
          isEmail,
          isTokenRenewed: false
        }
      }
    })

    console.log("[RESEND] Consulta BD completada, resultado:", result.username)

    // Marcar como reenviado para prevenir spam
    recentResends.set(cacheKey, now)

    console.log("[RESEND] Preparando envío de email...")

    // Verificar variables de entorno
    if (!process.env.NEXT_PUBLIC_BASE_URL) {
      console.error("[RESEND] ERROR: NEXT_PUBLIC_BASE_URL no está configurada")
      throw new Error("Configuración de servidor incompleta")
    }

    if (!process.env.RESEND_API_KEY) {
      console.error("[RESEND] ERROR: RESEND_API_KEY no está configurada")
      throw new Error("Servicio de email no configurado")
    }

    // Enviar email de verificación
    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/es/verificar-email?token=${result.verificationToken}`
    console.log("[RESEND] URL de verificación:", verificationUrl)

    const emailSubject = result.isTokenRenewed 
      ? "Nuevo enlace de verificación - ETEREAL CONQUEST"
      : "Reenvío de verificación - ETEREAL CONQUEST"

    const emailResult = await sendEmail({
      to: result.email,
      subject: emailSubject,
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { background-color: #1a1a1a; color: #ffffff; font-family: Arial, sans-serif; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .content { background-color: #1a1a1a; padding: 20px; border-radius: 5px; color: #ffffff; }
    .button { display: inline-block; background-color: #FFD700; color: #000000 !important; text-decoration: none; padding: 15px 30px; border-radius: 5px; font-weight: bold; margin: 20px 0; }
    .username { color: #FFD700; font-weight: bold; }
    .link { color: #FFD700; word-break: break-all; }
    .warning-text { color: #ffffff; margin-top: 20px; }
    .warning-icon { margin-right: 10px; }
    .renewed-badge { background-color: #28a745; color: white; padding: 3px 8px; border-radius: 3px; font-size: 12px; }
    p, span, div { color: #ffffff; }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <h2 style="color: #FFD700;">¡Bienvenido a ETEREAL CONQUEST!</h2>
      <p>Hola <span class="username">${result.username}</span>,</p>
      <p>Has solicitado ${result.isTokenRenewed ? 'un nuevo' : 'reenviar el'} enlace de verificación para tu cuenta.</p>
      ${result.isTokenRenewed ? '<p><span class="renewed-badge">NUEVO TOKEN</span> Se ha generado un nuevo enlace de verificación.</p>' : ''}
      <p>Para completar tu registro, haz clic en el siguiente botón:</p>
      
      <div style="text-align: center;">
        <a href="${verificationUrl}" class="button">Verificar mi Cuenta</a>
      </div>
      
      <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
      <p class="link">${verificationUrl}</p>
      
      <div class="warning-text">
        <span class="warning-icon">⏰</span>
        <span>Este enlace expirará en 24 horas.</span>
      </div>
      
      <div style="margin-top: 20px;">
        <span class="warning-icon">🔒</span>
        <span>Si no solicitaste este reenvío, puedes ignorar este mensaje.</span>
      </div>
      
      <div style="margin-top: 20px; font-size: 12px; color: #888;">
        <span class="warning-icon">📧</span>
        <span>Cuenta: ${result.username} | Email: ${createEmailHint(result.email)}</span>
      </div>
    </div>
  </div>
</body>
</html>
      `,
    })

    console.log("[RESEND] Resultado envío email:", emailResult.success ? "✅ Éxito" : "❌ Error")
    if (!emailResult.success) {
      console.error("[RESEND] Detalles error email:", emailResult.error)
    }

    if (!emailResult.success) {
      console.error("[RESEND] Error enviando email:", emailResult.error)
      return NextResponse.json({ 
        success: false,
        error: "Error enviando el email. Inténtalo más tarde." 
      }, { status: 500 })
    }

    console.log(`[RESEND] ✅ Email reenviado exitosamente a: ${result.email}`)
    console.log("[RESEND] === FIN EXITOSO ===")

    // Preparar respuesta con información adicional
    const response: any = { 
      success: true,
      message: `Email de verificación ${result.isTokenRenewed ? 'renovado y ' : ''}reenviado exitosamente para la cuenta ${result.username}. Revisa tu bandeja de entrada.`,
      account: result.username,
      tokenRenewed: result.isTokenRenewed
    }

    // Si se usó username, incluir pista del email
    if (!result.isEmail) {
      const emailHint = createEmailHint(result.email)
      response.emailHint = emailHint
      response.message = `Email de verificación ${result.isTokenRenewed ? 'renovado y ' : ''}reenviado exitosamente para la cuenta ${result.username} a ${emailHint}. Revisa tu bandeja de entrada.`
    }

    return NextResponse.json(response)

  } catch (err: any) {
    console.error("[RESEND] ❌ ERROR CAPTURADO:", err)
    console.error("[RESEND] Stack trace:", err.stack)

    // Manejo específico para múltiples cuentas
    try {
      const errorData = JSON.parse(err.message)
      if (errorData.type === "MULTIPLE_ACCOUNTS") {
        console.log("[RESEND] Múltiples cuentas encontradas, devolviendo lista")
        return NextResponse.json({ 
          success: false,
          error: "MULTIPLE_ACCOUNTS",
          message: "Se encontraron múltiples cuentas pendientes con este email. Por favor, selecciona cuál deseas verificar.",
          accounts: errorData.accounts,
          email: errorData.email
        }, { status: 409 }) // 409 Conflict
      }
    } catch (parseError) {
      // No es un error de múltiples cuentas, continuar con manejo normal
    }

    // Manejo específico de errores
    if (err.message === "EMAIL_NOT_FOUND") {
      console.log("[RESEND] Error específico: EMAIL_NOT_FOUND")
      return NextResponse.json({ 
        success: false,
        error: "No se encontró ningún registro pendiente para este email. Asegúrate de haberte registrado primero." 
      }, { status: 404 })
    }

    if (err.message === "USERNAME_NOT_FOUND") {
      console.log("[RESEND] Error específico: USERNAME_NOT_FOUND")
      return NextResponse.json({ 
        success: false,
        error: "No se encontró ningún registro pendiente para este nombre de usuario. Asegúrate de haberte registrado primero." 
      }, { status: 404 })
    }

    if (err.message === "USERNAME_NOT_FOUND_FOR_EMAIL") {
      console.log("[RESEND] Error específico: USERNAME_NOT_FOUND_FOR_EMAIL")
      return NextResponse.json({ 
        success: false,
        error: "No se encontró esa cuenta específica pendiente para este email." 
      }, { status: 404 })
    }

    if (err.message === "EMAIL_ALREADY_VERIFIED") {
      console.log("[RESEND] Error específico: EMAIL_ALREADY_VERIFIED")
      return NextResponse.json({ 
        success: false,
        error: "Esta cuenta ya ha sido verificada exitosamente. Puedes iniciar sesión directamente." 
      }, { status: 400 })
    }

    if (err.message === "Configuración de servidor incompleta") {
      console.log("[RESEND] Error de configuración")
      return NextResponse.json({ 
        success: false,
        error: "Error de configuración del servidor. Contacta al administrador." 
      }, { status: 500 })
    }

    if (err.message === "Servicio de email no configurado") {
      console.log("[RESEND] Error de servicio de email")
      return NextResponse.json({ 
        success: false,
        error: "Servicio de email temporalmente no disponible. Inténtalo más tarde." 
      }, { status: 500 })
    }

    console.log("[RESEND] Error genérico, devolviendo 500")
    return NextResponse.json({
      success: false,
      error: "Error interno del servidor. Inténtalo más tarde.",
      details: err.message,
    }, { status: 500 })
  }
}

// Función para crear pista del email (igual que en recuperación)
function createEmailHint(email: string): string {
  const [localPart, domain] = email.split('@')
  if (!localPart || !domain) return email
  
  const [domainName, extension] = domain.split('.')
  if (!domainName || !extension) return email
  
  const hiddenLocal = localPart.length > 2 
    ? localPart[0] + '*'.repeat(localPart.length - 2) + localPart[localPart.length - 1]
    : localPart[0] + '*'.repeat(Math.max(1, localPart.length - 1))
    
  const hiddenDomain = domainName.length > 2
    ? domainName[0] + '*'.repeat(domainName.length - 2) + domainName[domainName.length - 1]
    : domainName[0] + '*'.repeat(Math.max(1, domainName.length - 1))
    
  return `${hiddenLocal}@${hiddenDomain}.${extension}`
} 