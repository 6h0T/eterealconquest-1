import { type NextRequest, NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"
import sql from "mssql"

// GET - Obtener una noticia pública por ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const pool = await connectToDB()
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT * FROM News WHERE id = @id AND status = 'active'")

    if (!result.recordset || result.recordset.length === 0) {
      return NextResponse.json({ message: "News not found" }, { status: 404 })
    }

    return NextResponse.json(result.recordset[0])
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
