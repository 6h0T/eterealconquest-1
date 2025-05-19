import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"
import crypto from "crypto"
import { sendEmail } from "@/lib/resend"

export async function POST(req: Request) {
  const { email } = await req.json()

  if (!email) {
    return NextResponse.json({ success: false, error: "Email requerido" }, { status: 400 })
  }

  try {
    const pool = await connectToDB()

    const checkUser = await pool
      .request()
      .input("email", email)
      .query("SELECT memb___id FROM MEMB_INFO WHERE mail_addr = @email")

    if (checkUser.recordset.length === 0) {
      return NextResponse.json({ success: false, error: "Email no registrado" }, { status: 404 })
    }

    const username = checkUser.recordset[0].memb___id
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

    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`

    const emailResult = await sendEmail({
      to: email,
      subject: "Restablece tu contraseña",
      html: `<p>Hola ${username},</p><p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Este enlace expira en 1 hora.</p>`,
    })

    if (!emailResult.success) {
      return NextResponse.json({ success: false, error: "Error al enviar el correo electrónico" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Correo de recuperación enviado" })
  } catch (error) {
    console.error("[FORGOT PASSWORD ERROR]", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
