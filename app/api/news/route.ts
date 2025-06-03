import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICES_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// GET - Obtener todas las noticias públicas
export async function GET(request: NextRequest) {
  try {
    console.log('[NEWS-API] Obteniendo noticias desde Supabase...')
    
    const url = new URL(request.url)
    const searchParams = url.searchParams
    const lang = searchParams.get("lang") || "es"
    const featured = searchParams.get("featured") === "true"

    // Construir query para Supabase
    let query = supabase
      .from('news')
      .select('*')
      .eq('language', lang)
      .eq('status', 'active')

    if (featured) {
      query = query.eq('featured', true)
    }

    // Ordenar por destacadas primero, luego por fecha
    query = query.order('featured', { ascending: false })
                 .order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error('[NEWS-API] Error obteniendo noticias:', error)
      throw error
    }

    console.log(`[NEWS-API] ${data?.length || 0} noticias obtenidas para idioma: ${lang}`)

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("[NEWS-API] Error fetching news:", error)
    return NextResponse.json(
      {
        message: "Error fetching news",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
