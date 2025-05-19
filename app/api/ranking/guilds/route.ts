// app/api/ranking/guilds/route.ts

import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"

export async function GET() {
  try {
    console.log("[RANKING GUILDS] Iniciando consulta de ranking de guilds")

    const pool = await connectToDB()

    // Verificar que la conexión se estableció correctamente
    if (!pool) {
      console.error("[RANKING GUILDS] Error: No se pudo establecer conexión con la base de datos")
      return NextResponse.json({ success: false, error: "Error de conexión a la base de datos" }, { status: 500 })
    }

    console.log("[RANKING GUILDS] Conexión establecida, ejecutando consulta")

    try {
      const result = await pool.request().query(`
        SELECT TOP 10 
          G_Name, 
          G_Master, 
          ISNULL(G_Score, 0) as G_Score
        FROM Guild
        WHERE G_Name IS NOT NULL 
          AND G_Master IS NOT NULL
        ORDER BY G_Score DESC
      `)

      console.log("[RANKING GUILDS] Consulta ejecutada correctamente, registros encontrados:", result.recordset.length)

      return NextResponse.json({
        success: true,
        ranking: result.recordset,
      })
    } catch (queryError) {
      console.error("[RANKING GUILDS] Error en la consulta SQL:", queryError)
      return NextResponse.json(
        { success: false, error: "Error al ejecutar la consulta de ranking de guilds" },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("[RANKING GUILDS] Error general:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
