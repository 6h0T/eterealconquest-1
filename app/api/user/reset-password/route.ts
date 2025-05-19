import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json()

    if (!token || !newPassword) {
      return NextResponse.json({ success: false, error: "Token y nueva contraseña son requeridos" }, { status: 400 })
    }

    // Validar la contraseña
    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 },
      )
    }

    const pool = await connectToDB()

    // Verificar si el token existe, no ha expirado y no ha sido usado
    const tokenResult = await pool
      .request()
      .input("token", token)
      .query(`
        SELECT username, expires_at, used 
        FROM WEBENGINE_RECOVERY_TOKENS 
        WHERE token = @token
      `)

    if (tokenResult.recordset.length === 0) {
      return NextResponse.json({ success: false, error: "Token inválido" }, { status: 400 })
    }

    const tokenData = tokenResult.recordset[0]
    const now = new Date()
    const expiryDate = new Date(tokenData.expires_at)

    if (now > expiryDate) {
      return NextResponse.json({ success: false, error: "Token expirado" }, { status: 400 })
    }

    if (tokenData.used) {
      return NextResponse.json({ success: false, error: "Token ya utilizado" }, { status: 400 })
    }

    const username = tokenData.username

    // Actualizar la contraseña del usuario
    await pool
      .request()
      .input("username", username)
      .input("newPassword", newPassword)
      .query(`
        UPDATE MEMB_INFO 
        SET memb__pwd = @newPassword 
        WHERE memb___id = @username
      `)

    // Marcar el token como usado
    await pool
      .request()
      .input("token", token)
      .query(`
        UPDATE WEBENGINE_RECOVERY_TOKENS 
        SET used = 1 
        WHERE token = @token
      `)

    return NextResponse.json({
      success: true,
      message: "Contraseña restablecida correctamente",
    })
  } catch (error) {
    console.error("[RESET PASSWORD ERROR]", error)
    return NextResponse.json({ success: false, error: "Error al restablecer la contraseña" }, { status: 500 })
  }
}
