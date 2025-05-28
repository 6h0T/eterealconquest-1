import { NextResponse } from "next/server"
import { z } from "zod"
import { connectToDB } from "@/lib/db"
import { sendEmail } from "@/lib/resend"
import crypto from "crypto"

// Actualizar el esquema para que no requiera recaptchaToken
const schema = z.object({
  username: z.string().min(4).max(10),
  password: z.string().min(6),
  passwordConfirm: z.string().min(1),
  email: z.string().email(),
  recaptchaToken: z.string().optional(), // Mantener como opcional para compatibilidad
})

function generateVerificationToken() {
  return crypto.randomBytes(32).toString("hex")
}

export async function POST(req: Request) {
  let pool = null
  try {
    const data = await req.json()
    console.log("Datos recibidos en registro:", JSON.stringify(data, null, 2))

    const parsed = schema.safeParse(data)
    if (!parsed.success) {
      console.error("Error de validación:", parsed.error.format())
      return NextResponse.json({ error: "Datos inválidos", details: parsed.error.format() }, { status: 400 })
    }

    const { username, password, passwordConfirm, email } = parsed.data

    // Verificar que las contraseñas coincidan
    if (password !== passwordConfirm) {
      return NextResponse.json({ error: "Las contraseñas no coinciden" }, { status: 400 })
    }

    try {
      // Conectar a la base de datos con manejo de errores mejorado
      console.log("Intentando conectar a la base de datos para registro...")
      pool = await connectToDB()
      console.log("Conexión exitosa, verificando usuario existente...")

      // Verificar si el usuario ya existe en MEMB_INFO
      const userResult = await pool
        .request()
        .input("username", username)
        .query("SELECT memb___id FROM MEMB_INFO WHERE memb___id = @username")

      if (userResult.recordset.length > 0) {
        return NextResponse.json({ error: "El usuario ya existe" }, { status: 400 })
      }

      // Verificar si el email ya existe en MEMB_INFO
      const emailCheckResult = await pool
        .request()
        .input("email", email)
        .query("SELECT mail_addr FROM MEMB_INFO WHERE mail_addr = @email")

      if (emailCheckResult.recordset.length > 0) {
        return NextResponse.json({ error: "El correo electrónico ya está registrado" }, { status: 400 })
      }

      // Verificar si ya existe una cuenta pendiente con el mismo usuario o email
      const pendingUserResult = await pool
        .request()
        .input("username", username)
        .input("email", email)
        .query(`
          SELECT username, email FROM PendingAccounts 
          WHERE username = @username OR email = @email
        `)

      if (pendingUserResult.recordset.length > 0) {
        const existingRecord = pendingUserResult.recordset[0]
        if (existingRecord.username === username) {
          return NextResponse.json({ 
            error: "Ya existe un registro pendiente para este usuario. Revisa tu email para verificar tu cuenta." 
          }, { status: 400 })
        }
        if (existingRecord.email === email) {
          return NextResponse.json({ 
            error: "Ya existe un registro pendiente para este email. Revisa tu email para verificar tu cuenta." 
          }, { status: 400 })
        }
      }

      // Generar token de verificación
      const verificationToken = generateVerificationToken()
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
      const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
      const userAgent = req.headers.get("user-agent") || "unknown"

      // Guardar la cuenta pendiente
      await pool
        .request()
        .input("username", username)
        .input("password", password)
        .input("email", email)
        .input("verificationToken", verificationToken)
        .input("expiresAt", expiresAt)
        .input("ipAddress", ipAddress)
        .input("userAgent", userAgent)
        .query(`
          INSERT INTO PendingAccounts (username, password, email, verification_token, expires_at, ip_address, user_agent)
          VALUES (@username, @password, @email, @verificationToken, @expiresAt, @ipAddress, @userAgent)
        `)

      // Registrar el envío del email en el log
      await pool
        .request()
        .input("email", email)
        .input("username", username)
        .input("action", "sent")
        .input("ipAddress", ipAddress)
        .input("userAgent", userAgent)
        .input("details", `Token de verificación enviado para registro`)
        .query(`
          INSERT INTO EmailVerificationLog (email, username, action, ip_address, user_agent, details)
          VALUES (@email, @username, @action, @ipAddress, @userAgent, @details)
        `)

      // Detectar el idioma del usuario desde el referer o headers
      const referer = req.headers.get("referer") || ""
      const acceptLanguage = req.headers.get("accept-language") || ""
      
      let userLang = "es" // idioma por defecto
      
      // Primero intentar detectar desde la URL de referer
      if (referer.includes("/en/")) {
        userLang = "en"
      } else if (referer.includes("/pt/")) {
        userLang = "pt"
      } else if (referer.includes("/es/")) {
        userLang = "es"
      } else {
        // Si no se detecta desde referer, usar accept-language
        userLang = acceptLanguage.includes("en") ? "en" : 
                  acceptLanguage.includes("pt") ? "pt" : "es"
      }
      
      // Generar el enlace de verificación con el idioma correcto
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001"
      const verificationLink = `${baseUrl}/${userLang}/verificar-email?token=${verificationToken}`

      // Contenido del email según el idioma
      const emailContent = {
        es: {
          subject: "Verifica tu cuenta - Etereal Conquest",
          greeting: "¡Hola",
          welcome: "¡Bienvenido a Etereal Conquest! Para completar tu registro, necesitas verificar tu dirección de correo electrónico.",
          button: "✅ Verificar mi cuenta",
          fallback: "Si el botón no funciona, copia y pega este enlace en tu navegador:",
          expiry: "Este enlace expirará en 24 horas por razones de seguridad.",
          ignore: "Si no creaste esta cuenta, puedes ignorar este mensaje.",
          copyright: "© 2024 Etereal Conquest. Todos los derechos reservados."
        },
        en: {
          subject: "Verify your account - Etereal Conquest",
          greeting: "Hello",
          welcome: "Welcome to Etereal Conquest! To complete your registration, you need to verify your email address.",
          button: "✅ Verify my account",
          fallback: "If the button doesn't work, copy and paste this link in your browser:",
          expiry: "This link will expire in 24 hours for security reasons.",
          ignore: "If you didn't create this account, you can ignore this message.",
          copyright: "© 2024 Etereal Conquest. All rights reserved."
        },
        pt: {
          subject: "Verifique sua conta - Etereal Conquest",
          greeting: "Olá",
          welcome: "Bem-vindo ao Etereal Conquest! Para completar seu registro, você precisa verificar seu endereço de email.",
          button: "✅ Verificar minha conta",
          fallback: "Se o botão não funcionar, copie e cole este link no seu navegador:",
          expiry: "Este link expirará em 24 horas por razões de segurança.",
          ignore: "Se você não criou esta conta, pode ignorar esta mensagem.",
          copyright: "© 2024 Etereal Conquest. Todos os direitos reservados."
        }
      }

      const content = emailContent[userLang as keyof typeof emailContent] || emailContent.es

      console.log(`Idioma detectado para ${username}: ${userLang} (referer: ${referer})`)

      // Enviar email de verificación
      const emailSendResult = await sendEmail({
        to: email,
        subject: content.subject,
        from: "Etereal Conquest <noreply@mu-occidental.com>",
        html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { background-color: #1a1a1a; color: #ffffff; font-family: Arial, sans-serif; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .content { background-color: #1a1a1a; padding: 20px; border-radius: 5px; color: #ffffff; }
    .button { display: inline-block; background-color: #FFD700; color: #000000 !important; text-decoration: none; padding: 15px 30px; border-radius: 5px; font-weight: bold; margin: 20px 0; }
    .user-id { color: #FFD700; font-weight: bold; }
    .link { color: #FFD700; word-break: break-all; }
    .warning-text { color: #ffffff; margin-top: 20px; }
    .warning-icon { margin-right: 10px; }
    p, span, div { color: #ffffff; }
    .logo { text-align: center; margin-bottom: 20px; }
    .logo h1 { color: #FFD700; font-size: 24px; margin: 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <div class="logo">
        <h1>🏰 ETEREAL CONQUEST</h1>
      </div>
      
      <p>${content.greeting} <span class="user-id">${username}</span>!</p>
      <p>${content.welcome}</p>
      
      <div style="text-align: center;">
        <a href="${verificationLink}" class="button">${content.button}</a>
      </div>
      
      <p>${content.fallback}</p>
      <p class="link">${verificationLink}</p>
      
      <div class="warning-text">
        <span class="warning-icon">⏰</span>
        <span>${content.expiry}</span>
      </div>
      
      <div style="margin-top: 20px;">
        <span class="warning-icon">🔒</span>
        <span>${content.ignore}</span>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #333; text-align: center; font-size: 12px; color: #888;">
        <p>${content.copyright}</p>
      </div>
    </div>
  </div>
</body>
</html>
        `,
      })

             if (!emailSendResult.success) {
         console.error("Error al enviar email de verificación:", emailSendResult.error)
        // Eliminar la cuenta pendiente si no se pudo enviar el email
        await pool
          .request()
          .input("username", username)
          .query("DELETE FROM PendingAccounts WHERE username = @username")
        
        return NextResponse.json({ 
          error: "Error al enviar el correo de verificación. Por favor, inténtalo de nuevo." 
        }, { status: 500 })
      }

      console.log("Cuenta pendiente creada y email de verificación enviado:", username)
      return NextResponse.json({ 
        success: true, 
        message: "Registro iniciado. Revisa tu correo electrónico para verificar tu cuenta.",
        requiresVerification: true
      })

    } catch (err: any) {
      console.error("Error detallado en el registro:", err)

      // Mensaje de error más descriptivo para el cliente
      let errorMessage = "Error en la base de datos"
      if (err.message && err.message.includes("Failed to connect")) {
        errorMessage = "No se pudo conectar a la base de datos. Por favor, inténtalo más tarde."
      } else if (err.message && err.message.includes("Login failed")) {
        errorMessage = "Error de autenticación con la base de datos. Contacta al administrador."
      }

      return NextResponse.json(
        {
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
          console.log("Conexión a la base de datos cerrada correctamente en registro")
        } catch (closeErr) {
          console.error("Error al cerrar la conexión en registro:", closeErr)
        }
      }
    }
  } catch (err: any) {
    console.error("Error al procesar la solicitud de registro:", err)
    return NextResponse.json(
      {
        error: "Error al procesar la solicitud",
        details: err.message,
      },
      { status: 400 },
    )
  }
}
