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
          SELECT memb___id, mail_addr
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
        subject: "Restablece tu contraseña - MU EterealConquest",
        html: `
          <div style="background-color: #1f1f1f; color: #f0f0f0; padding: 20px; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border-radius: 5px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #ffd700; margin: 0;">EterealConquest</h1>
              <p style="margin-top: 5px;">Recuperación de Contraseña</p>
            </div>
            
            <div style="background-color: #2a2a2a; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
              <p>Hola <strong style="color: #ffd700;">${result.recordset[0].memb___id}</strong>,</p>
              <p>Has solicitado restablecer tu contraseña en Eterealconquest.</p>
              <p>Para continuar con el proceso, haz clic en el siguiente botón:</p>
              
              <div style="text-align: center; margin: 20px 0;">
                <a href="${fullResetLink}" 
                   style="background-color: #ffd700;
                          color: #000000;
                          text-decoration: none;
                          padding: 10px 20px;
                          border-radius: 3px;
                          font-weight: bold;
                          display: inline-block;">
                  Restablecer Contraseña
                </a>
              </div>
              
              <p style="font-size: 13px;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:
                <br>
                <a href="${fullResetLink}" style="color: #ffd700;">${fullResetLink}</a>
              </p>
            </div>
            
            <div style="font-size: 12px; color: #bbbbbb;">
              <p>⚠️ Este enlace expirará en 30 minutos por razones de seguridad.</p>
              <p>🔒 Si no solicitaste este cambio, puedes ignorar este mensaje. Tu cuenta permanece segura.</p>
              <p>© ${new Date().getFullYear()} EterealConquest - Todos los derechos reservados</p>
            </div>
          </div>
        `,
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
    // Asegurarnos de que siempre devolvemos un JSON válido
    responseData = { 
      success: false, 
      error: error instanceof Error ? error.message : "Error interno del servidor" 
    };
    return NextResponse.json(responseData, { status: statusCode });
  } finally {
    // Agregar un log final para confirmar que se procesó la solicitud
    console.log(`[RECOVER PASSWORD] Solicitud procesada con estado: ${statusCode}`);
  }
}
