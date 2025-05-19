import { NextResponse } from "next/server"
import { uploadDividerImage } from "@/lib/upload-divider"

export async function GET() {
  try {
    const imageUrl = await uploadDividerImage()
    return NextResponse.json({ success: true, url: imageUrl })
  } catch (error) {
    console.error("Error en la ruta de subida:", error)
    return NextResponse.json({ success: false, error: "Error al subir la imagen" }, { status: 500 })
  }
}
