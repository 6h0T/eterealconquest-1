// /app/api/reset-password/route.ts
import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"

// Definir los tipos de respuesta para manejar mejor el tipado
type ErrorResponse = { success: false; error: string };
type SuccessResponse = { success: true; message: string };
type ApiResponse = ErrorResponse | SuccessResponse;

export async function POST(req: Request) {
  // Respuesta por defecto en caso de error catastrófico
  let responseData: ApiResponse = { success: false, error: "Error interno del servidor" };
  let statusCode = 500;

  try {
    // Extraer datos de la solicitud
    let requestData;
    try {
      requestData = await req.json();
    } catch (parseError) {
      console.error("[RESET PASSWORD] Error parsing request body:", parseError);
      return NextResponse.json({ success: false, error: "Error al procesar la solicitud" }, { status: 400 });
    }

    const { token, password } = requestData;

    // Validar datos requeridos
    if (!token || !password) {
      responseData = { success: false, error: "Faltan datos requeridos" };
      statusCode = 400;
      return NextResponse.json(responseData, { status: statusCode });
    }

    console.log("[RESET PASSWORD] Procesando solicitud para token:", token.substring(0, 10) + "...");

    // Validar longitud mínima de contraseña
    if (password.length < 4) {
      responseData = { success: false, error: "La contraseña debe tener al menos 4 caracteres" };
      statusCode = 400;
      return NextResponse.json(responseData, { status: statusCode });
    }

    // Conectar a la base de datos
    let db;
    try {
      db = await connectToDB();
    } catch (dbError) {
      console.error("[RESET PASSWORD] Error connecting to database:", dbError);
      responseData = { success: false, error: "Error al conectar con la base de datos" };
      statusCode = 500;
      return NextResponse.json(responseData, { status: statusCode });
    }

    // Verificar si la tabla PasswordRecovery2 existe
    let tableExists = false;
    try {
      const tableCheck = await db
        .request()
        .query(`
          SELECT CASE WHEN EXISTS (
            SELECT * FROM sysobjects WHERE name='PasswordRecovery2' AND xtype='U'
          ) THEN 1 ELSE 0 END AS TableExists
        `);
      
      tableExists = tableCheck.recordset[0].TableExists === 1;
      
      if (!tableExists) {
        console.error("[RESET PASSWORD] La tabla PasswordRecovery2 no existe");
        responseData = { success: false, error: "Sistema de recuperación no configurado" };
        statusCode = 500;
        return NextResponse.json(responseData, { status: statusCode });
      }
    } catch (tableCheckError) {
      console.error("[RESET PASSWORD] Error verificando la tabla:", tableCheckError);
      responseData = { success: false, error: "Error al verificar la configuración del sistema" };
      statusCode = 500;
      return NextResponse.json(responseData, { status: statusCode });
    }

    // Buscar el token en la tabla PasswordRecovery2
    let tokenResult;
    try {
      tokenResult = await db
        .request()
        .input("token", token)
        .query(`
          SELECT TOP 1 * FROM PasswordRecovery2
          WHERE token = @token AND expires > GETUTCDATE()
        `);

      if (tokenResult.recordset.length === 0) {
        console.log("[RESET PASSWORD] Token inválido o expirado:", token.substring(0, 10) + "...");
        responseData = { success: false, error: "Token inválido o expirado" };
        statusCode = 400;
        return NextResponse.json(responseData, { status: statusCode });
      }
    } catch (tokenError) {
      console.error("[RESET PASSWORD] Error verifying token:", tokenError);
      responseData = { success: false, error: "Error al verificar el token" };
      statusCode = 500;
      return NextResponse.json(responseData, { status: statusCode });
    }

    const user = tokenResult.recordset[0];
    const userId = user.memb___id;

    console.log("[RESET PASSWORD] Token válido para usuario:", userId);

    // Actualizar la contraseña
    try {
      await db
        .request()
        .input("userId", userId)
        .input("newPassword", password)
        .query(`
          UPDATE MEMB_INFO
          SET memb__pwd = @newPassword
          WHERE memb___id = @userId
        `);
      
      console.log("[RESET PASSWORD] Contraseña actualizada para usuario:", userId);
    } catch (updateError) {
      console.error("[RESET PASSWORD] Error updating password:", updateError);
      responseData = { success: false, error: "Error al actualizar la contraseña" };
      statusCode = 500;
      return NextResponse.json(responseData, { status: statusCode });
    }

    // Marcar el token como usado (eliminarlo)
    try {
      await db
        .request()
        .input("token", token)
        .query(`
          DELETE FROM PasswordRecovery2 WHERE token = @token
        `);
      console.log("[RESET PASSWORD] Token eliminado después de uso exitoso");
    } catch (deleteError) {
      // No interrumpimos el flujo si falla la eliminación del token
      console.error("[RESET PASSWORD] Error deleting used token:", deleteError);
    }

    // Respuesta exitosa
    responseData = { success: true, message: "Contraseña actualizada correctamente" };
    statusCode = 200;
    return NextResponse.json(responseData, { status: statusCode });

  } catch (error) {
    // Capturar cualquier error no manejado
    console.error("[RESET PASSWORD] Error al restablecer la contraseña:", error);
    // Usamos la respuesta por defecto que configuramos al inicio
    return NextResponse.json(responseData, { status: statusCode });
  } finally {
    // Agregar un log final para confirmar que se procesó la solicitud
    console.log(`[RESET PASSWORD] Solicitud procesada con estado: ${statusCode}`);
  }
}
