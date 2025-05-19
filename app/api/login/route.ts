import { NextResponse } from "next/server"
import { z } from "zod"
import { connectToDB } from "@/lib/db"

const schema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  recaptchaToken: z.string().optional(), // Mantener como opcional para compatibilidad
})

export async function POST(req: Request) {
  let pool = null
  try {
    const data = await req.json()
    console.log("Datos recibidos en login:", JSON.stringify(data, null, 2)) // Log para depuración

    const parsed = schema.safeParse(data)
    if (!parsed.success) {
      console.error("Validación fallida:", parsed.error.format())
      return NextResponse.json({ error: "Datos inválidos", details: parsed.error.format() }, { status: 400 })
    }

    const { username, password } = parsed.data

    // Imprimir información de configuración (sin las contraseñas)
    console.log("Configuración de conexión:", {
      host: process.env.NEXT_PUBLIC_DB_HOST || "localhost",
      port: process.env.NEXT_PUBLIC_DB_PORT || 1433,
      database: process.env.NEXT_PUBLIC_DB_NAME || "_obj",
      user: process.env.NEXT_PUBLIC_DB_USER || "sa",
      // No imprimir la contraseña por seguridad
    })

    try {
      // Crear una nueva conexión para cada solicitud
      console.log("Intentando conectar a la base de datos para login...")
      pool = await connectToDB()
      console.log("Conexión exitosa, verificando credenciales...")

      // Verificar credenciales
      const result = await pool
        .request()
        .input("username", username)
        .input("password", password)
        .query("SELECT memb___id, mail_addr FROM MEMB_INFO WHERE memb___id = @username AND memb__pwd = @password")

      console.log("Consulta ejecutada. Resultados encontrados:", result.recordset.length)

      // Cerrar la conexión inmediatamente después de usarla
      await pool.close()
      console.log("Conexión cerrada después de verificar credenciales")
      pool = null // Establecer a null para evitar cerrarla nuevamente

      if (result.recordset.length === 0) {
        console.log("Credenciales incorrectas para usuario:", username)
        return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 })
      }

      // Usuario autenticado correctamente
      const user = result.recordset[0]
      console.log("Login exitoso para usuario:", username)

      return NextResponse.json({
        success: true,
        user: {
          username: user.memb___id,
          email: user.mail_addr,
        },
      })
    } catch (err: any) {
      console.error("Error detallado en login:", err)
      console.error("Stack trace:", err.stack)

      // Mensaje de error más descriptivo para el cliente
      let errorMessage = "Error en la base de datos"
      const errorDetails = err.message || "Error desconocido"

      if (err.message && err.message.includes("Failed to connect")) {
        errorMessage = "No se pudo conectar a la base de datos. Por favor, inténtalo más tarde."
      } else if (err.message && err.message.includes("Login failed")) {
        errorMessage = "Error de autenticación con la base de datos. Contacta al administrador."
      } else if (err.code === "ETIMEOUT") {
        errorMessage = "Tiempo de espera agotado al conectar a la base de datos."
      } else if (err.code === "ENOTFOUND") {
        errorMessage = "No se pudo encontrar el servidor de base de datos."
      } else if (err.message && err.message.includes("dns.lookup")) {
        errorMessage = "Error de resolución DNS. Verifica la configuración del servidor de base de datos."
      } else if (err.message && err.message.includes("Connection is closed")) {
        errorMessage = "La conexión a la base de datos está cerrada. Intenta recargar la página."
      }

      return NextResponse.json(
        {
          error: errorMessage,
          details: errorDetails,
          code: err.code || "UNKNOWN",
        },
        { status: 500 },
      )
    } finally {
      // Asegurarse de que la conexión se cierre si aún está abierta
      if (pool) {
        try {
          await pool.close()
          console.log("Conexión a la base de datos cerrada correctamente en finally")
        } catch (closeErr) {
          console.error("Error al cerrar la conexión en finally:", closeErr)
        }
      }
    }
  } catch (err: any) {
    console.error("Error al procesar la solicitud de login:", err)
    console.error("Stack trace:", err.stack)
    return NextResponse.json(
      {
        error: "Error al procesar la solicitud",
        details: err.message,
      },
      { status: 400 },
    )
  }
}
