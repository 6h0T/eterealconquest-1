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
    const data = await req.json()
    console.log("[RESEND] Solicitud de reenvío para:", data.email)

    // Validar datos
    const parsed = schema.safeParse(data)
    if (!parsed.success) {
      return NextResponse.json({ 
        success: false,
        error: "Email inválido" 
      }, { status: 400 })
    }

    const { email } = parsed.data
    const emailKey = `resend_${email.toLowerCase()}`
    const now = Date.now()

    // Verificar cooldown
    if (recentResends.has(emailKey)) {
      const lastResend = recentResends.get(emailKey)!
      const timeLeft = RESEND_COOLDOWN - (now - lastResend)
      if (timeLeft > 0) {
        return NextResponse.json({ 
          success: false,
          error: `Debes esperar ${Math.ceil(timeLeft / 1000)} segundos antes de reenviar` 
        }, { status: 429 })
      }
    }

    const result = await executeQueryWithRetry(async (pool) => {
      // Verificar si existe una cuenta pendiente para este email
      const pendingResult = await pool
        .request()
        .input("email", email)
        .query("SELECT username, password, verification_token, expires_at FROM PendingAccounts WHERE email = @email")

      if (pendingResult.recordset.length === 0) {
        // Verificar si ya está registrado
        const existingResult = await pool
          .request()
          .input("email", email)
          .query("SELECT memb___id FROM MEMB_INFO WHERE mail_addr = @email")

        if (existingResult.recordset.length > 0) {
          throw new Error("EMAIL_ALREADY_VERIFIED")
        } else {
          throw new Error("EMAIL_NOT_FOUND")
        }
      }

      const pendingAccount = pendingResult.recordset[0]

      // Verificar si el token actual ha expirado
      const now = new Date()
      const expiresAt = new Date(pendingAccount.expires_at)

      if (now > expiresAt) {
        // Token expirado, generar uno nuevo
        const newToken = crypto.randomBytes(32).toString("hex")
        const newExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas

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

        return {
          username: pendingAccount.username,
          email: email,
          verificationToken: newToken
        }
      } else {
        // Token aún válido, usar el existente
        return {
          username: pendingAccount.username,
          email: email,
          verificationToken: pendingAccount.verification_token
        }
      }
    })

    // Marcar como reenviado para prevenir spam
    recentResends.set(emailKey, now)

    // Enviar email de verificación
    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/es/verificar-email?token=${result.verificationToken}`

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

    if (!emailResult.success) {
      console.error("[RESEND] Error enviando email:", emailResult.error)
      return NextResponse.json({ 
        success: false,
        error: "Error enviando el email. Inténtalo más tarde." 
      }, { status: 500 })
    }

    console.log(`[RESEND] Email reenviado exitosamente a: ${result.email}`)

    return NextResponse.json({ 
      success: true,
      message: "Email de verificación reenviado exitosamente. Revisa tu bandeja de entrada." 
    })

  } catch (err: any) {
    console.error("[RESEND] Error:", err)

    // Manejo específico de errores
    if (err.message === "EMAIL_NOT_FOUND") {
      return NextResponse.json({ 
        success: false,
        error: "No se encontró ningún registro pendiente para este email. Intenta registrarte nuevamente." 
      }, { status: 404 })
    }

    if (err.message === "EMAIL_ALREADY_VERIFIED") {
      return NextResponse.json({ 
        success: false,
        error: "Esta cuenta ya ha sido verificada. Puedes iniciar sesión directamente." 
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: "Error interno del servidor. Inténtalo más tarde.",
      details: err.message,
    }, { status: 500 })
  }
} 