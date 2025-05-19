import { NextResponse } from "next/server"
import { uploadClassIcons } from "@/lib/upload-class-icons"

export async function GET() {
  try {
    const result = await uploadClassIcons()
    return NextResponse.json({ success: true, urls: result })
  } catch (error) {
    console.error("Error en la ruta de API:", error)
    return NextResponse.json({ success: false, error: "Error al subir los iconos" }, { status: 500 })
  }
}
