import { connectToDB } from "@/lib/db"

export async function getUsers() {
  try {
    const pool = await connectToDB()
    const result = await pool.request().query(`
      SELECT 
        memb___id, 
        memb_name, 
        memb_reg_date 
      FROM MEMB_INFO 
      ORDER BY memb_reg_date DESC
    `)

    return result.recordset
  } catch (error) {
    console.error("Error al obtener usuarios:", error)
    // Devolver datos de ejemplo para desarrollo
    return [
      {
        memb___id: "usuario1",
        memb_name: "Usuario Ejemplo 1",
        memb_reg_date: new Date().toISOString(),
      },
      {
        memb___id: "usuario2",
        memb_name: "Usuario Ejemplo 2",
        memb_reg_date: new Date(Date.now() - 86400000).toISOString(), // 1 día antes
      },
      {
        memb___id: "usuario3",
        memb_name: "Usuario Ejemplo 3",
        memb_reg_date: new Date(Date.now() - 172800000).toISOString(), // 2 días antes
      },
    ]
  }
}
