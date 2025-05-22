import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"

export async function GET(req: Request) {
  // Extraer el token de los parámetros de consulta
  const url = new URL(req.url)
  const token = url.searchParams.get("token")

  if (!token) {
    return NextResponse.json(
      { success: false, error: "Token no proporcionado" },
      { status: 400 }
    )
  }

  try {
    // Conectar a la base de datos
    const db = await connectToDB()

    // Verificar si el token existe y no ha expirado
    const tokenResult = await db
      .request()
      .input("token", token)
      .query(`
        SELECT TOP 1 * FROM PasswordRecovery2
        WHERE token = @token AND expires > GETDATE()
      `)

    if (tokenResult.recordset.length === 0) {
      console.log("[VERIFY TOKEN] Token inválido o expirado:", token.substring(0, 10) + "...")
      return NextResponse.json(
        { success: false, error: "Token inválido o expirado" },
        { status: 400 }
      )
    }

    // Token válido
    return NextResponse.json(
      { 
        success: true, 
        message: "Token válido",
        userId: tokenResult.recordset[0].memb___id 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[VERIFY TOKEN] Error:", error)
    return NextResponse.json(
      { success: false, error: "Error al verificar el token" },
      { status: 500 }
    )
  }
} 