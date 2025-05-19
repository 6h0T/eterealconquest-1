import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"

export async function GET() {
  try {
    const db = await connectToDB()

    // Consulta para obtener las últimas transacciones de créditos
    const result = await db.request().query(`
      SELECT TOP 10 
        id, 
        account_id AS username, 
        credit_type, 
        amount, 
        transaction_date,
        description
      FROM WEBENGINE_CREDITS_TRANSACTIONS 
      ORDER BY transaction_date DESC
    `)

    // Formatear las fechas para mostrar tiempo relativo
    const transactions = result.recordset.map((transaction) => {
      const now = new Date()
      const transactionDate = new Date(transaction.transaction_date)
      const diffMs = now - transactionDate
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMins / 60)
      const diffDays = Math.floor(diffHours / 24)

      let timeAgo
      if (diffDays > 0) {
        timeAgo = `hace ${diffDays} día${diffDays > 1 ? "s" : ""}`
      } else if (diffHours > 0) {
        timeAgo = `hace ${diffHours} hora${diffHours > 1 ? "s" : ""}`
      } else if (diffMins > 0) {
        timeAgo = `hace ${diffMins} minuto${diffMins > 1 ? "s" : ""}`
      } else {
        timeAgo = "hace unos segundos"
      }

      return {
        ...transaction,
        timeAgo,
        formattedDate: transactionDate.toLocaleString("es-ES"),
      }
    })

    return NextResponse.json({
      success: true,
      transactions,
    })
  } catch (error) {
    console.error("Error al obtener transacciones recientes:", error)
    return NextResponse.json(
      {
        success: false,
        error: "No se pudo obtener las transacciones recientes",
      },
      { status: 500 },
    )
  }
}
