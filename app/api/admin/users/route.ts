import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"

export async function GET() {
  try {
    const pool = await connectToDB()
    const result = await pool.request().query(`SELECT TOP 50 * FROM MEMB_STAT ORDER BY ConnectTM DESC`)
    return NextResponse.json({ success: true, users: result.recordset })
  } catch (error) {
    console.error("Error al obtener usuarios:", error)
    return NextResponse.json({ success: false, error: "Error al obtener los usuarios" }, { status: 500 })
  }
}
