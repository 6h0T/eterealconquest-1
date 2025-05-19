// /app/api/user/accountinfo/route.ts
import { connectToDB } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { email } = await req.json()

  if (!email) {
    return NextResponse.json({ success: false, error: "Email requerido" }, { status: 400 })
  }

  try {
    const pool = await connectToDB()

    const query = `
      SELECT 
        m.memb___id AS username,
        m.mail_addr AS email,
        s.ConnectStat AS isOnline,
        s.IP AS lastIP,
        CONVERT(VARCHAR, s.ConnectTM, 120) AS lastLogin,
        CONVERT(VARCHAR, m.memb_regdate, 120) AS registerDate,
        m.blok_code AS blocked
      FROM MEMB_INFO m
      LEFT JOIN MEMB_STAT s ON m.memb___id = s.memb___id
      WHERE m.mail_addr = @email
    `

    const result = await pool.request().input("email", email).query(query)

    if (result.recordset.length === 0) {
      return NextResponse.json({ success: false, error: "Usuario no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: result.recordset[0] })
  } catch (error) {
    console.error("[ACCOUNT INFO] Error al obtener datos:", error)
    return NextResponse.json({ success: false, error: "Error del servidor" }, { status: 500 })
  }
}
