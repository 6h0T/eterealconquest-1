import { NextResponse } from "next/server"
import { ensureStreamersTable } from "@/lib/streamers"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    console.log("GET /api/streamers/ensure-table - Asegurando que la tabla streamers existe")

    await ensureStreamersTable()

    return NextResponse.json({ success: true, message: "Tabla streamers verificada correctamente" })
  } catch (error: any) {
    console.error("Error al asegurar que la tabla streamers existe:", error)
    return NextResponse.json(
      { error: `Error al asegurar que la tabla streamers existe: ${error.message}` },
      { status: 500 },
    )
  }
}
