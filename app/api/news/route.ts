import { type NextRequest, NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"

// GET - Obtener todas las noticias públicas
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)

    // Obtener parámetros de consulta
    const searchParams = url.searchParams
    const lang = searchParams.get("lang") || "es"
    const featured = searchParams.get("featured") === "true"

    // Construir consulta SQL - solo noticias activas para el público
    let sqlQuery = "SELECT * FROM News WHERE language = @lang AND status = 'active'"
    const params: any = { lang }

    if (featured) {
      sqlQuery += " AND featured = 1"
    }

    sqlQuery += " ORDER BY featured DESC, created_at DESC"

    const pool = await connectToDB()
    let requestSql = pool.request()

    // Añadir parámetros
    Object.keys(params).forEach((key) => {
      requestSql = requestSql.input(key, params[key])
    })

    const result = await requestSql.query(sqlQuery)

    return NextResponse.json(result.recordset || [])
  } catch (error) {
    console.error("Error fetching news:", error)
    return NextResponse.json(
      {
        message: "Error fetching news",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
