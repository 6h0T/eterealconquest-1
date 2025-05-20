import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"
import { Resend } from "resend"
import crypto from "crypto"
import sql from "mssql"

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
        SELECT m.memb___id, ms.memb__id 
        FROM MEMB_INFO m
        INNER JOIN MEMB_STAT ms ON m.memb___id = ms.memb___id
        WHERE m.mail_addr = @email
      `)

    if (result.recordset.length === 0) {
      return NextResponse.json({ success: false, error: "No se encontró ese correo" }, { status: 404 })
    }

    const userId = result.recordset[0].memb__id
    const token = generateToken()

    // Insertar el token en la base de datos
    await pool
      .request()
      .input("email", sql.VarChar, email)
      .input("token", sql.VarChar, token)
      .input("memb___id", sql.VarChar, userId)
      .input("expires", sql.DateTime, new Date(Date.now() + 1000 * 60 * 30)) // 30 min
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
      html: `<p>Has solicitado restablecer tu contraseña.</p><p>Haz clic en el siguiente enlace para continuar:</p><p><a href="${fullResetLink}">${fullResetLink}</a></p><p>Este enlace expira en 30 minutos.</p><p>Si no solicitaste este cambio, ignora este mensaje.</p>`,
    })

    return NextResponse.json({ success: true, message: "Correo de recuperación enviado" })
  } catch (error) {
    console.error("[RECOVER PASSWORD ERROR]", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
