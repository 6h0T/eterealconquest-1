// /app/api/reset-password/route.ts
import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json({ 
        success: false, 
        error: "Faltan datos requeridos" 
      }, { status: 400 })
    }

    // Validar longitud mínima de contraseña
    if (password.length < 4 || password.length > 10) {
      return NextResponse.json({ 
        success: false, 
        error: "La contraseña debe tener entre 4 y 10 caracteres" 
      }, { status: 400 })
    }

    const db = await connectToDB()

    // Buscar el token en la base de datos
    const tokenResult = await db
      .request()
      .input("token", token)
      .query(`
        SELECT TOP 1 * FROM PasswordRecovery2
        WHERE token = @token
      `)

    if (tokenResult.recordset.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Token inválido o expirado" 
      }, { status: 400 })
    }

    const userId = tokenResult.recordset[0].memb___id

    // Actualizar la contraseña
    await db
      .request()
      .input("userId", userId)
      .input("password", password)
      .query(`
        UPDATE MEMB_INFO
        SET memb__pwd = @password
        WHERE memb___id = @userId
      `)

    // Eliminar el token usado
    await db
      .request()
      .input("token", token)
      .query(`
        DELETE FROM PasswordRecovery2 WHERE token = @token
      `)

    return NextResponse.json({ 
      success: true, 
      message: "Contraseña actualizada correctamente" 
    })

  } catch (error) {
    console.error("[RESET PASSWORD ERROR]", error)
    return NextResponse.json({ 
      success: false, 
      error: "Error interno del servidor" 
    }, { status: 500 })
  }
}
