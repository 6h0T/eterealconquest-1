// Función para registrar errores 404 y problemas de recursos
export function trackResourceError(resourceType: "page" | "image" | "asset", url: string, referrer?: string) {
  // En producción, podrías enviar esto a un servicio de análisis o logging
  console.error(`[Error de recurso] Tipo: ${resourceType}, URL: ${url}, Referrer: ${referrer || "desconocido"}`)

  // Ejemplo de cómo enviar a un endpoint de análisis (descomentarlo cuando esté listo)
  /*
  if (typeof window !== 'undefined') {
    fetch('/api/log-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: resourceType,
        url,
        referrer: referrer || window.location.href,
        userAgent: window.navigator.userAgent,
        timestamp: new Date().toISOString()
      }),
    }).catch(err => console.error('Error al registrar el error:', err))
  }
  */
}

// Función para configurar listeners globales para errores de recursos
export function setupErrorTracking() {
  if (typeof window !== "undefined") {
    // Capturar errores de carga de imágenes
    window.addEventListener(
      "error",
      (event) => {
        const target = event.target as HTMLElement
        if (target.tagName === "IMG") {
          trackResourceError("image", (target as HTMLImageElement).src, document.referrer)
        }
      },
      true,
    )

    // Interceptar respuestas 404 en fetch (opcional, más avanzado)
    const originalFetch = window.fetch
    window.fetch = async (input, init) => {
      const response = await originalFetch(input, init)
      if (response.status === 404) {
        const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : "unknown"
        trackResourceError("asset", url, document.referrer)
      }
      return response
    }
  }
}
