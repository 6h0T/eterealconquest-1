import { NextResponse } from "next/server"
import sharp from "sharp"

export async function GET(request: Request) {
  try {
    // Obtener los parámetros de la URL
    const url = new URL(request.url)
    const width = Number.parseInt(url.searchParams.get("width") || "300", 10)
    const height = Number.parseInt(url.searchParams.get("height") || "150", 10)
    const text = url.searchParams.get("text") || "Placeholder"

    // Crear un SVG con los parámetros proporcionados
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#1a1a2e"/>
        <text 
          x="50%" 
          y="50%" 
          font-family="Arial, sans-serif" 
          font-size="24" 
          fill="#e2b007" 
          text-anchor="middle" 
          dominant-baseline="middle"
        >
          ${text}
        </text>
      </svg>
    `

    // Convertir el SVG a PNG usando sharp
    const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer()

    // Devolver la imagen con los headers adecuados
    return new NextResponse(pngBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("Error generando placeholder:", error)
    return NextResponse.json({ error: "Error generando imagen" }, { status: 500 })
  }
}
