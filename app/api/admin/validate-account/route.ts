import { NextResponse } from "next/server"
import { executeQueryWithRetry } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { accountId } = await req.json()

    if (!accountId) {
      return NextResponse.json({
        success: false,
        error: "ID de cuenta requerido"
      }, { status: 400 })
    }

    console.log("[ADMIN-VALIDATE] Validando cuenta ID:", accountId)

    const result = await executeQueryWithRetry(async (pool) => {
      // 1. Buscar la cuenta pendiente
      const pendingResult = await pool
        .request()
        .input("accountId", accountId)
        .query(`
          SELECT username, password, email, expires_at, created_at
          FROM PendingAccounts 
          WHERE id = @accountId
        `)

      if (pendingResult.recordset.length === 0) {
        throw new Error("Cuenta pendiente no encontrada")
      }

      const pendingAccount = pendingResult.recordset[0]
      console.log("[ADMIN-VALIDATE] Cuenta encontrada:", pendingAccount.username)

      // 2. Verificar si el usuario ya existe en MEMB_INFO
      const existingUserResult = await pool
        .request()
        .input("username", pendingAccount.username)
        .query("SELECT memb___id FROM MEMB_INFO WHERE memb___id = @username")

      if (existingUserResult.recordset.length > 0) {
        // Eliminar la cuenta pendiente si ya existe el usuario
        await pool
          .request()
          .input("accountId", accountId)
          .query("DELETE FROM PendingAccounts WHERE id = @accountId")

        throw new Error("El usuario ya existe en MEMB_INFO")
      }

      // 3. Crear la cuenta en MEMB_INFO
      console.log("[ADMIN-VALIDATE] Creando cuenta en MEMB_INFO...")
      
      await pool
        .request()
        .input("username", pendingAccount.username)
        .input("password", pendingAccount.password)
        .input("email", pendingAccount.email)
        .query(`
          INSERT INTO MEMB_INFO (memb___id, memb__pwd, mail_addr, memb_name, bloc_code, ctl1_code, sno__numb) 
          VALUES (@username, @password, @email, @username, 0, 0, 'S1')
        `)

      console.log("[ADMIN-VALIDATE] ✅ Cuenta creada exitosamente en MEMB_INFO")

      // 4. Eliminar la cuenta pendiente
      await pool
        .request()
        .input("accountId", accountId)
        .query("DELETE FROM PendingAccounts WHERE id = @accountId")

      console.log("[ADMIN-VALIDATE] ✅ Cuenta pendiente eliminada")

      // 5. Registrar la verificación manual en el log
      try {
        await pool
          .request()
          .input("email", pendingAccount.email)
          .input("username", pendingAccount.username)
          .input("action", "admin_validated")
          .input("details", "Cuenta validada manualmente por administrador")
          .query(`
            INSERT INTO EmailVerificationLog (email, username, action, details)
            VALUES (@email, @username, @action, @details)
          `)

        console.log("[ADMIN-VALIDATE] ✅ Verificación registrada en log")
      } catch (logError: any) {
        console.warn("[ADMIN-VALIDATE] Advertencia: No se pudo registrar en log:", logError.message)
      }

      return {
        success: true,
        message: "Cuenta validada exitosamente",
        username: pendingAccount.username
      }
    }, 5) // Aumentar reintentos

    return NextResponse.json(result)

  } catch (error: any) {
    console.error("[ADMIN-VALIDATE] Error:", error)
    
    let errorMessage = "Error interno del servidor"
    
    if (error.message === "Cuenta pendiente no encontrada") {
      errorMessage = "No se encontró la cuenta pendiente"
    } else if (error.message === "El usuario ya existe en MEMB_INFO") {
      errorMessage = "Esta cuenta ya ha sido validada previamente"
    } else if (error.message.includes("DATABASE_INSERT_ERROR")) {
      errorMessage = "Error al crear la cuenta en la base de datos"
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: error.message
    }, { status: 500 })
  }
} 