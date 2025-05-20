import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"
import { Resend } from "resend"
import crypto from "crypto"
import sql from "mssql"

const resend = new Resend(process.env.RESEND_API_KEY)

function generateToken() {
  return crypto.randomBytes(32).toString("hex")
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ success: false, error: "Falta el email" }, { status: 400 })
    }

    console.log("[RECOVER PASSWORD] Procesando solicitud para email:", email)

    const pool = await connectToDB()
    
    // Simplificamos la consulta para evitar dependencias de MEMB_STAT
    const result = await pool
      .request()
      .input("email", email)
      .query(`
        SELECT memb___id 
        FROM MEMB_INFO
        WHERE mail_addr = @email
      `)

    if (result.recordset.length === 0) {
      console.log("[RECOVER PASSWORD] Email no encontrado:", email)
      return NextResponse.json({ success: false, error: "No se encontró ese correo" }, { status: 404 })
    }

    const userId = result.recordset[0].memb___id
    const token = generateToken()
    
    console.log("[RECOVER PASSWORD] Usuario encontrado:", userId)

    // Verificar si la tabla PasswordRecovery2 existe
    const tableCheck = await pool
      .request()
      .query(`
        SELECT CASE WHEN EXISTS (
          SELECT * FROM sysobjects WHERE name='PasswordRecovery2' AND xtype='U'
        ) THEN 1 ELSE 0 END AS TableExists
      `)
    
    const tableExists = tableCheck.recordset[0].TableExists === 1
    
    if (!tableExists) {
      console.log("[RECOVER PASSWORD] Creando tabla PasswordRecovery2")
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
      `)
    }

    // Insertar el token en la base de datos
    await pool
      .request()
      .input("email", sql.VarChar, email)
      .input("token", sql.VarChar, token)
      .input("memb___id", sql.VarChar, userId)
      .input("expires", sql.DateTime, new Date(Date.now() + 1000 * 60 * 30)) // 30 min
      .query(`
        INSERT INTO PasswordRecovery2 (email, token, memb___id, expires)
        VALUES (@email, @token, @memb___id, @expires)
      `)

    console.log("[RECOVER PASSWORD] Token creado y almacenado")

    // Generar el enlace de restablecimiento sin [lang]
    const resetLink = `/restablecer?token=${token}`
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ""
    const fullResetLink = baseUrl + resetLink

    try {
      await resend.emails.send({
        from: "no-reply@mu-occidental.com",
        to: email,
        subject: "Restablece tu contraseña",
        html: `<p>Has solicitado restablecer tu contraseña.</p><p>Haz clic en el siguiente enlace para continuar:</p><p><a href="${fullResetLink}">${fullResetLink}</a></p><p>Este enlace expira en 30 minutos.</p><p>Si no solicitaste este cambio, ignora este mensaje.</p>`,
      })
      console.log("[RECOVER PASSWORD] Correo enviado exitosamente")
    } catch (emailError) {
      console.error("[RECOVER PASSWORD EMAIL ERROR]", emailError)
      return NextResponse.json({ success: false, error: "Error al enviar el correo" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Correo de recuperación enviado" })
  } catch (error) {
    console.error("[RECOVER PASSWORD ERROR]", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
