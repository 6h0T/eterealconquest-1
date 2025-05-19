import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"

export async function GET() {
  try {
    console.log("[RANKING ONLINE] Iniciando ranking por tiempo online")

    const pool = await connectToDB()

    if (!pool) {
      console.error("[RANKING ONLINE] Error: No se pudo conectar a la base de datos")
      return NextResponse.json({ success: false, error: "Error de conexión a la base de datos" }, { status: 500 })
    }

    const result = await pool.request().query(`
      SELECT TOP 10 memb___id, MinOnline
      FROM MEMB_STAT
      ORDER BY MinOnline DESC
    `)

    return NextResponse.json({
      success: true,
      ranking: result.recordset,
    })
  } catch (error) {
    console.error("[RANKING ONLINE] Error al obtener datos:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
