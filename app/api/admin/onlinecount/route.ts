import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  let pool = null
  try {
    pool = await connectToDB()

    // Consulta mejorada para obtener usuarios activos
    const result = await pool.request().query(`
      SELECT 
        COUNT(*) AS OnlineCount 
      FROM MEMB_STAT 
      WHERE ConnectStat = 1
    `)

    // Obtener información adicional de los usuarios conectados
    const onlineUsers = await pool.request().query(`
      SELECT 
        MS.memb___id, 
        MS.ServerName, 
        MS.IP, 
        MS.ConnectTM,
        C.Name AS CharacterName
      FROM MEMB_STAT MS
      LEFT JOIN Character C ON MS.memb___id = C.AccountID AND C.Name = MS.GameIDC
      WHERE MS.ConnectStat = 1
      ORDER BY MS.ConnectTM DESC
    `)

    // Log para depuración
    console.log(`[ONLINE COUNT] Encontrados ${result.recordset[0].OnlineCount} usuarios online`)

    return NextResponse.json(
      {
        success: true,
        count: result.recordset[0].OnlineCount,
        users: onlineUsers.recordset,
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
        details: error instanceof Error ? error.message : String(error),
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
