// lib/admin/online-time.ts

import { connectToDB } from "@/lib/db"

export async function getOnlineTimeRanking() {
  try {
    const pool = await connectToDB()
    const result = await pool.request().query(`
      SELECT TOP 20
        memb___id,
        CONVERT(INT,ISNULL(ConnectTime,0)) AS MinOnline
      FROM MEMB_STAT
      ORDER BY MinOnline DESC
    `)

    return result.recordset
  } catch (error) {
    console.error("Error al obtener ranking de tiempo online:", error)
    // Devolver datos de ejemplo para desarrollo
    return [
      { memb___id: "usuario1", MinOnline: 1200 },
      { memb___id: "usuario2", MinOnline: 900 },
      { memb___id: "usuario3", MinOnline: 600 },
    ]
  }
}
