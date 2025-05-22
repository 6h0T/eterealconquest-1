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
      subject: "Restablece tu contraseña",
      html: `<p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p><p><a href="${fullResetLink}">${fullResetLink}</a></p>`,
    })

    return NextResponse.json({ success: true, message: "Correo de recuperación enviado" })
  } catch (error) {
    console.error("[RECOVER PASSWORD ERROR]", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
