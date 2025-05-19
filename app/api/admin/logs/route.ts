import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"

export async function GET() {
  try {
    const pool = await connectToDB()
    const result = await pool.request().query(`SELECT TOP 50 * FROM ActivityLogs ORDER BY Date DESC`)
    return NextResponse.json({ success: true, logs: result.recordset })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Error al obtener los logs" }, { status: 500 })
  }
}
