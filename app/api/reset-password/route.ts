// /app/api/reset-password/route.ts
import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"

export async function POST(req: Request) {
  try {
    // Extraer datos de la solicitud
    let requestData
    try {
      requestData = await req.json()
    } catch (parseError) {
      console.error("Error parsing request body:", parseError)
      return NextResponse.json({ success: false, error: "Error al procesar la solicitud" }, { status: 400 })
    }

    const { token, password } = requestData

    // Validar datos requeridos
    if (!token || !password) {
      return NextResponse.json({ success: false, error: "Faltan datos requeridos" }, { status: 400 })
    }

    // Validar longitud mínima de contraseña
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 },
      )
    }

    // Conectar a la base de datos
    let db
    try {
      db = await connectToDB()
    } catch (dbError) {
      console.error("Error connecting to database:", dbError)
      return NextResponse.json({ success: false, error: "Error al conectar con la base de datos" }, { status: 500 })
    }

    // Buscar el token en la tabla WEBENGINE_RECOVERY_TOKENS
    let tokenResult
    try {
      tokenResult = await db
        .request()
        .input("token", token)
        .query(`
        SELECT username, expires_at, used 
        FROM WEBENGINE_RECOVERY_TOKENS 
        WHERE token = @token
      `)

      if (tokenResult.recordset.length === 0) {
        return NextResponse.json({ success: false, error: "Token inválido o expirado" }, { status: 400 })
      }
      
      const tokenData = tokenResult.recordset[0]
      const now = new Date()
      const expiryDate = new Date(tokenData.expires_at)

      if (now > expiryDate) {
        return NextResponse.json({ success: false, error: "Token expirado" }, { status: 400 })
      }

      if (tokenData.used) {
        return NextResponse.json({ success: false, error: "Token ya utilizado" }, { status: 400 })
      }
    } catch (tokenError) {
      console.error("Error verifying token:", tokenError)
      return NextResponse.json({ success: false, error: "Error al verificar el token" }, { status: 500 })
    }

    const username = tokenResult.recordset[0].username

    // Actualizar la contraseña
    try {
      await db
        .request()
        .input("username", username)
        .input("newPassword", password)
        .query(`
          UPDATE MEMB_INFO
          SET memb__pwd = @newPassword
          WHERE memb___id = @username
        `)
    } catch (updateError) {
      console.error("Error updating password:", updateError)
      return NextResponse.json({ success: false, error: "Error al actualizar la contraseña" }, { status: 500 })
    }

    // Marcar el token como usado
    try {
      await db
        .request()
        .input("token", token)
        .query(`
        UPDATE WEBENGINE_RECOVERY_TOKENS
        SET used = 1
        WHERE token = @token
      `)
    } catch (deleteError) {
      console.error("Error updating token status:", deleteError)
      // No interrumpimos el flujo si falla la actualización del token
    }

    // Respuesta exitosa
    return NextResponse.json({ success: true, message: "Contraseña actualizada correctamente" })
  } catch (error) {
    // Capturar cualquier error no manejado
    console.error("Error al restablecer la contraseña:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
