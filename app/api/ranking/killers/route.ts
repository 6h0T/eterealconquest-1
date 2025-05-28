// app/api/ranking/killers/route.ts

import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"

export async function GET(request: Request) {
  try {
    console.log("[RANKING KILLERS] Iniciando consulta de ranking de PK")
    
    // Obtener el número de página de los parámetros de la URL
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '50');
    
    // Calcular el offset para la paginación
    const offset = (page - 1) * pageSize;

    const pool = await connectToDB()

    // Verificar que la conexión se estableció correctamente
    if (!pool) {
      console.error("[RANKING KILLERS] Error: No se pudo establecer conexión con la base de datos")
      return NextResponse.json({ success: false, error: "Error de conexión a la base de datos" }, { status: 500 })
    }

    console.log("[RANKING KILLERS] Conexión establecida, ejecutando consulta")

    try {
      // Consulta paginada
      const result = await pool.request().query(`
        SELECT 
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
        OFFSET ${offset} ROWS
        FETCH NEXT ${pageSize} ROWS ONLY
      `)
      
      // Consulta para obtener el total de registros
      const countResult = await pool.request().query(`
        SELECT COUNT(*) as total
        FROM Character
        WHERE Name IS NOT NULL 
          AND cLevel IS NOT NULL 
          AND PkCount > 0
          AND (ctlcode = 0 OR ctlcode IS NULL)
      `)

      const total = countResult.recordset[0].total;
      const totalPages = Math.ceil(total / pageSize);

      console.log("[RANKING KILLERS] Consulta ejecutada correctamente, registros encontrados:", result.recordset.length)

      return NextResponse.json({
        success: true,
        ranking: result.recordset,
        pagination: {
          page,
          pageSize,
          total,
          totalPages
        }
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
