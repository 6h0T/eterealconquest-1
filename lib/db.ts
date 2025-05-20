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
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  connectionTimeout: 30000, // Aumentar el tiempo de espera de conexión
  requestTimeout: 30000, // Aumentar el tiempo de espera de solicitud
}

// Implementar un enfoque diferente para la gestión de conexiones
// En lugar de mantener un pool global, crearemos una nueva conexión para cada solicitud
export async function connectToDB() {
  try {
    console.log("[SERVER] Creando nueva conexión a la base de datos...")
    const newPool = await sql.connect(config)
    console.log("[SERVER] Conexión exitosa a la base de datos")
    return newPool
  } catch (error: any) {
    console.error("[SERVER] Database connection error:", error)
    throw new Error(`No se pudo conectar a la base de datos: ${error.message}`)
  }
}

export async function executeQuery(query: string, params = {}) {
  let pool = null
  try {
    pool = await connectToDB()

    // Crear una solicitud
    let request = pool.request()

    // Añadir parámetros si existen
    for (const [key, value] of Object.entries(params)) {
      request = request.input(key, value)
    }

    // Ejecutar la consulta
    const result = await request.query(query)

    return result
  } catch (error: any) {
    console.error("[SERVER] Error executing query:", error)
    throw error
  } finally {
    // Siempre cerrar la conexión después de usarla
    if (pool) {
      try {
        await pool.close()
        console.log("[SERVER] Conexión cerrada correctamente")
      } catch (closeErr) {
        console.error("[SERVER] Error al cerrar la conexión:", closeErr)
      }
    }
  }
}

export { sql }
