import { NextResponse } from "next/server"
import { connectToDB, executeQueryWithRetry } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { token } = await req.json()

    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: "Token de verificación requerido" 
      }, { status: 400 })
    }

    console.log("Verificando token de email:", token.substring(0, 10) + "...")

    // Usar la nueva función con reintentos automáticos
    const result = await executeQueryWithRetry(async (pool) => {
      console.log("Conexión exitosa, buscando cuenta pendiente...")

      // 1. VERIFICAR QUE LAS TABLAS EXISTAN
      try {
        console.log("Verificando existencia de tablas...")
        
        const tableCheck = await pool
          .request()
          .query(`
            SELECT 
              CASE WHEN EXISTS (SELECT * FROM sysobjects WHERE name='PendingAccounts' AND xtype='U') 
                THEN 1 ELSE 0 END AS PendingExists,
              CASE WHEN EXISTS (SELECT * FROM sysobjects WHERE name='MEMB_INFO' AND xtype='U') 
                THEN 1 ELSE 0 END AS MembExists,
              CASE WHEN EXISTS (SELECT * FROM sysobjects WHERE name='EmailVerificationLog' AND xtype='U') 
                THEN 1 ELSE 0 END AS LogExists
          `)

        const tables = tableCheck.recordset[0]
        
        if (!tables.PendingExists) {
          throw new Error("MISSING_TABLE_PendingAccounts")
        }
        if (!tables.MembExists) {
          throw new Error("MISSING_TABLE_MEMB_INFO")
        }
        
        console.log("✅ Todas las tablas necesarias existen")

      } catch (tableError: any) {
        console.error("❌ Error verificando tablas:", tableError.message)
        throw tableError
      }

      // 2. BUSCAR LA CUENTA PENDIENTE CON EL TOKEN
      const pendingResult = await pool
        .request()
        .input("token", token)
        .query(`
          SELECT username, password, email, expires_at, created_at
          FROM PendingAccounts 
          WHERE verification_token = @token
        `)

      if (pendingResult.recordset.length === 0) {
        console.log("Token no encontrado")
        throw new Error("TOKEN_NOT_FOUND")
      }

      const pendingAccount = pendingResult.recordset[0]
      const now = new Date()
      const expiryDate = new Date(pendingAccount.expires_at)

      console.log("Cuenta encontrada:", pendingAccount.username)
      console.log("Token expira:", expiryDate)
      console.log("Fecha actual:", now)

      // 3. VERIFICAR SI EL TOKEN HA EXPIRADO
      if (now > expiryDate) {
        console.log("Token expirado, eliminando cuenta pendiente...")
        
        // Eliminar la cuenta pendiente expirada
        await pool
          .request()
          .input("token", token)
          .query("DELETE FROM PendingAccounts WHERE verification_token = @token")

        // Registrar en el log (si la tabla existe)
        try {
        await pool
          .request()
          .input("email", pendingAccount.email)
          .input("username", pendingAccount.username)
          .input("action", "expired")
          .input("details", "Token de verificación expirado y eliminado")
          .query(`
            INSERT INTO EmailVerificationLog (email, username, action, details)
            VALUES (@email, @username, @action, @details)
          `)
        } catch (logError: any) {
          console.warn("Advertencia: No se pudo registrar en log:", logError.message)
        }

        throw new Error("TOKEN_EXPIRED")
      }

      // 4. VERIFICAR SI EL USUARIO YA EXISTE EN MEMB_INFO
      const existingUserResult = await pool
        .request()
        .input("username", pendingAccount.username)
        .query("SELECT memb___id FROM MEMB_INFO WHERE memb___id = @username")

      if (existingUserResult.recordset.length > 0) {
        console.log("Usuario ya existe en MEMB_INFO, eliminando cuenta pendiente...")
        
        // Eliminar la cuenta pendiente
        await pool
          .request()
          .input("token", token)
          .query("DELETE FROM PendingAccounts WHERE verification_token = @token")

        throw new Error("USER_ALREADY_EXISTS")
      }

      // 5. CREAR LA CUENTA EN MEMB_INFO
      console.log("Creando cuenta en MEMB_INFO...")
      
      try {
      await pool
        .request()
        .input("username", pendingAccount.username)
        .input("password", pendingAccount.password)
        .input("email", pendingAccount.email)
        .query(`
          INSERT INTO MEMB_INFO (memb___id, memb__pwd, mail_addr, memb_name, bloc_code, ctl1_code, sno__numb) 
          VALUES (@username, @password, @email, @username, 0, 0, 'S1')
        `)

        console.log("✅ Cuenta creada exitosamente en MEMB_INFO")

      } catch (insertError: any) {
        console.error("❌ Error insertando en MEMB_INFO:", insertError.message)
        throw new Error(`DATABASE_INSERT_ERROR: ${insertError.message}`)
      }

      // 6. ELIMINAR LA CUENTA PENDIENTE
      await pool
        .request()
        .input("token", token)
        .query("DELETE FROM PendingAccounts WHERE verification_token = @token")

      console.log("✅ Cuenta pendiente eliminada")

      // 7. REGISTRAR LA VERIFICACIÓN EXITOSA EN EL LOG
      try {
      const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
      const userAgent = req.headers.get("user-agent") || "unknown"

      await pool
        .request()
        .input("email", pendingAccount.email)
        .input("username", pendingAccount.username)
        .input("action", "verified")
        .input("ipAddress", ipAddress)
        .input("userAgent", userAgent)
        .input("details", "Cuenta verificada y creada exitosamente")
        .query(`
          INSERT INTO EmailVerificationLog (email, username, action, ip_address, user_agent, details)
          VALUES (@email, @username, @action, @ipAddress, @userAgent, @details)
        `)

        console.log("✅ Verificación registrada en log")

      } catch (logError: any) {
        console.warn("Advertencia: No se pudo registrar en log:", logError.message)
      }

      console.log("🎉 Cuenta verificada y creada exitosamente:", pendingAccount.username)

      return {
        success: true,
        message: "¡Cuenta verificada exitosamente! Ya puedes iniciar sesión.",
        username: pendingAccount.username
      }
    }, 5) // Aumentar reintentos a 5

    return NextResponse.json(result)

  } catch (err: any) {
    console.error("Error en verificación de email:", err)

    // Manejo específico de errores de tablas faltantes
    if (err.message && err.message.startsWith("MISSING_TABLE_")) {
      const table = err.message.replace("MISSING_TABLE_", "")
      return NextResponse.json({ 
        success: false, 
        error: `Error de configuración: Tabla ${table} no existe. Contacta al administrador.` 
      }, { status: 500 })
    }

    // Manejo específico de errores conocidos
    if (err.message === "TOKEN_NOT_FOUND") {
      return NextResponse.json({ 
        success: false, 
        error: "Token de verificación inválido o expirado" 
      }, { status: 400 })
    }

    if (err.message === "TOKEN_EXPIRED") {
      return NextResponse.json({ 
        success: false, 
        error: "El token de verificación ha expirado. Por favor, regístrate nuevamente." 
      }, { status: 400 })
    }

    if (err.message === "USER_ALREADY_EXISTS") {
      return NextResponse.json({ 
        success: false, 
        error: "Esta cuenta ya ha sido verificada anteriormente" 
      }, { status: 400 })
    }

    if (err.message && err.message.startsWith("DATABASE_INSERT_ERROR")) {
      return NextResponse.json({ 
        success: false, 
        error: "Error al crear la cuenta. Contacta al administrador." 
      }, { status: 500 })
    }

    // Mensaje de error más descriptivo para errores de conexión
    let errorMessage = "Error en la base de datos"
    if (err.message && err.message.includes("Failed to connect")) {
      errorMessage = "No se pudo conectar a la base de datos. Por favor, inténtalo más tarde."
    } else if (err.message && err.message.includes("Login failed")) {
      errorMessage = "Error de autenticación con la base de datos. Contacta al administrador."
    } else if (err.message && err.message.includes("después de") && err.message.includes("intentos")) {
      errorMessage = "Error de conexión temporal. El sistema reintentó automáticamente pero no pudo completar la operación."
    } else if (err.message && err.message.includes("timeout")) {
      errorMessage = "Timeout de conexión. El servidor está ocupado, inténtalo en unos minutos."
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: err.message,
        code: err.code || "UNKNOWN",
      },
      { status: 500 },
    )
  }
} 