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

// GET - Obtener una noticia pública por ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log(`[NEWS-API] Obteniendo noticia ID: ${params.id}`)
    
    const id = parseInt(params.id, 10)
    
    if (isNaN(id)) {
      return NextResponse.json({ message: "ID inválido" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('id', id)
      .eq('status', 'active')
      .single()

    if (error) {
      console.error(`[NEWS-API] Error obteniendo noticia ${id}:`, error)
      if (error.code === 'PGRST116') {
        return NextResponse.json({ message: "News not found" }, { status: 404 })
      }
      throw error
    }

    if (!data) {
      return NextResponse.json({ message: "News not found" }, { status: 404 })
    }

    console.log(`[NEWS-API] Noticia encontrada: ${data.title}`)
    return NextResponse.json(data)
  } catch (error) {
    console.error("[NEWS-API] Error fetching news by ID:", error)
    return NextResponse.json(
      {
        message: "Error fetching news",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
