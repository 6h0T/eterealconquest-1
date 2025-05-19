import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"

export async function GET() {
  try {
    const db = await connectToDB()

    // Consulta para obtener el total de créditos otorgados
    const totalResult = await db.request().query(`
      SELECT SUM(amount) as totalCredits
      FROM WEBENGINE_CREDITS_TRANSACTIONS
      WHERE credit_type = 'add'
    `)

    // Consulta para obtener la última transacción
    const lastTransactionResult = await db.request().query(`
      SELECT TOP 1 transaction_date
      FROM WEBENGINE_CREDITS_TRANSACTIONS
      WHERE credit_type = 'add'
      ORDER BY transaction_date DESC
    `)

    const totalCredits = totalResult.recordset[0]?.totalCredits || 0
    const lastTransaction = lastTransactionResult.recordset[0]?.transaction_date || null

    // Calcular tiempo transcurrido desde la última transacción
    let timeAgo = "No hay transacciones"
    if (lastTransaction) {
      const now = new Date()
      const transactionDate = new Date(lastTransaction)
      const diffMs = now - transactionDate
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMins / 60)
      const diffDays = Math.floor(diffHours / 24)

      if (diffDays > 0) {
        timeAgo = `hace ${diffDays} día${diffDays > 1 ? "s" : ""}`
      } else if (diffHours > 0) {
        timeAgo = `hace ${diffHours} hora${diffHours > 1 ? "s" : ""}`
      } else if (diffMins > 0) {
        timeAgo = `hace ${diffMins} minuto${diffMins > 1 ? "s" : ""}`
      } else {
        timeAgo = "hace unos segundos"
      }
    }

    return NextResponse.json({
      success: true,
      totalCredits,
      lastTransaction: timeAgo,
    })
  } catch (error) {
    console.error("Error al obtener total de créditos:", error)
    return NextResponse.json(
      {
        success: false,
        error: "No se pudo obtener el total de créditos",
      },
      { status: 500 },
    )
  }
}
