// app/api/ranking/killers/route.ts

import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"

export async function GET() {
  try {
    console.log("[RANKING KILLERS] Iniciando consulta de ranking de PK")

    const pool = await connectToDB()

    // Verificar que la conexión se estableció correctamente
    if (!pool) {
      console.error("[RANKING KILLERS] Error: No se pudo establecer conexión con la base de datos")
      return NextResponse.json({ success: false, error: "Error de conexión a la base de datos" }, { status: 500 })
    }

    console.log("[RANKING KILLERS] Conexión establecida, ejecutando consulta")

    try {
      const result = await pool.request().query(`
        SELECT TOP 10 
          Name, 
          cLevel, 
          Class, 
          ISNULL(PkCount, 0) as PkCount
        FROM Character
        WHERE Name IS NOT NULL 
          AND cLevel IS NOT NULL 
          AND PkCount > 0
          AND (ctlcode = 0 OR ctlcode IS NULL)
        ORDER BY PkCount DESC
      `)

      console.log("[RANKING KILLERS] Consulta ejecutada correctamente, registros encontrados:", result.recordset.length)

      return NextResponse.json({
        success: true,
        ranking: result.recordset,
      })
    } catch (queryError) {
      console.error("[RANKING KILLERS] Error en la consulta SQL:", queryError)
      return NextResponse.json(
        { success: false, error: "Error al ejecutar la consulta de ranking PK" },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("[RANKING KILLERS] Error general:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
