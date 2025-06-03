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

      await executeQueryWithRetry(async (pool) => {
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

        return { verificationToken, username: job.username, email: job.email }
      })

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