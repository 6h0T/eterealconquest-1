import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"

export async function GET() {
  try {
    console.log("[RANKING LEVEL] Iniciando ranking por nivel con guilds")

    const pool = await connectToDB()

    if (!pool) {
      console.error("[RANKING LEVEL] Error: No se pudo conectar a la base de datos")
      return NextResponse.json({ success: false, error: "Error de conexión a la base de datos" }, { status: 500 })
    }

    const result = await pool.request().query(`
      SELECT TOP 10 
        C.Name, 
        C.cLevel, 
        C.Class, 
        ISNULL(GM.G_Name, 'Sin Guild') AS Guild
      FROM Character C
      LEFT JOIN GuildMember GM ON C.Name = GM.Name
      WHERE C.Name IS NOT NULL AND C.cLevel IS NOT NULL
      ORDER BY C.cLevel DESC
    `)

    return NextResponse.json({
      success: true,
      ranking: result.recordset,
    })
  } catch (error) {
    console.error("[RANKING LEVEL] Error al obtener datos:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
