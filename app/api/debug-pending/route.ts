import { NextResponse } from "next/server"
import { executeQueryWithRetry } from "@/lib/db"

export async function GET() {
  try {
    console.log("[DEBUG] Consultando tabla PendingAccounts...")

    const result = await executeQueryWithRetry(async (pool) => {
      const pendingResult = await pool
        .request()
        .query("SELECT email, username, expires_at, verification_token FROM PendingAccounts")

      return pendingResult.recordset
    })

    console.log("[DEBUG] Registros encontrados:", result.length)
    
    // Ocultar tokens por seguridad en la respuesta
    const safeResult = result.map((record: any) => ({
      email: record.email,
      username: record.username,
      expires_at: record.expires_at,
      token_length: record.verification_token?.length || 0,
      is_expired: new Date() > new Date(record.expires_at)
    }))

    return NextResponse.json({
      success: true,
      count: result.length,
      records: safeResult
    })

  } catch (error: any) {
    console.error("[DEBUG] Error:", error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
} 