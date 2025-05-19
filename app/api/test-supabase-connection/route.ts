import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/streamers"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    console.log("GET /api/test-supabase-connection - Probando conexión con Supabase")

    // Verificar variables de entorno
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl) {
      return NextResponse.json({ error: "NEXT_PUBLIC_SUPABASE_URL no está definido" }, { status: 500 })
    }

    if (!supabaseKey) {
      return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY no está definido" }, { status: 500 })
    }

    // Probar conexión
    const { data, error } = await supabaseAdmin.from("streamers").select("count").single()

    if (error) {
      console.error("Error al probar conexión con Supabase:", error)
      return NextResponse.json({ error: `Error al probar conexión con Supabase: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Conexión con Supabase establecida correctamente",
      supabaseUrl,
      supabaseKeyLength: supabaseKey.length,
      data,
    })
  } catch (error: any) {
    console.error("Error al probar conexión con Supabase:", error)
    return NextResponse.json({ error: `Error al probar conexión con Supabase: ${error.message}` }, { status: 500 })
  }
}
