import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"
import { Resend } from "resend"
import crypto from "crypto"

const resend = new Resend(process.env.RESEND_API_KEY)

function generateToken() {
  return crypto.randomBytes(32).toString("hex")
}

// Función para crear una pista del email (ej: e****@g****.com)
function createEmailHint(email: string): string {
  const [localPart, domain] = email.split('@')
  if (!localPart || !domain) return email
  
  const [domainName, extension] = domain.split('.')
  if (!domainName || !extension) return email
  
  const hiddenLocal = localPart.length > 2 
    ? localPart[0] + '*'.repeat(localPart.length - 2) + localPart[localPart.length - 1]
    : localPart[0] + '*'.repeat(Math.max(1, localPart.length - 1))
    
  const hiddenDomain = domainName.length > 2
    ? domainName[0] + '*'.repeat(domainName.length - 2) + domainName[domainName.length - 1]
    : domainName[0] + '*'.repeat(Math.max(1, domainName.length - 1))
    
  return `${hiddenLocal}@${hiddenDomain}.${extension}`
}

export async function POST(req: Request) {
  try {
    const { identifier, isEmail } = await req.json()

    if (!identifier) {
      return NextResponse.json({ success: false, error: "Falta el email o nombre de usuario" }, { status: 400 })
    }

    const pool = await connectToDB()
    let result
    let email: string
    let userId: string

    if (isEmail) {
      // Buscar por email
      result = await pool
        .request()
        .input("email", identifier)
        .query(`
          SELECT memb___id, mail_addr FROM MEMB_INFO WHERE mail_addr = @email
        `)
      
      if (result.recordset.length === 0) {
        return NextResponse.json({ success: false, error: "No se encontró ese correo electrónico" }, { status: 404 })
      }
      
      userId = result.recordset[0].memb___id
      email = result.recordset[0].mail_addr
    } else {
      // Buscar por username (memb___id)
      result = await pool
      .request()
        .input("username", identifier)
      .query(`
          SELECT memb___id, mail_addr FROM MEMB_INFO WHERE memb___id = @username
      `)

    if (result.recordset.length === 0) {
        return NextResponse.json({ success: false, error: "No se encontró ese nombre de usuario" }, { status: 404 })
    }

      userId = result.recordset[0].memb___id
      email = result.recordset[0].mail_addr
      
      if (!email) {
        return NextResponse.json({ success: false, error: "Esta cuenta no tiene un correo electrónico asociado" }, { status: 400 })
      }
    }

    const token = generateToken()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

    // Insertar el token en la base de datos
    await pool
      .request()
      .input("email", email)
      .input("token", token)
      .input("memb___id", userId)
      .input("expires", expiresAt)
      .query(`
        INSERT INTO PasswordRecovery2 (email, token, memb___id, expires)
        VALUES (@email, @token, @memb___id, @expires)
      `)

    // Generar el enlace de restablecimiento
    const resetLink = `/restablecer?token=${token}`
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ""
    const fullResetLink = baseUrl + resetLink

    // Enviar el email
    await resend.emails.send({
      from: "no-reply@eterealconquest.com",
      to: email,
      subject: "Restablece tu contraseña",
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { background-color: #1a1a1a; color: #ffffff; font-family: Arial, sans-serif; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .content { background-color: #1a1a1a; padding: 20px; border-radius: 5px; color: #ffffff; }
    .button { display: inline-block; background-color: #FFD700; color: #000000 !important; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-weight: bold; margin: 20px 0; }
    .user-id { color: #FFD700; font-weight: bold; }
    .link { color: #FFD700; word-break: break-all; }
    .warning-text { color: #ffffff; margin-top: 20px; }
    .warning-icon { margin-right: 10px; }
    p, span, div { color: #ffffff; }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <p>Hola <span class="user-id">${userId}</span>,</p>
      <p>Has solicitado restablecer tu contraseña en MU Eterealconquest.</p>
      <p>Para continuar con el proceso, haz clic en el siguiente botón:</p>
      
      <div style="text-align: center;">
        <a href="${fullResetLink}" class="button">Restablecer Contraseña</a>
      </div>
      
      <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
      <p class="link">${fullResetLink}</p>
      
      <div class="warning-text">
        <span class="warning-icon">⚠️</span>
        <span>Este enlace expirará en 1 hora por razones de seguridad.</span>
      </div>
      
      <div style="margin-top: 20px;">
        <span class="warning-icon">🔒</span>
        <span>Si no solicitaste este cambio, puedes ignorar este mensaje. Tu cuenta permanece segura.</span>
      </div>
    </div>
  </div>
</body>
</html>
      `,
    })

    // Preparar la respuesta
    const response: any = { 
      success: true, 
      message: "Correo de recuperación enviado" 
    }

    // Si se usó username, agregar pista del email
    if (!isEmail) {
      response.emailHint = createEmailHint(email)
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("[RECOVER PASSWORD ERROR]", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
