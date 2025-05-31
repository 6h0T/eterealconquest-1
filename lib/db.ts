// lib/db.ts
import sql from "mssql"

const config = {
  server: process.env.SQL_DB_HOST || process.env.DB_HOST || process.env.NEXT_PUBLIC_DB_HOST || "177.54.146.73",
  database: process.env.SQL_DB_NAME || process.env.DB_NAME || process.env.NEXT_PUBLIC_DB_NAME || "_obj",
  user: process.env.SQL_DB_USER || process.env.DB_USER || process.env.NEXT_PUBLIC_DB_USER || "sa2",
  password: process.env.SQL_DB_PASS || process.env.DB_PASS || process.env.NEXT_PUBLIC_DB_PASS || "qA83<tkA3<|6",
  port: Number(process.env.SQL_DB_PORT || process.env.DB_PORT || process.env.NEXT_PUBLIC_DB_PORT) || 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    abortTransactionOnError: true,
  },
  pool: {
    max: 100,          // Aumentado para alta concurrencia
    min: 10,           // Mantener más conexiones activas
    idleTimeoutMillis: 300000,     // 5 minutos
    acquireTimeoutMillis: 60000,   // 1 minuto para adquirir conexión
    createTimeoutMillis: 60000,    // Timeout para crear nueva conexión
    destroyTimeoutMillis: 5000,    // Timeout para destruir conexión
    reapIntervalMillis: 1000,      // Revisar conexiones cada segundo
    createRetryIntervalMillis: 200, // Reintentar crear conexión cada 200ms
  },
  connectionTimeout: 60000,
  requestTimeout: 60000,
}

// Pool global para reutilizar conexiones
let globalPool: sql.ConnectionPool | null = null

// Función para esperar con delay exponencial
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Función para obtener o crear el pool global
export async function getGlobalPool(): Promise<sql.ConnectionPool> {
  if (globalPool && globalPool.connected) {
    return globalPool
  }

  if (globalPool && globalPool.connecting) {
    // Si ya se está conectando, esperar
    let attempts = 0
    while (globalPool.connecting && attempts < 30) { // Máximo 3 segundos
      await delay(100)
      attempts++
    }
    if (globalPool.connected) {
      return globalPool
    }
  }

  // Crear nuevo pool
  globalPool = new sql.ConnectionPool(config)
  
  // Manejar eventos del pool
  globalPool.on('connect', () => {
    console.log('[POOL] Conexión establecida')
  })
  
  globalPool.on('close', () => {
    console.log('[POOL] Pool cerrado')
    globalPool = null
  })
  
  globalPool.on('error', (err) => {
    console.error('[POOL] Error en el pool:', err)
    globalPool = null
  })

  await globalPool.connect()
  console.log(`[POOL] Pool creado con ${config.pool.max} conexiones máximas`)
  
  return globalPool
}

// Función de conexión con reintentos automáticos (ahora usa pool global)
export async function connectToDB(maxRetries = 3) {
  let lastError: any = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[SERVER] Obteniendo conexión del pool - intento ${attempt}/${maxRetries}`)
      
      const pool = await getGlobalPool()
      console.log(`[SERVER] Conexión obtenida del pool en intento ${attempt}`)
      return pool
      
    } catch (error: any) {
      lastError = error
      console.error(`[SERVER] Error en intento ${attempt}:`, error.message)
      
      // Reset del pool global si hay error
      if (globalPool) {
        try {
          await globalPool.close()
        } catch (closeErr) {
          console.error('[SERVER] Error cerrando pool:', closeErr)
        }
        globalPool = null
      }
      
      if (attempt < maxRetries) {
        const delayMs = Math.pow(2, attempt - 1) * 1000 // 1s, 2s, 4s
        console.log(`[SERVER] Esperando ${delayMs}ms antes del siguiente intento...`)
        await delay(delayMs)
      }
    }
  }
  
  throw new Error(`No se pudo conectar a la base de datos después de ${maxRetries} intentos: ${lastError?.message || 'Error desconocido'}`)
}

// Función para ejecutar queries con reintentos y pool optimizado
export async function executeQueryWithRetry(queryFn: (pool: sql.ConnectionPool) => Promise<any>, maxRetries = 3) {
  let lastError: any = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[SERVER] Ejecutando query - intento ${attempt}/${maxRetries}`)
      
      // Usar pool global (no cerrar después)
      const pool = await connectToDB(2)
      
      // Ejecutar la función de query
      const result = await queryFn(pool)
      
      console.log(`[SERVER] Query ejecutada exitosamente en intento ${attempt}`)
      return result
      
    } catch (error: any) {
      lastError = error
      console.error(`[SERVER] Error en query intento ${attempt}:`, error.message)
      
      // Solo resetear pool en errores de conexión graves
      if (error.message && (
        error.message.includes('Connection is closed') ||
        error.message.includes('Connection lost') ||
        error.message.includes('ECONNRESET')
      )) {
        console.log('[SERVER] Error de conexión grave, reseteando pool...')
        if (globalPool) {
          try {
            await globalPool.close()
          } catch (closeErr) {
            console.error('[SERVER] Error cerrando pool:', closeErr)
          }
          globalPool = null
        }
      }
      
      if (attempt < maxRetries) {
        const delayMs = Math.pow(2, attempt - 1) * 500 // 500ms, 1s, 2s
        console.log(`[SERVER] Esperando ${delayMs}ms antes del siguiente intento de query...`)
        await delay(delayMs)
      }
    }
  }
  
  throw new Error(`Error ejecutando query después de ${maxRetries} intentos: ${lastError?.message || 'Error desconocido'}`)
}

// Función legacy para compatibilidad (ahora optimizada)
export async function executeQuery(query: string, params = {}) {
  return executeQueryWithRetry(async (pool) => {
    const request = pool.request()

    // Añadir parámetros si existen
    for (const [key, value] of Object.entries(params)) {
      request.input(key, value)
    }

    const result = await request.query(query)
    return result
  })
}

// Función para cerrar el pool global (usar en shutdown)
export async function closeGlobalPool() {
  if (globalPool) {
    try {
      await globalPool.close()
      console.log('[POOL] Pool global cerrado correctamente')
    } catch (error) {
      console.error('[POOL] Error cerrando pool global:', error)
    }
    globalPool = null
  }
}

export { sql }
