import { NextResponse } from "next/server"
import { z } from "zod"
import { connectToDB } from "@/lib/db"

// Actualizar el esquema para que no requiera recaptchaToken
const schema = z.object({
  username: z.string().min(4).max(10),
  password: z.string().min(6),
  passwordConfirm: z.string().min(1),
  email: z.string().email(),
  recaptchaToken: z.string().optional(), // Mantener como opcional para compatibilidad
})

export async function POST(req: Request) {
  let pool = null
  try {
    const data = await req.json()
    console.log("Datos recibidos en registro:", JSON.stringify(data, null, 2)) // Log para depuración

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

    // Eliminar toda la verificación de reCAPTCHA

    try {
      // Conectar a la base de datos con manejo de errores mejorado
      console.log("Intentando conectar a la base de datos para registro...")
      pool = await connectToDB()
      console.log("Conexión exitosa, verificando usuario existente...")

      // Verificar si el usuario ya existe
      const result = await pool
        .request()
        .input("username", username)
        .query("SELECT memb___id FROM MEMB_INFO WHERE memb___id = @username")

      if (result.recordset.length > 0) {
        return NextResponse.json({ error: "El usuario ya existe" }, { status: 400 })
      }

      // Verificar si el email ya existe
      const emailResult = await pool
        .request()
        .input("email", email)
        .query("SELECT mail_addr FROM MEMB_INFO WHERE mail_addr = @email")

      if (emailResult.recordset.length > 0) {
        return NextResponse.json({ error: "El correo electrónico ya está registrado" }, { status: 400 })
      }

      // Insertar el nuevo usuario
      await pool
        .request()
        .input("username", username)
        .input("password", password)
        .input("email", email)
        .query(`INSERT INTO MEMB_INFO (memb___id, memb__pwd, mail_addr, memb_name, bloc_code, ctl1_code, sno__numb) 
               VALUES (@username, @password, @email, @username, 0, 0, 'S1')`)

      console.log("Usuario registrado correctamente:", username)
      return NextResponse.json({ success: true, message: "Usuario registrado correctamente" })
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
