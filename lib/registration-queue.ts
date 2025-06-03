// lib/registration-queue.ts
// Sistema de cola para manejar registros masivos

interface RegistrationJob {
  id: string
  username: string
  password: string
  email: string
  ipAddress: string
  userAgent: string
  timestamp: number
  retries: number
  maxRetries: number
}

interface QueueStats {
  pending: number
  processing: number
  completed: number
  failed: number
  totalProcessed: number
}

class RegistrationQueue {
  private queue: RegistrationJob[] = []
  private processing: Set<string> = new Set()
  private maxConcurrent: number = 50 // Procesar máximo 50 registros simultáneamente
  private stats: QueueStats = {
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    totalProcessed: 0
  }

  constructor(maxConcurrent: number = 50) {
    this.maxConcurrent = maxConcurrent
  }

  // Añadir trabajo a la cola
  addJob(job: Omit<RegistrationJob, 'id' | 'timestamp' | 'retries' | 'maxRetries'>): string {
    const registrationJob: RegistrationJob = {
      ...job,
      id: this.generateJobId(),
      timestamp: Date.now(),
      retries: 0,
      maxRetries: 3
    }

    this.queue.push(registrationJob)
    this.stats.pending++
    
    console.log(`[QUEUE] Trabajo añadido: ${registrationJob.id} (${registrationJob.username})`)
    
    // Procesar cola automáticamente
    this.processQueue()
    
    return registrationJob.id
  }

  // Procesar cola de manera concurrente
  private async processQueue() {
    // Si ya estamos procesando el máximo, no hacer nada
    if (this.processing.size >= this.maxConcurrent) {
      return
    }

    // Tomar trabajos de la cola
    const jobsToProcess = this.queue.splice(0, this.maxConcurrent - this.processing.size)
    
    if (jobsToProcess.length === 0) {
      return
    }

    // Procesar trabajos en paralelo
    const promises = jobsToProcess.map(job => this.processJob(job))
    
    // No esperar a que terminen todos, permitir procesamiento asíncrono
    Promise.allSettled(promises).then(() => {
      // Continuar procesando si hay más trabajos
      if (this.queue.length > 0) {
        this.processQueue()
      }
    })
  }

  // Procesar un trabajo individual
  private async processJob(job: RegistrationJob): Promise<void> {
    this.processing.add(job.id)
    this.stats.processing++
    this.stats.pending--

    console.log(`[QUEUE] Procesando: ${job.id} (${job.username})`)

    try {
      // Importar dinámicamente para evitar dependencias circulares
      const { executeQueryWithRetry } = await import('./db')
      const crypto = await import('crypto')

      const dbResult = await executeQueryWithRetry(async (pool) => {
        // Verificar si el usuario ya existe (MANTENER - username debe ser único)
        const userResult = await pool
          .request()
          .input("username", job.username)
          .query("SELECT memb___id FROM MEMB_INFO WHERE memb___id = @username")

        if (userResult.recordset.length > 0) {
          throw new Error("USER_EXISTS")
        }

        // Verificar cuentas pendientes por USERNAME (no por email)
        const pendingResult = await pool
          .request()
          .input("username", job.username)
          .query(`
            SELECT username FROM PendingAccounts 
            WHERE username = @username
          `)

        if (pendingResult.recordset.length > 0) {
          throw new Error("PENDING_EXISTS")
        }

        // Crear token y guardar cuenta pendiente
        const verificationToken = crypto.randomBytes(32).toString("hex")
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

        await pool
          .request()
          .input("username", job.username)
          .input("password", job.password)
          .input("email", job.email)
          .input("verificationToken", verificationToken)
          .input("expiresAt", expiresAt)
          .input("ipAddress", job.ipAddress)
          .input("userAgent", job.userAgent)
          .query(`
            INSERT INTO PendingAccounts (username, password, email, verification_token, expires_at, ip_address, user_agent)
            VALUES (@username, @password, @email, @verificationToken, @expiresAt, @ipAddress, @userAgent)
          `)

        console.log(`[QUEUE] Cuenta pendiente creada en BD: ${job.username}`)
        return { verificationToken, username: job.username, email: job.email }
      })

      // NUEVO: Enviar email de verificación inmediatamente después de crear la cuenta
      console.log(`[QUEUE] Enviando email de verificación para: ${job.username}`)
      await this.sendVerificationEmail(dbResult.verificationToken, dbResult.username, dbResult.email)
      console.log(`[QUEUE] Email de verificación enviado para: ${job.username}`)

      this.stats.completed++
      this.stats.totalProcessed++
      console.log(`[QUEUE] Completado: ${job.id} (${job.username})`)

    } catch (error: any) {
      console.error(`[QUEUE] Error procesando ${job.id}:`, error.message)
      
      // Reintentar si no se han agotado los intentos
      if (job.retries < job.maxRetries) {
        job.retries++
        console.log(`[QUEUE] Reintentando ${job.id} (intento ${job.retries}/${job.maxRetries})`)
        
        // Añadir de vuelta a la cola con delay
        setTimeout(() => {
          this.queue.unshift(job) // Añadir al principio para prioridad
          this.stats.pending++
          this.processQueue()
        }, Math.pow(2, job.retries) * 1000) // Delay exponencial
      } else {
        this.stats.failed++
        this.stats.totalProcessed++
        console.error(`[QUEUE] Falló definitivamente: ${job.id} (${job.username})`)
      }
    } finally {
      this.processing.delete(job.id)
      this.stats.processing--
    }
  }

