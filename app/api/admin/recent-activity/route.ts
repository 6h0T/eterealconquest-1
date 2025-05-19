import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"

export async function GET() {
  try {
    const db = await connectToDB()
    const result = await db
      .request()
      .query(
        `SELECT TOP 10 memb___id AS username, mail_addr AS email, reg_date AS registeredAt FROM MEMB_INFO ORDER BY reg_date DESC`,
      )

    return NextResponse.json({ success: true, data: result.recordset })
  } catch (error) {
    console.error("Error al obtener actividad reciente:", error)
    return NextResponse.json({ success: false, error: "No se pudo obtener la actividad reciente" }, { status: 500 })
  }
}
