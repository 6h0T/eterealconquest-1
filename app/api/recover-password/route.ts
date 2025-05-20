import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"
import { Resend } from "resend"
import crypto from "crypto"

const resend = new Resend(process.env.RESEND_API_KEY)

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
      .query("SELECT memb___id FROM MEMB_INFO WHERE mail_addr = @email")

    if (result.recordset.length === 0) {
      return NextResponse.json({ success: false, error: "No se encontró ese correo" }, { status: 404 })
    }

    const username = result.recordset[0].memb___id
    const token = crypto.randomBytes(32).toString("hex")
    const expireDate = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

    await pool
      .request()
      .input("username", username)
      .input("token", token)
      .input("expires", expireDate)
      .query(`
        INSERT INTO WEBENGINE_RECOVERY_TOKENS (username, token, expires_at)
        VALUES (@username, @token, @expires)
      `)

    const resetLink = `/restablecer?token=${token}`
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ""
    const fullResetLink = baseUrl + resetLink

    await resend.emails.send({
      from: "no-reply@mu-occidental.com",
      to: email,
      subject: "Restablece tu contraseña",
      html: `<p>Has solicitado restablecer tu contraseña.</p><p>Haz clic en el siguiente enlace para continuar:</p><p><a href="${fullResetLink}">${fullResetLink}</a></p><p>Este enlace expira en 1 hora.</p><p>Si no solicitaste este cambio, ignora este mensaje.</p>`,
    })

    return NextResponse.json({ success: true, message: "Correo de recuperación enviado" })
  } catch (error) {
    console.error("[RECOVER PASSWORD ERROR]", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
