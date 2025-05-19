import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"

export async function GET() {
  try {
    const db = await connectToDB()

    // Consulta para obtener usuarios baneados (bloc_code = 1)
    const result = await db.request().query(`
      SELECT 
        memb___id, 
        bloc_code, 
        mail_addr AS email,
        CONVERT(VARCHAR, reg_date, 120) AS registeredAt
      FROM MEMB_INFO 
      WHERE bloc_code = 1
      ORDER BY reg_date DESC
    `)

    return NextResponse.json({
      success: true,
      bans: result.recordset,
    })
  } catch (error) {
    console.error("Error al obtener usuarios baneados:", error)
    return NextResponse.json(
      {
        success: false,
        error: "No se pudo obtener los usuarios baneados",
      },
      { status: 500 },
    )
  }
}
