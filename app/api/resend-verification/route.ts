import { NextResponse } from "next/server"
import { z } from "zod"
import { executeQueryWithRetry } from "@/lib/db"
import { sendEmail } from "@/lib/resend"
import crypto from "crypto"

// Esquema de validación
const schema = z.object({
  email: z.string().email("Email inválido").max(50),
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

export async function POST(req: Request) {
  try {
    console.log("[RESEND] === INICIO DE SOLICITUD ===")
    
    const data = await req.json()
    console.log("[RESEND] Datos recibidos:", data)
    console.log("[RESEND] Solicitud de reenvío para:", data.email)

    // Validar datos
    const parsed = schema.safeParse(data)
    if (!parsed.success) {
      console.log("[RESEND] Error de validación:", parsed.error)
      return NextResponse.json({ 
        success: false,
        error: "Email inválido" 
      }, { status: 400 })
    }

    const { email } = parsed.data
    const emailKey = `resend_${email.toLowerCase()}`
    const now = Date.now()

    console.log("[RESEND] Email validado:", email)
    console.log("[RESEND] Verificando cooldown...")

    // Verificar cooldown
    if (recentResends.has(emailKey)) {
      const lastResend = recentResends.get(emailKey)!
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
      
      // PRIMERO: Verificar si existe una cuenta pendiente para este email
      const pendingResult = await pool
        .request()
        .input("email", email)
        .query("SELECT username, password, verification_token, expires_at FROM PendingAccounts WHERE email = @email")

      console.log("[RESEND] Resultado búsqueda pendiente:", pendingResult.recordset.length, "registros")

      // SEGUNDO: Verificar si ya está registrado en MEMB_INFO
      const existingResult = await pool
        .request()
        .input("email", email)
        .query("SELECT memb___id FROM MEMB_INFO WHERE mail_addr = @email")

      console.log("[RESEND] Resultado búsqueda existente:", existingResult.recordset.length, "registros")

      // ANÁLISIS DE CASOS:
      if (existingResult.recordset.length > 0) {
        // Caso 1: Email ya verificado y registrado
        console.log("[RESEND] Email ya verificado en MEMB_INFO")
        throw new Error("EMAIL_ALREADY_VERIFIED")
      }

      if (pendingResult.recordset.length === 0) {
        // Caso 2: No hay cuenta pendiente NI verificada
        console.log("[RESEND] No hay cuenta pendiente ni verificada para este email")
        throw new Error("EMAIL_NOT_FOUND")
      }

      // Caso 3: Hay cuenta pendiente, proceder con reenvío
      const pendingAccount = pendingResult.recordset[0]
      console.log("[RESEND] Cuenta pendiente encontrada:", pendingAccount.username)

      // Verificar si el token actual ha expirado
      const now = new Date()
      const expiresAt = new Date(pendingAccount.expires_at)
      console.log("[RESEND] Verificando expiración. Ahora:", now, "Expira:", expiresAt)

      if (now > expiresAt) {
        console.log("[RESEND] Token expirado, generando nuevo...")
        
        // Token expirado, generar uno nuevo
        const newToken = crypto.randomBytes(32).toString("hex")
        const newExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas

        console.log("[RESEND] Nuevo token generado, actualizando BD...")

        await pool
          .request()
          .input("email", email)
          .input("newToken", newToken)
          .input("newExpiresAt", newExpiresAt)
          .query(`
            UPDATE PendingAccounts 
            SET verification_token = @newToken, expires_at = @newExpiresAt 
            WHERE email = @email
          `)

        console.log("[RESEND] BD actualizada con nuevo token")

        return {
          username: pendingAccount.username,
          email: email,
          verificationToken: newToken
        }
      } else {
        console.log("[RESEND] Token aún válido, usando existente")
        
        // Token aún válido, usar el existente
        return {
          username: pendingAccount.username,
          email: email,
          verificationToken: pendingAccount.verification_token
        }
      }
    })

    console.log("[RESEND] Consulta BD completada, resultado:", result.username)

    // Marcar como reenviado para prevenir spam
    recentResends.set(emailKey, now)

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

    const emailResult = await sendEmail({
      to: result.email,
      subject: "Verifica tu cuenta - ETEREAL CONQUEST",
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
    p, span, div { color: #ffffff; }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <h2 style="color: #FFD700;">¡Bienvenido a ETEREAL CONQUEST!</h2>
      <p>Hola <span class="username">${result.username}</span>,</p>
      <p>Has solicitado reenviar el enlace de verificación para tu cuenta.</p>
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

    return NextResponse.json({ 
      success: true,
      message: "Email de verificación reenviado exitosamente. Revisa tu bandeja de entrada." 
    })

  } catch (err: any) {
    console.error("[RESEND] ❌ ERROR CAPTURADO:", err)
    console.error("[RESEND] Stack trace:", err.stack)

    // Manejo específico de errores
    if (err.message === "EMAIL_NOT_FOUND") {
      console.log("[RESEND] Error específico: EMAIL_NOT_FOUND")
      return NextResponse.json({ 
        success: false,
        error: "No se encontró ningún registro pendiente para este email. Asegúrate de haberte registrado primero o intenta registrarte nuevamente." 
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