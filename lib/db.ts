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
  },
  pool: {
    max: 20, // Aumentar el pool máximo
    min: 2,  // Mantener conexiones mínimas
    idleTimeoutMillis: 60000, // Aumentar timeout de idle
    acquireTimeoutMillis: 60000, // Timeout para adquirir conexión
  },
  connectionTimeout: 60000, // Aumentar timeout de conexión
  requestTimeout: 60000,     // Aumentar timeout de request
}

// Función para esperar con delay exponencial
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Función de conexión con reintentos automáticos
export async function connectToDB(maxRetries = 3) {
  let lastError: any = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[SERVER] Intento de conexión ${attempt}/${maxRetries}...`)
      
      // Crear nueva conexión
      const newPool = new sql.ConnectionPool(config)
      
      // Conectar con timeout
      await newPool.connect()
      
      console.log(`[SERVER] Conexión exitosa en intento ${attempt}`)
      return newPool
      
    } catch (error: any) {
      lastError = error
      console.error(`[SERVER] Error en intento ${attempt}:`, error.message)
      
      // Si no es el último intento, esperar antes de reintentar
      if (attempt < maxRetries) {
        const delayMs = Math.pow(2, attempt - 1) * 1000 // Delay exponencial: 1s, 2s, 4s
        console.log(`[SERVER] Esperando ${delayMs}ms antes del siguiente intento...`)
        await delay(delayMs)
      }
    }
  }
  
  // Si llegamos aquí, todos los intentos fallaron
  console.error(`[SERVER] Todos los intentos de conexión fallaron. Último error:`, lastError)
  throw new Error(`No se pudo conectar a la base de datos después de ${maxRetries} intentos: ${lastError?.message || 'Error desconocido'}`)
}

// Función para ejecutar queries con reintentos
export async function executeQueryWithRetry(queryFn: (pool: sql.ConnectionPool) => Promise<any>, maxRetries = 3) {
  let pool: sql.ConnectionPool | null = null
  let lastError: any = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[SERVER] Ejecutando query - intento ${attempt}/${maxRetries}`)
      
      // Obtener conexión
      pool = await connectToDB(2) // Menos reintentos para conexión individual
      
      // Ejecutar la función de query
      const result = await queryFn(pool)
      
      console.log(`[SERVER] Query ejecutada exitosamente en intento ${attempt}`)
      return result
      
    } catch (error: any) {
      lastError = error
      console.error(`[SERVER] Error en query intento ${attempt}:`, error.message)
      
      // Cerrar pool si existe
      if (pool) {
        try {
          await pool.close()
          console.log(`[SERVER] Pool cerrado después del error en intento ${attempt}`)
        } catch (closeErr) {
          console.error(`[SERVER] Error cerrando pool:`, closeErr)
        }
        pool = null
      }
      
      // Si no es el último intento, esperar antes de reintentar
      if (attempt < maxRetries) {
        const delayMs = Math.pow(2, attempt - 1) * 500 // Delay más corto para queries: 500ms, 1s, 2s
        console.log(`[SERVER] Esperando ${delayMs}ms antes del siguiente intento de query...`)
        await delay(delayMs)
      }
    } finally {
      // Asegurar que el pool se cierre
      if (pool && attempt === maxRetries) {
        try {
          await pool.close()
          console.log(`[SERVER] Pool cerrado correctamente`)
        } catch (closeErr) {
          console.error(`[SERVER] Error al cerrar pool final:`, closeErr)
        }
      }
    }
  }
  
  // Si llegamos aquí, todos los intentos fallaron
  console.error(`[SERVER] Todos los intentos de query fallaron. Último error:`, lastError)
  throw new Error(`Error ejecutando query después de ${maxRetries} intentos: ${lastError?.message || 'Error desconocido'}`)
}

// Función legacy para compatibilidad (ahora con reintentos)
export async function executeQuery(query: string, params = {}) {
  return executeQueryWithRetry(async (pool) => {
    // Crear una solicitud
    let request = pool.request()

    // Añadir parámetros si existen
    for (const [key, value] of Object.entries(params)) {
      request = request.input(key, value)
    }

    // Ejecutar la consulta
    const result = await request.query(query)
    return result
  })
}

export { sql }
