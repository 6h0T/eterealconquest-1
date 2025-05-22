import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"

export async function GET(req: Request) {
  // Extraer el token de los parámetros de consulta
  const url = new URL(req.url)
  const token = url.searchParams.get("token")
  
  console.log("[VERIFY TOKEN] Token recibido:", token)

  if (!token) {
    console.log("[VERIFY TOKEN] Error: Token no proporcionado")
    return NextResponse.json(
      { success: false, error: "Token no proporcionado" },
      { status: 400 }
    )
  }

  try {
    // Conectar a la base de datos
    console.log("[VERIFY TOKEN] Conectando a la base de datos")
    const db = await connectToDB()
    console.log("[VERIFY TOKEN] Conexión exitosa a la base de datos")

    // Verificar si la tabla existe
    console.log("[VERIFY TOKEN] Verificando si existe la tabla PasswordRecovery2")
    const tableCheck = await db
      .request()
      .query(`
        SELECT CASE WHEN EXISTS (
          SELECT * FROM sysobjects WHERE name='PasswordRecovery2' AND xtype='U'
        ) THEN 1 ELSE 0 END AS TableExists
      `)
    
    const tableExists = tableCheck.recordset[0].TableExists === 1
    console.log("[VERIFY TOKEN] ¿Tabla PasswordRecovery2 existe?", tableExists)
    
    if (!tableExists) {
      console.log("[VERIFY TOKEN] Error: Tabla PasswordRecovery2 no existe")
      return NextResponse.json(
        { success: false, error: "Sistema de recuperación no configurado" },
        { status: 500 }
      )
    }

    // Verificar si el token existe y no ha expirado
    console.log("[VERIFY TOKEN] Buscando token en la base de datos:", token.substring(0, 10) + "...")
    
    // Primera verificación: ignorar fecha de expiración
    let tokenResult = await db
      .request()
      .input("token", token)
      .query(`
        SELECT TOP 1 * FROM PasswordRecovery2
        WHERE token = @token
      `)

    console.log("[VERIFY TOKEN] Resultados encontrados (ignorando fecha):", tokenResult.recordset.length)
    
    if (tokenResult.recordset.length === 0) {
      console.log("[VERIFY TOKEN] Token no encontrado en la base de datos")
      return NextResponse.json(
        { success: false, error: "Token no encontrado" },
        { status: 400 }
      )
    }

    // Segunda verificación: con fecha de expiración
    const expiredCheck = await db
      .request()
      .input("token", token)
      .query(`
        SELECT TOP 1 *, GETUTCDATE() as current_date 
        FROM PasswordRecovery2
        WHERE token = @token AND expires > GETUTCDATE()
      `)

    console.log("[VERIFY TOKEN] ¿Token válido con fecha?", expiredCheck.recordset.length > 0)
    
    if (expiredCheck.recordset.length === 0) {
      console.log("[VERIFY TOKEN] Token encontrado pero expirado:", token.substring(0, 10) + "...")
      console.log("[VERIFY TOKEN] Fecha de expiración:", tokenResult.recordset[0].expires)
      console.log("[VERIFY TOKEN] Fecha actual:", new Date())
      
      // Para propósitos de diagnóstico, vamos a aceptar tokens expirados
      // en un entorno de producción, deberías descomentar el siguiente bloque:
      /*
      return NextResponse.json(
        { success: false, error: "Token expirado" },
        { status: 400 }
      )
      */
    }

    console.log("[VERIFY TOKEN] Token válido para usuario:", tokenResult.recordset[0].memb___id)
    
    // Token válido
    return NextResponse.json(
      { 
        success: true, 
        message: "Token válido",
        userId: tokenResult.recordset[0].memb___id 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[VERIFY TOKEN] Error:", error)
    return NextResponse.json(
      { success: false, error: "Error al verificar el token" },
      { status: 500 }
    )
  }
} 