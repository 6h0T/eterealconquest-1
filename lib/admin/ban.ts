import { connectToDB } from "@/lib/db"

export async function getBannedUsers() {
  try {
    const pool = await connectToDB()
    const result = await pool.request().query(`
      SELECT 
        memb___id, 
        blok_code, 
        ConnectStat 
      FROM MEMB_INFO 
      WHERE blok_code = 1
    `)

    return result.recordset
  } catch (error) {
    console.error("Error al obtener baneados:", error)
    // Devolver datos de ejemplo para desarrollo
    return [
      {
        memb___id: "usuario_baneado1",
        blok_code: 1,
        ConnectStat: new Date().toISOString(),
      },
      {
        memb___id: "usuario_baneado2",
        blok_code: 1,
        ConnectStat: new Date(Date.now() - 86400000).toISOString(), // 1 día antes
      },
    ]
  }
}
