import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { token } = await req.json()

    if (!token) {
      return NextResponse.json({ valid: false, error: "Token no proporcionado" }, { status: 400 })
    }

    const pool = await connectToDB()

    // Verificar si el token existe y no ha expirado
    const result = await pool
      .request()
      .input("token", token)
      .query(`
        SELECT username, expires_at, used 
        FROM WEBENGINE_RECOVERY_TOKENS 
        WHERE token = @token
      `)

    if (result.recordset.length === 0) {
      return NextResponse.json({ valid: false, error: "Token inválido" }, { status: 400 })
    }

    const tokenData = result.recordset[0]
    const now = new Date()
    const expiryDate = new Date(tokenData.expires_at)

    // Verificar si el token ha expirado o ya ha sido usado
    if (now > expiryDate) {
      return NextResponse.json({ valid: false, error: "Token expirado" }, { status: 400 })
    }

    if (tokenData.used) {
      return NextResponse.json({ valid: false, error: "Token ya utilizado" }, { status: 400 })
    }

    return NextResponse.json({ valid: true, username: tokenData.username })
  } catch (error) {
    console.error("[VALIDATE TOKEN ERROR]", error)
    return NextResponse.json({ valid: false, error: "Error al validar el token" }, { status: 500 })
  }
}
