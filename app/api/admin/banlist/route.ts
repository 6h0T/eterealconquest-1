import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"

export async function GET() {
  try {
    const pool = await connectToDB()
    const result = await pool.request().query(`SELECT memb___id, bloc_code FROM MEMB_INFO WHERE bloc_code != 0`)
    return NextResponse.json({ success: true, bans: result.recordset })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Error al obtener la banlist" }, { status: 500 })
  }
}
