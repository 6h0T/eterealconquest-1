import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"
import { Resend } from "resend"
import crypto from "crypto"

const resend = new Resend(process.env.RESEND_API_KEY)

function generateToken() {
  return crypto.randomBytes(32).toString("hex")
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ success: false, error: "Falta el email" }, { status: 400 })
    }

    const pool = await connectToDB()
    const result = await pool
      .request()
      .input("email", email)
      .query(`
        SELECT memb___id FROM MEMB_INFO WHERE mail_addr = @email
      `)

    if (result.recordset.length === 0) {
      return NextResponse.json({ success: false, error: "No se encontró ese correo" }, { status: 404 })
    }

    const userId = result.recordset[0].memb___id
    const token = generateToken()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

    // Corregido: Ahora apunta a PasswordRecovery2 con la estructura correcta
    await pool
      .request()
      .input("email", email)
      .input("token", token)
      .input("memb___id", userId)
      .input("expires", expiresAt)
      .query(`
        INSERT INTO PasswordRecovery2 (email, token, memb___id, expires)
        VALUES (@email, @token, @memb___id, @expires)
      `)

    // Generar el enlace de restablecimiento sin [lang]
    const resetLink = `/restablecer?token=${token}`
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ""
    const fullResetLink = baseUrl + resetLink

    await resend.emails.send({
      from: "no-reply@mu-occidental.com",
      to: email,
      subject: "Restablece tu contraseña",
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { background-color: #1a1a1a; color: #ffffff; font-family: Arial, sans-serif; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .content { background-color: #1a1a1a; padding: 20px; border-radius: 5px; }
    .button { display: inline-block; background-color: #FFD700; color: #000000 !important; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-weight: bold; margin: 20px 0; }
    .user-id { color: #FFD700; font-weight: bold; }
    .link { color: #FFD700; word-break: break-all; }
    .warning-text { color: #ffffff; margin-top: 20px; }
    .warning-icon { margin-right: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <p>Hola <span class="user-id">${userId}</span>,</p>
      <p>Has solicitado restablecer tu contraseña en MU Eterealconquest.</p>
      <p>Para continuar con el proceso, haz clic en el siguiente botón:</p>
      
      <div style="text-align: center;">
        <a href="${fullResetLink}" class="button">Restablecer Contraseña</a>
      </div>
      
      <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
      <p class="link">${fullResetLink}</p>
      
      <div class="warning-text">
        <span class="warning-icon">⚠️</span>
        <span>Este enlace expirará en 1 hora por razones de seguridad.</span>
      </div>
      
      <div style="margin-top: 20px;">
        <span class="warning-icon">🔒</span>
        <span>Si no solicitaste este cambio, puedes ignorar este mensaje. Tu cuenta permanece segura.</span>
      </div>
    </div>
  </div>
</body>
</html>
      `,
    })

    return NextResponse.json({ success: true, message: "Correo de recuperación enviado" })
  } catch (error) {
    console.error("[RECOVER PASSWORD ERROR]", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
