import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    // Obtener los parámetros de la URL
    const url = new URL(request.url)
    const width = Number.parseInt(url.searchParams.get("width") || "300", 10)
    const height = Number.parseInt(url.searchParams.get("height") || "150", 10)
    const text = url.searchParams.get("text") || "Placeholder"

    // Validar parámetros
    const validWidth = Math.max(50, Math.min(2000, width))
    const validHeight = Math.max(50, Math.min(2000, height))
    
    // Escapar caracteres especiales XML/HTML en el texto
    const validText = text
      .slice(0, 100) // Limitar longitud del texto
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")

    // Calcular tamaño de fuente basado en las dimensiones
    const fontSize = Math.min(validWidth / 10, validHeight / 3, 32)

    // Crear un SVG con los parámetros proporcionados
    const svg = `<svg width="${validWidth}" height="${validHeight}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#1a1a2e" stroke="#e2b007" stroke-width="2"/>
  <text 
    x="50%" 
    y="50%" 
    font-family="Arial, sans-serif" 
    font-size="${fontSize}" 
    fill="#e2b007" 
    text-anchor="middle" 
    dominant-baseline="middle"
  >
    ${validText}
  </text>
</svg>`

    // Devolver el SVG directamente
    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("Error generando placeholder:", error)
    
    // Devolver un SVG de error simple
    const errorSvg = `<svg width="300" height="150" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#ff4444"/>
  <text x="50%" y="50%" font-family="Arial" font-size="16" fill="white" text-anchor="middle" dominant-baseline="middle">
    Error
  </text>
</svg>`

    return new NextResponse(errorSvg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "no-cache",
      },
    })
  }
}
