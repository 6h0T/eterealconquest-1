import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"

export async function GET() {
  try {
    const db = await connectToDB()

    // Consulta para obtener usuarios activos desde MEMB_STAT
    const result = await db.request().query(`
      SELECT 
        COUNT(DISTINCT memb___id) AS activeUsers
      FROM MEMB_STAT
      WHERE ConnectStat = 1
    `)

    // Si no hay usuarios activos, devolver 0
    const activeUsers = result.recordset[0]?.activeUsers || 0

    // Obtener tendencia (ejemplo: +12% desde la semana pasada)
    // Esto es un ejemplo, deberías adaptarlo a tus necesidades
    const lastWeekResult = await db.request().query(`
      SELECT 
        COUNT(DISTINCT memb___id) AS lastWeekUsers
      FROM MEMB_STAT_HISTORY
      WHERE 
        ConnectStat = 1 AND
        ConnectTM >= DATEADD(week, -1, GETDATE()) AND
        ConnectTM < GETDATE()
    `)

    const lastWeekUsers = lastWeekResult.recordset[0]?.lastWeekUsers || 0
    let trend = 0
    if (lastWeekUsers > 0) {
      trend = Math.round(((activeUsers - lastWeekUsers) / lastWeekUsers) * 100)
    }

    return NextResponse.json({
      success: true,
      activeUsers,
      trend,
    })
  } catch (error) {
    console.error("Error al obtener usuarios activos:", error)
    return NextResponse.json(
      {
        success: false,
        error: "No se pudo obtener los usuarios activos",
      },
      { status: 500 },
    )
  }
}
