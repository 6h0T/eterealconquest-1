import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Crear cliente de Supabase con clave anónima para operaciones públicas
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
)

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    // Obtener streamers activos
    const { data, error } = await supabase
      .from("streamers")
      .select("*")
      .eq("is_active", true)
      .order("is_live", { ascending: false })
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error al obtener streamers:", error)
      return NextResponse.json({ error: "Error al obtener streamers" }, { status: 500 })
    }

    return NextResponse.json({
      streamers: data,
      liveCount: data.filter((streamer) => streamer.is_live).length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error inesperado:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
