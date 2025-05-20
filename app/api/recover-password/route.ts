import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"
import { Resend } from "resend"
import crypto from "crypto"
import sql from "mssql"

// Definir los tipos de respuesta para manejar mejor el tipado
type ErrorResponse = { success: false; error: string };
type SuccessResponse = { success: true; message: string };
type ApiResponse = ErrorResponse | SuccessResponse;

const resend = new Resend(process.env.RESEND_API_KEY)

function generateToken() {
  return crypto.randomBytes(32).toString("hex")
}

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
      console.error("[RECOVER PASSWORD] Error parsing request body:", parseError);
      return NextResponse.json({ success: false, error: "Error al procesar la solicitud" }, { status: 400 });
    }

    const { email } = requestData;

    if (!email) {
      responseData = { success: false, error: "Falta el email" };
      statusCode = 400;
      return NextResponse.json(responseData, { status: statusCode });
    }

    console.log("[RECOVER PASSWORD] Procesando solicitud para email:", email);

    // Conectar a la base de datos
    let pool;
    try {
      pool = await connectToDB();
    } catch (dbError) {
      console.error("[RECOVER PASSWORD] Error connecting to database:", dbError);
      responseData = { success: false, error: "Error al conectar con la base de datos" };
      statusCode = 500;
      return NextResponse.json(responseData, { status: statusCode });
    }
    
    // Simplificamos la consulta para evitar dependencias de MEMB_STAT
    let result;
    try {
      result = await pool
        .request()
        .input("email", email)
        .query(`
          SELECT memb___id 
          FROM MEMB_INFO
          WHERE mail_addr = @email
        `);

      if (result.recordset.length === 0) {
        console.log("[RECOVER PASSWORD] Email no encontrado:", email);
        responseData = { success: false, error: "No se encontró ese correo" };
        statusCode = 404;
        return NextResponse.json(responseData, { status: statusCode });
      }
    } catch (queryError) {
      console.error("[RECOVER PASSWORD] Error querying user:", queryError);
      responseData = { success: false, error: "Error al buscar el usuario" };
      statusCode = 500;
      return NextResponse.json(responseData, { status: statusCode });
    }

    const userId = result.recordset[0].memb___id;
    const token = generateToken();
    
    console.log("[RECOVER PASSWORD] Usuario encontrado:", userId);

    // Verificar si la tabla PasswordRecovery2 existe
    let tableExists = false;
    try {
      const tableCheck = await pool
        .request()
        .query(`
          SELECT CASE WHEN EXISTS (
            SELECT * FROM sysobjects WHERE name='PasswordRecovery2' AND xtype='U'
          ) THEN 1 ELSE 0 END AS TableExists
        `);
      
      tableExists = tableCheck.recordset[0].TableExists === 1;
      
      if (!tableExists) {
        console.log("[RECOVER PASSWORD] Creando tabla PasswordRecovery2");
        // Crear la tabla si no existe
        await pool.request().query(`
          CREATE TABLE PasswordRecovery2 (
            id INT IDENTITY(1,1) PRIMARY KEY,
            email NVARCHAR(50) NOT NULL,
            memb___id NVARCHAR(10) NOT NULL,
            token NVARCHAR(100) NOT NULL,
            expires DATETIME NOT NULL,
            used BIT DEFAULT 0,
            created_at DATETIME DEFAULT GETDATE()
          )
        `);
      }
    } catch (tableError) {
      console.error("[RECOVER PASSWORD] Error checking/creating table:", tableError);
      responseData = { success: false, error: "Error al configurar el sistema de recuperación" };
      statusCode = 500;
      return NextResponse.json(responseData, { status: statusCode });
    }

    // Insertar el token en la base de datos
    try {
      await pool
        .request()
        .input("email", sql.VarChar, email)
        .input("token", sql.VarChar, token)
        .input("memb___id", sql.VarChar, userId)
        .input("expires", sql.DateTime, new Date(Date.now() + 1000 * 60 * 30)) // 30 min
        .query(`
          INSERT INTO PasswordRecovery2 (email, token, memb___id, expires)
          VALUES (@email, @token, @memb___id, @expires)
        `);

      console.log("[RECOVER PASSWORD] Token creado y almacenado");
    } catch (insertError) {
      console.error("[RECOVER PASSWORD] Error inserting token:", insertError);
      responseData = { success: false, error: "Error al generar el token de recuperación" };
      statusCode = 500;
      return NextResponse.json(responseData, { status: statusCode });
    }

    // Generar el enlace de restablecimiento sin [lang]
    const resetLink = `/restablecer?token=${token}`;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    const fullResetLink = baseUrl + resetLink;

    // Enviar el correo
    try {
      const emailResult = await resend.emails.send({
        from: "no-reply@mu-occidental.com",
        to: email,
        subject: "Restablece tu contraseña",
        html: `<p>Has solicitado restablecer tu contraseña.</p><p>Haz clic en el siguiente enlace para continuar:</p><p><a href="${fullResetLink}">${fullResetLink}</a></p><p>Este enlace expira en 30 minutos.</p><p>Si no solicitaste este cambio, ignora este mensaje.</p>`,
      });
      
      console.log("[RECOVER PASSWORD] Correo enviado exitosamente", emailResult);
      
      if (!emailResult || (emailResult as any).error) {
        throw new Error(
          (emailResult as any).error?.message || 
          "Error desconocido al enviar el correo"
        );
      }
    } catch (emailError) {
      console.error("[RECOVER PASSWORD EMAIL ERROR]", emailError);
      responseData = { success: false, error: "Error al enviar el correo" };
      statusCode = 500;
      return NextResponse.json(responseData, { status: statusCode });
    }

    // Respuesta exitosa
    responseData = { success: true, message: "Correo de recuperación enviado" };
    statusCode = 200;
    return NextResponse.json(responseData, { status: statusCode });
  } catch (error) {
    console.error("[RECOVER PASSWORD ERROR]", error);
    // Usamos la respuesta por defecto que configuramos al inicio
    return NextResponse.json(responseData, { status: statusCode });
  } finally {
    // Agregar un log final para confirmar que se procesó la solicitud
    console.log(`[RECOVER PASSWORD] Solicitud procesada con estado: ${statusCode}`);
  }
}
