import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  let pool = null
  try {
    pool = await connectToDB()

    // Consulta simplificada que solo obtiene el conteo
    const result = await pool.request().query(`
      SELECT COUNT(*) AS OnlineCount 
      FROM MEMB_STAT 
      WHERE ConnectStat = 1
    `)

    const onlineCount = result.recordset[0].OnlineCount

    return NextResponse.json(
      {
        success: true,
        count: onlineCount,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    )
  } catch (error) {
    console.error("[ONLINE COUNT] Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al contar usuarios online",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    )
  } finally {
    if (pool) {
      try {
        await pool.close()
      } catch (err) {
        console.error("[ONLINE COUNT] Error al cerrar la conexión:", err)
      }
    }
  }
}
