// /app/api/admin/connection-history/route.ts
import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { accountId } = await req.json()

    if (!accountId) {
      return NextResponse.json({ success: false, error: "ID de cuenta requerido" }, { status: 400 })
    }

    const pool = await connectToDB()

    // Consulta para obtener el historial de conexiones
    // Primero intentamos obtener de MEMB_STAT_LOG si existe
    let connectionHistory = []

    try {
      // Intentar consultar la tabla MEMB_STAT_LOG (si existe)
      const logResult = await pool
        .request()
        .input("accountId", accountId)
        .query(`
          SELECT IP, ConnectTM, DisConnectTM, ServerName
          FROM MEMB_STAT_LOG
          WHERE memb___id = @accountId
          ORDER BY ConnectTM DESC
        `)

      connectionHistory = logResult.recordset
    } catch (error) {
      console.log("La tabla MEMB_STAT_LOG no existe o no es accesible, usando MEMB_STAT")

      // Si no existe MEMB_STAT_LOG, obtenemos de MEMB_STAT
      const statResult = await pool
        .request()
        .input("accountId", accountId)
        .query(`
          SELECT IP, ConnectTM, DisConnectTM, ServerName
          FROM MEMB_STAT
          WHERE memb___id = @accountId
        `)

      connectionHistory = statResult.recordset
    }

    // Si no hay datos en ninguna tabla, intentamos obtener datos de CONNECTSTAT
    if (connectionHistory.length === 0) {
      try {
        const connectStatResult = await pool
          .request()
          .input("accountId", accountId)
          .query(`
            SELECT IP_ADDRESS as IP, CONNECT_TIME as ConnectTM, DISCONNECT_TIME as DisConnectTM, SERVER_NAME as ServerName
            FROM CONNECTSTAT
            WHERE ACCOUNT_ID = @accountId
            ORDER BY CONNECT_TIME DESC
          `)

        connectionHistory = connectStatResult.recordset
      } catch (error) {
        console.log("La tabla CONNECTSTAT no existe o no es accesible")
      }
    }

    // Obtener IPs únicas para estadísticas
    const uniqueIPs = new Set()
    connectionHistory.forEach((record) => {
      if (record.IP) uniqueIPs.add(record.IP)
    })

    return NextResponse.json({
      success: true,
      data: {
        connections: connectionHistory,
        stats: {
          totalConnections: connectionHistory.length,
          uniqueIPs: Array.from(uniqueIPs),
          uniqueIPCount: uniqueIPs.size,
        },
      },
    })
  } catch (error) {
    console.error("[CONNECTION HISTORY] Error:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
