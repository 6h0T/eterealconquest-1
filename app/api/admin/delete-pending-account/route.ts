import { NextResponse } from "next/server"
import { executeQueryWithRetry } from "@/lib/db"

export async function DELETE(req: Request) {
  try {
    const { accountId } = await req.json()

    if (!accountId) {
      return NextResponse.json({
        success: false,
        error: "ID de cuenta requerido"
      }, { status: 400 })
    }

    console.log("[ADMIN-DELETE-PENDING] Eliminando cuenta pendiente ID:", accountId)

    const result = await executeQueryWithRetry(async (pool) => {
      // 1. Buscar la cuenta pendiente para obtener datos antes de eliminar
      const pendingResult = await pool
        .request()
        .input("accountId", accountId)
        .query(`
          SELECT username, email
          FROM PendingAccounts 
          WHERE id = @accountId
        `)

      if (pendingResult.recordset.length === 0) {
        throw new Error("Cuenta pendiente no encontrada")
      }

      const pendingAccount = pendingResult.recordset[0]
      console.log("[ADMIN-DELETE-PENDING] Cuenta encontrada:", pendingAccount.username)

      // 2. Eliminar la cuenta pendiente
      await pool
        .request()
        .input("accountId", accountId)
        .query("DELETE FROM PendingAccounts WHERE id = @accountId")

      console.log("[ADMIN-DELETE-PENDING] ✅ Cuenta pendiente eliminada")

      // 3. Registrar la eliminación en el log
      try {
        await pool
          .request()
          .input("email", pendingAccount.email)
          .input("username", pendingAccount.username)
          .input("action", "admin_deleted")
          .input("details", "Cuenta pendiente eliminada manualmente por administrador")
          .query(`
            INSERT INTO EmailVerificationLog (email, username, action, details)
            VALUES (@email, @username, @action, @details)
          `)

        console.log("[ADMIN-DELETE-PENDING] ✅ Eliminación registrada en log")
      } catch (logError: any) {
        console.warn("[ADMIN-DELETE-PENDING] Advertencia: No se pudo registrar en log:", logError.message)
      }

      return {
        success: true,
        message: "Cuenta pendiente eliminada exitosamente",
        username: pendingAccount.username
      }
    })

    return NextResponse.json(result)

  } catch (error: any) {
    console.error("[ADMIN-DELETE-PENDING] Error:", error)
    
    let errorMessage = "Error interno del servidor"
    
    if (error.message === "Cuenta pendiente no encontrada") {
      errorMessage = "No se encontró la cuenta pendiente"
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: error.message
    }, { status: 500 })
  }
} 