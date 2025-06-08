import { NextResponse } from "next/server"
import { executeQueryWithRetry } from "@/lib/db"

export async function GET(req: Request) {
  try {
    console.log("[ADMIN-PENDING] Obteniendo cuentas pendientes...")

    const result = await executeQueryWithRetry(async (pool) => {
      const pendingResult = await pool
        .request()
        .query(`
          SELECT 
            id,
            username,
            email,
            created_at,
            expires_at,
            ip_address,
            user_agent,
            verification_token
          FROM PendingAccounts 
          ORDER BY created_at DESC
        `)

      console.log(`[ADMIN-PENDING] ${pendingResult.recordset.length} cuentas encontradas`)

      return {
        success: true,
        accounts: pendingResult.recordset
      }
    })

    return NextResponse.json(result)

  } catch (error: any) {
    console.error("[ADMIN-PENDING] Error:", error)
    return NextResponse.json({
      success: false,
      error: "Error al obtener cuentas pendientes: " + error.message
    }, { status: 500 })
  }
} 