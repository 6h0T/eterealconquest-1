import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"

export async function POST(req: Request) {
  let pool = null
  try {
    const { token } = await req.json()

    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: "Token de verificación requerido" 
      }, { status: 400 })
    }

    console.log("Verificando token de email:", token.substring(0, 10) + "...")

    try {
      // Conectar a la base de datos
      pool = await connectToDB()
      console.log("Conexión exitosa, buscando cuenta pendiente...")

      // Buscar la cuenta pendiente con el token
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
        return NextResponse.json({ 
          success: false, 
          error: "Token de verificación inválido o expirado" 
        }, { status: 400 })
      }

      const pendingAccount = pendingResult.recordset[0]
      const now = new Date()
      const expiryDate = new Date(pendingAccount.expires_at)

      // Verificar si el token ha expirado
      if (now > expiryDate) {
        console.log("Token expirado")
        
        // Eliminar la cuenta pendiente expirada
        await pool
          .request()
          .input("token", token)
          .query("DELETE FROM PendingAccounts WHERE verification_token = @token")

        // Registrar en el log
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

        return NextResponse.json({ 
          success: false, 
          error: "El token de verificación ha expirado. Por favor, regístrate nuevamente." 
        }, { status: 400 })
      }

      // Verificar si el usuario ya existe en MEMB_INFO (por si acaso)
      const existingUserResult = await pool
        .request()
        .input("username", pendingAccount.username)
        .query("SELECT memb___id FROM MEMB_INFO WHERE memb___id = @username")

      if (existingUserResult.recordset.length > 0) {
        console.log("Usuario ya existe en MEMB_INFO")
        
        // Eliminar la cuenta pendiente
        await pool
          .request()
          .input("token", token)
          .query("DELETE FROM PendingAccounts WHERE verification_token = @token")

        return NextResponse.json({ 
          success: false, 
          error: "Esta cuenta ya ha sido verificada anteriormente" 
        }, { status: 400 })
      }

      // Verificar si el email ya existe en MEMB_INFO
      const existingEmailResult = await pool
        .request()
        .input("email", pendingAccount.email)
        .query("SELECT mail_addr FROM MEMB_INFO WHERE mail_addr = @email")

      if (existingEmailResult.recordset.length > 0) {
        console.log("Email ya existe en MEMB_INFO")
        
        // Eliminar la cuenta pendiente
        await pool
          .request()
          .input("token", token)
          .query("DELETE FROM PendingAccounts WHERE verification_token = @token")

        return NextResponse.json({ 
          success: false, 
          error: "Este correo electrónico ya está registrado en otra cuenta" 
        }, { status: 400 })
      }

      // Crear la cuenta en MEMB_INFO
      await pool
        .request()
        .input("username", pendingAccount.username)
        .input("password", pendingAccount.password)
        .input("email", pendingAccount.email)
        .query(`
          INSERT INTO MEMB_INFO (memb___id, memb__pwd, mail_addr, memb_name, bloc_code, ctl1_code, sno__numb) 
          VALUES (@username, @password, @email, @username, 0, 0, 'S1')
        `)

      // Eliminar la cuenta pendiente
      await pool
        .request()
        .input("token", token)
        .query("DELETE FROM PendingAccounts WHERE verification_token = @token")

      // Registrar la verificación exitosa en el log
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

      console.log("Cuenta verificada y creada exitosamente:", pendingAccount.username)

      return NextResponse.json({ 
        success: true, 
        message: "¡Cuenta verificada exitosamente! Ya puedes iniciar sesión.",
        username: pendingAccount.username
      })

    } catch (err: any) {
      console.error("Error detallado en verificación de email:", err)

      // Mensaje de error más descriptivo para el cliente
      let errorMessage = "Error en la base de datos"
      if (err.message && err.message.includes("Failed to connect")) {
        errorMessage = "No se pudo conectar a la base de datos. Por favor, inténtalo más tarde."
      } else if (err.message && err.message.includes("Login failed")) {
        errorMessage = "Error de autenticación con la base de datos. Contacta al administrador."
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
    } finally {
      if (pool) {
        try {
          await pool.close()
          console.log("Conexión a la base de datos cerrada correctamente en verificación")
        } catch (closeErr) {
          console.error("Error al cerrar la conexión en verificación:", closeErr)
        }
      }
    }
  } catch (err: any) {
    console.error("Error al procesar la solicitud de verificación:", err)
    return NextResponse.json(
      {
        success: false,
        error: "Error al procesar la solicitud",
        details: err.message,
      },
      { status: 400 },
    )
  }
} 