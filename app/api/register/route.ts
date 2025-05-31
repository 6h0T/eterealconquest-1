import { NextResponse } from "next/server"
import { z } from "zod"
import { queueRegistration, getQueueStats } from "@/lib/registration-queue"
import { sendEmail } from "@/lib/resend"

// Esquema de validación optimizado
const schema = z.object({
  username: z.string().min(4).max(10).regex(/^[a-zA-Z0-9_]+$/, "Solo letras, números y guiones bajos"),
  password: z.string().min(6).max(20),
  passwordConfirm: z.string().min(1),
  email: z.string().email().max(50),
  recaptchaToken: z.string().optional(),
})

// Cache en memoria para prevenir registros duplicados rápidos
const recentRegistrations = new Map<string, number>()
const DUPLICATE_PREVENTION_TIME = 5000 // 5 segundos

// Limpiar cache periódicamente
setInterval(() => {
  const now = Date.now()
  for (const [key, timestamp] of recentRegistrations.entries()) {
    if (now - timestamp > DUPLICATE_PREVENTION_TIME) {
      recentRegistrations.delete(key)
    }
  }
}, 30000) // Limpiar cada 30 segundos

export async function POST(req: Request) {
  const startTime = Date.now()
  
  try {
    // Obtener estadísticas de la cola para monitoreo
    const queueStats = getQueueStats()
    console.log(`[REGISTER] Cola actual: ${queueStats.pending} pendientes, ${queueStats.processing} procesando`)

    // Rate limiting básico por IP
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
    const ipKey = `ip_${ipAddress}`
    const now = Date.now()
    
    if (recentRegistrations.has(ipKey)) {
      const lastRequest = recentRegistrations.get(ipKey)!
      if (now - lastRequest < DUPLICATE_PREVENTION_TIME) {
        return NextResponse.json({ 
          error: "Demasiadas solicitudes. Espera unos segundos antes de intentar de nuevo." 
        }, { status: 429 })
      }
    }

    const data = await req.json()
    console.log(`[REGISTER] Solicitud recibida de IP: ${ipAddress}`)

    // Validación rápida
    const parsed = schema.safeParse(data)
    if (!parsed.success) {
      console.error("[REGISTER] Error de validación:", parsed.error.format())
      return NextResponse.json({ 
        error: "Datos inválidos", 
        details: parsed.error.format() 
      }, { status: 400 })
    }

    const { username, password, passwordConfirm, email } = parsed.data

    // Verificar contraseñas
    if (password !== passwordConfirm) {
      return NextResponse.json({ error: "Las contraseñas no coinciden" }, { status: 400 })
    }

    // Prevenir registros duplicados rápidos
    const userKey = `user_${username.toLowerCase()}`
    const emailKey = `email_${email.toLowerCase()}`
    
    if (recentRegistrations.has(userKey) || recentRegistrations.has(emailKey)) {
      return NextResponse.json({ 
        error: "Ya existe una solicitud reciente para este usuario o email. Espera unos segundos." 
      }, { status: 429 })
    }

    // Marcar como procesado para prevenir duplicados
    recentRegistrations.set(ipKey, now)
    recentRegistrations.set(userKey, now)
    recentRegistrations.set(emailKey, now)

    const userAgent = req.headers.get("user-agent") || "unknown"

    try {
      // Añadir a la cola de procesamiento (respuesta inmediata)
      const jobId = queueRegistration({
        username,
        password,
        email,
        ipAddress,
        userAgent
      })

      console.log(`[REGISTER] Trabajo en cola: ${jobId} para ${username} (${Date.now() - startTime}ms)`)

      // Respuesta inmediata al usuario
      return NextResponse.json({ 
        success: true, 
        message: "Registro en proceso. Recibirás un email de verificación en breve.",
        requiresVerification: true,
        jobId, // Para tracking opcional
        queuePosition: queueStats.pending + 1
      })

    } catch (queueError: any) {
      console.error("[REGISTER] Error añadiendo a cola:", queueError)
      
      // Limpiar cache si hay error
      recentRegistrations.delete(userKey)
      recentRegistrations.delete(emailKey)
      
      return NextResponse.json({ 
        error: "Error interno del servidor. Inténtalo de nuevo." 
      }, { status: 500 })
    }

  } catch (err: any) {
    console.error("[REGISTER] Error general:", err)
    return NextResponse.json({
      error: "Error al procesar la solicitud",
      details: err.message,
    }, { status: 500 })
  }
}

// Endpoint para obtener estadísticas de la cola (opcional, para monitoreo)
export async function GET(req: Request) {
  try {
    const stats = getQueueStats()
    return NextResponse.json({
      success: true,
      stats,
      timestamp: Date.now()
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
