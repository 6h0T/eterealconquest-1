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

    // Usar una URL relativa en lugar de absoluta
    const resetLink = `/restablecer?token=${token}`
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ""
    const fullResetLink = baseUrl + resetLink

    await resend.emails.send({
      from: "no-reply@mu-occidental.com",
      to: email,
      subject: "Restablece tu contraseña - MU EterealConquest",
      html: `
          <div style="background-color: #2a2a2a; padding: 20px; border-radius: 5px; margin-bottom: 20px; color: #ffffff;">
            <p style="color: #ffffff;">Hola <strong style="color: #ffd700;">${userId}</strong>,</p>
            <p style="color: #ffffff;">Has solicitado restablecer tu contraseña en MU Eterealconquest.</p>
            <p style="color: #ffffff;">Para continuar con el proceso, haz clic en el siguiente botón:</p>
              
            <div style="text-align: center; margin: 25px 0;">
              <a href="${fullResetLink}" 
                 style="background: linear-gradient(to right, #ffd700, #ffed4a);
                        color: #000000;
                        text-decoration: none;
                        padding: 12px 25px;
                        border-radius: 5px;
                        font-weight: bold;
                        display: inline-block;">
                Restablecer Contraseña
              </a>
            </div>
              
            <p style="margin-bottom: 15px; font-size: 13px; color: #ffffff !important;">
              <span style="color: #ffffff !important;">Si el botón no funciona, copia y pega este enlace en tu navegador:</span>
              <br>
              <a href="${fullResetLink}" style="color: #ffd700; word-break: break-all;">${fullResetLink}</a>
            </p>
            
            <div style="border-top: 1px solid #333333; padding-top: 20px; margin-top: 20px; font-size: 12px; color: #ffffff;">
              <p style="margin-bottom: 10px; color: #ffffff;">⚠️ Este enlace expirará en 1 hora por razones de seguridad.</p>
              <p style="margin-bottom: 10px; color: #ffffff;">🔒 Si no solicitaste este cambio, puedes ignorar este mensaje. Tu cuenta permanece segura.</p>
              <p style="margin: 0; color: #ffffff;">© ${new Date().getFullYear()} MU Eterealconquest - Todos los derechos reservados</p>
            </div>
          </div>
        `,
    })

    return NextResponse.json({ success: true, message: "Correo de recuperación enviado" })
  } catch (error) {
    console.error("[RECOVER PASSWORD ERROR]", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