  // NUEVO: Función para enviar email de verificación
  private async sendVerificationEmail(verificationToken: string, username: string, email: string): Promise<void> {
    try {
      // Importar dinámicamente para evitar dependencias circulares
      const { sendEmail } = await import('../lib/resend')

      const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/es/verificar-email?token=${verificationToken}`

      console.log(`[QUEUE] Enviando email a: ${email} para cuenta: ${username}`)

      const emailResult = await sendEmail({
        to: email,
        subject: "Verifica tu cuenta - ETEREAL CONQUEST",
        html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { background-color: #1a1a1a; color: #ffffff; font-family: Arial, sans-serif; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .content { background-color: #1a1a1a; padding: 20px; border-radius: 5px; color: #ffffff; }
    .button { display: inline-block; background-color: #FFD700; color: #000000 !important; text-decoration: none; padding: 15px 30px; border-radius: 5px; font-weight: bold; margin: 20px 0; }
    .username { color: #FFD700; font-weight: bold; }
    .link { color: #FFD700; word-break: break-all; }
    .warning-text { color: #ffffff; margin-top: 20px; }
    .warning-icon { margin-right: 10px; }
    .new-account-badge { background-color: #007bff; color: white; padding: 3px 8px; border-radius: 3px; font-size: 12px; }
    p, span, div { color: #ffffff; }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <h2 style="color: #FFD700;">¡Bienvenido a ETEREAL CONQUEST!</h2>
      <p><span class="new-account-badge">NUEVA CUENTA</span> ¡Tu registro ha sido procesado exitosamente!</p>
      <p>Hola <span class="username">${username}</span>,</p>
      <p>Para completar tu registro y activar tu cuenta, haz clic en el siguiente botón:</p>
      
      <div style="text-align: center;">
        <a href="${verificationUrl}" class="button">Verificar mi Cuenta</a>
      </div>
      
      <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
      <p class="link">${verificationUrl}</p>
      
      <div class="warning-text">
        <span class="warning-icon">⏰</span>
        <span>Este enlace expirará en 24 horas.</span>
      </div>
      
      <div style="margin-top: 20px;">
        <span class="warning-icon">🎮</span>
        <span>Una vez verificada tu cuenta, podrás iniciar sesión y comenzar tu aventura en ETEREAL CONQUEST.</span>
      </div>
      
      <div style="margin-top: 20px;">
        <span class="warning-icon">🔒</span>
        <span>Si no te registraste en ETEREAL CONQUEST, puedes ignorar este mensaje.</span>
      </div>
      
      <div style="margin-top: 20px; font-size: 12px; color: #888; border-top: 1px solid #333; padding-top: 15px;">
        <span class="warning-icon">📧</span>
        <span>Cuenta: ${username} | Email: ${this.createEmailHint(email)}</span><br/>
        <span>Si no recibiste este email, puedes <a href="${process.env.NEXT_PUBLIC_BASE_URL}/es/reenviar-verificacion" style="color: #FFD700;">solicitar un reenvío</a>.</span>
      </div>
    </div>
  </div>
</body>
</html>
        `,
      })

      if (!emailResult.success) {
        console.error(`[QUEUE] Error enviando email para ${username}:`, emailResult.error)
        throw new Error(`Email delivery failed: ${emailResult.error}`)
      }

      console.log(`[QUEUE] ✅ Email de verificación enviado exitosamente para: ${username} a ${email}`)

    } catch (error: any) {
      console.error(`[QUEUE] Error enviando email de verificación para ${username}:`, error.message)
      throw error
    }
  }

  // Función helper para crear pista del email
  private createEmailHint(email: string): string {
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

  // Generar ID único para trabajos
  private generateJobId(): string {
    return `reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Obtener estadísticas de la cola
  getStats(): QueueStats & { queueLength: number; processingJobs: string[] } {
    return {
      ...this.stats,
      queueLength: this.queue.length,
      processingJobs: Array.from(this.processing)
    }
  }

  // Limpiar cola (para testing)
  clear(): void {
    this.queue = []
    this.processing.clear()
    this.stats = {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      totalProcessed: 0
    }
  }
}

// Instancia singleton de la cola
export const registrationQueue = new RegistrationQueue(50)

// Función helper para añadir registro a la cola
export function queueRegistration(data: {
  username: string
  password: string
  email: string
  ipAddress: string
  userAgent: string
}): string {
  return registrationQueue.addJob(data)
}

// Función para obtener estadísticas
export function getQueueStats() {
  return registrationQueue.getStats()
} 