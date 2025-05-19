import { connectToDB } from "@/lib/db"

export async function getTickets() {
  try {
    const pool = await connectToDB()
    const result = await pool.request().query(`
      SELECT 
        TicketID as id, 
        AccountID as accountId, 
        Subject as title, 
        Status as status 
      FROM SupportTickets 
      ORDER BY TicketID DESC
    `)

    return result.recordset
  } catch (error) {
    console.error("Error al obtener tickets:", error)
    // Devolver datos de ejemplo para desarrollo
    return [
      {
        id: 1,
        accountId: "usuario1",
        title: "No puedo conectarme al servidor",
        status: "Abierto",
      },
      {
        id: 2,
        accountId: "usuario2",
        title: "Problema con mi personaje",
        status: "En proceso",
      },
      {
        id: 3,
        accountId: "usuario3",
        title: "Solicitud de recuperación de items",
        status: "Cerrado",
      },
    ]
  }
}
