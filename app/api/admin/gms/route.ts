import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"

export async function GET() {
  try {
    const pool = await connectToDB()
    const result = await pool.request().query(`SELECT memb___id, name FROM MEMB_INFO WHERE admin_level >= 1`)
    return NextResponse.json({ success: true, gms: result.recordset })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Error al obtener la lista de GMs" }, { status: 500 })
  }
}
