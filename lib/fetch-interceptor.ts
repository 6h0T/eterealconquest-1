/**
 * Interceptor de fetch que garantiza que todas las solicitudes a nuestro dominio
 * utilicen URLs relativas, evitando problemas de CORS.
 */

// Dominios de nuestra aplicación (con y sin www)
const OUR_DOMAINS = [
  "mu-occidental.com",
  "www.mu-occidental.com",
  // Agrega aquí otros dominios si es necesario (staging, desarrollo, etc.)
]

/**
 * Verifica si una URL pertenece a nuestro dominio
 */
function isOurDomain(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return OUR_DOMAINS.some((domain) => urlObj.hostname === domain)
  } catch (e) {
    // Si no es una URL válida, asumimos que es una ruta relativa
    return false
  }
}

/**
 * Convierte una URL absoluta a relativa si pertenece a nuestro dominio
 */
function convertToRelativeUrl(url: string): string {
  // Si ya es una URL relativa, la devolvemos tal cual
  if (url.startsWith("/")) {
    return url
  }

  try {
    const urlObj = new URL(url)

    // Si es nuestro dominio, convertimos a relativa
    if (isOurDomain(url)) {
      // Extraemos el pathname y search de la URL
      return `${urlObj.pathname}${urlObj.search}${urlObj.hash}`
    }

    // Si no es nuestro dominio, devolvemos la URL original
    return url
  } catch (e) {
    // Si no es una URL válida, la devolvemos tal cual
    return url
  }
}

/**
 * Opciones por defecto para las solicitudes fetch
 */
const defaultOptions: RequestInit = {
  credentials: "same-origin",
  headers: {
    "Content-Type": "application/json",
  },
}

/**
 * Wrapper de fetch que garantiza URLs relativas para nuestro dominio
 */
export async function safeFetch(url: string, options: RequestInit = {}): Promise<Response> {
  // Convertimos la URL a relativa si es necesario
  const safeUrl = convertToRelativeUrl(url)

  // Mezclamos las opciones por defecto con las proporcionadas
  const mergedOptions: RequestInit = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  }

  try {
    // Realizamos la solicitud con la URL segura
    const response = await fetch(safeUrl, mergedOptions)

    // Registramos información útil para depuración
    console.debug(`[safeFetch] ${options.method || "GET"} ${safeUrl} - Status: ${response.status}`)

    return response
  } catch (error) {
    // Registramos el error para depuración
    console.error(`[safeFetch] Error fetching ${safeUrl}:`, error)
    throw error
  }
}

/**
 * Versión de safeFetch que también maneja la conversión a JSON
 */
export async function safeFetchJson<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await safeFetch(url, options)

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`HTTP Error ${response.status}: ${errorText}`)
  }

  return response.json()
}

/**
 * Función para crear opciones de fetch con método POST y cuerpo JSON
 */
export function createPostOptions(data: any): RequestInit {
  return {
    method: "POST",
    body: JSON.stringify(data),
  }
}

/**
 * Función para crear opciones de fetch con método GET
 */
export function createGetOptions(): RequestInit {
  return {
    method: "GET",
  }
}
