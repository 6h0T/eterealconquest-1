import { connectToDB } from "@/lib/db"

export async function getGMs() {
  try {
    const pool = await connectToDB()
    const result = await pool.request().query(`
      SELECT 
        Name 
      FROM Character 
      WHERE CtlCode = 8
    `)

    return result.recordset
  } catch (error) {
    console.error("Error al obtener lista de GMs:", error)
    // Devolver datos de ejemplo para desarrollo
    return [{ Name: "GameMaster1" }, { Name: "GameMaster2" }, { Name: "AdminSupremo" }]
  }
}
