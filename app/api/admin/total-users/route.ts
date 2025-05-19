import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"

export async function GET() {
  try {
    const db = await connectToDB()
    const result = await db.request().query(`SELECT COUNT(*) AS total FROM MEMB_INFO`)

    return NextResponse.json({
      success: true,
      total: result.recordset[0].total,
    })
  } catch (error) {
    console.error("Error al obtener total de usuarios:", error)
    return NextResponse.json({ success: false, error: "No se pudo obtener el total de usuarios" }, { status: 500 })
  }
}
