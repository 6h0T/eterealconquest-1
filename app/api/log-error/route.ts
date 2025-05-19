import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"
import sql from "mssql"

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Validar los datos recibidos
    if (!data.type || !data.url) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
    }

    // Conectar a la base de datos
    const pool = await connectToDB()

    // Insertar el error en la tabla de logs
    await pool
      .request()
      .input("type", sql.VarChar(50), data.type)
      .input("url", sql.VarChar(500), data.url)
      .input("referrer", sql.VarChar(500), data.referrer || null)
      .input("userAgent", sql.VarChar(500), data.userAgent || null)
      .input("timestamp", sql.DateTime, new Date())
      .query(`
        INSERT INTO ErrorLogs (type, url, referrer, userAgent, timestamp)
        VALUES (@type, @url, @referrer, @userAgent, @timestamp)
      `)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al registrar el error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
