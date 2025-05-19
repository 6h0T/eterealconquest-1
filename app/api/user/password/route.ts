// app/api/user/password/route.ts
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

    const { username, newPassword, currentPassword } = requestData

    // Validar datos requeridos
    if (!username || !newPassword || !currentPassword) {
      return NextResponse.json(
        { success: false, error: "Se requieren nombre de usuario, contraseña actual y nueva contraseña" },
        { status: 400 },
      )
    }

    // Validar longitud mínima de contraseña
    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "La nueva contraseña debe tener al menos 6 caracteres" },
        { status: 400 },
      )
    }

    // Conectar a la base de datos
    let pool
    try {
      pool = await connectToDB()
    } catch (dbError) {
      console.error("Error connecting to database:", dbError)
      return NextResponse.json({ success: false, error: "Error al conectar con la base de datos" }, { status: 500 })
    }

    // Verificar la contraseña actual
    try {
      const checkResult = await pool
        .request()
        .input("username", username)
        .input("currentPassword", currentPassword)
        .query(`
          SELECT memb___id FROM MEMB_INFO 
          WHERE memb___id = @username AND memb__pwd = @currentPassword
        `)

      if (checkResult.recordset.length === 0) {
        return NextResponse.json({ success: false, error: "Contraseña actual incorrecta" }, { status: 401 })
      }
    } catch (verifyError) {
      console.error("Error verifying current password:", verifyError)
      return NextResponse.json({ success: false, error: "Error al verificar la contraseña actual" }, { status: 500 })
    }

    // Actualizar la contraseña
    try {
      await pool
        .request()
        .input("username", username)
        .input("newPassword", newPassword)
        .query(`
          UPDATE MEMB_INFO 
          SET memb__pwd = @newPassword 
          WHERE memb___id = @username
        `)
    } catch (updateError) {
      console.error("Error updating password:", updateError)
      return NextResponse.json({ success: false, error: "Error al actualizar la contraseña" }, { status: 500 })
    }

    // Opcional: Registrar el cambio de contraseña en una tabla de logs
    try {
      await pool
        .request()
        .input("username", username)
        .query(`
          INSERT INTO WEBENGINE_PASSWORD_CHANGE_LOG (username, change_date, ip_address)
          VALUES (@username, GETDATE(), '')
        `)
    } catch (logError) {
      // Solo registramos el error pero no interrumpimos el flujo exitoso
      console.error("Error al registrar cambio de contraseña:", logError)
    }

    // Respuesta exitosa
    return NextResponse.json({
      success: true,
      message: "Contraseña actualizada correctamente",
    })
  } catch (error) {
    // Capturar cualquier error no manejado
    console.error("[USER PASSWORD CHANGE ERROR]", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
