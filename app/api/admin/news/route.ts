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

// GET - Obtener todas las noticias (para administración)
export async function GET(request: NextRequest) {
  try {
    console.log('[ADMIN-NEWS-API] Obteniendo noticias desde Supabase...')
    
    const url = new URL(request.url)
    const searchParams = url.searchParams
    const lang = searchParams.get("lang")
    const status = searchParams.get("status")

    // Construir query para Supabase
    let query = supabase.from('news').select('*')

    if (lang) {
      query = query.eq('language', lang)
    }

    if (status) {
      query = query.eq('status', status)
    }

    // Ordenar por fecha de creación descendente
    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error('[ADMIN-NEWS-API] Error obteniendo noticias:', error)
      throw error
    }

    console.log(`[ADMIN-NEWS-API] ${data?.length || 0} noticias obtenidas`)

    return NextResponse.json({
      success: true,
      news: data || []
    })
  } catch (error) {
    console.error("Error fetching admin news:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener noticias",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

// POST - Crear nueva noticia
export async function POST(request: NextRequest) {
  try {
    console.log('[ADMIN-NEWS-API] Creando nueva noticia...')
    
    const body = await request.json()
    const { title, content, image_url, language, status, featured } = body

    // Validaciones básicas
    if (!title || !content || !language) {
      return NextResponse.json(
        {
          success: false,
          error: "Título, contenido y idioma son requeridos"
        },
        { status: 400 }
      )
    }

    // Preparar datos para inserción
    const newsData = {
      title: title.trim(),
      content: content.trim(),
      image_url: image_url?.trim() || null,
      language: language.trim(),
      status: status?.trim() || "active",
      featured: Boolean(featured),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('[ADMIN-NEWS-API] Datos a insertar:', { ...newsData, content: newsData.content.substring(0, 100) + '...' })

    const { data, error } = await supabase
      .from('news')
      .insert([newsData])
      .select()
      .single()

    if (error) {
      console.error('[ADMIN-NEWS-API] Error creando noticia:', error)
      throw error
    }

    console.log("[ADMIN-NEWS-API] Nueva noticia creada:", data.id)

    return NextResponse.json({
      success: true,
      news: data,
      message: "Noticia creada exitosamente"
    })
  } catch (error) {
    console.error("Error creating news:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al crear noticia",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

// PUT - Actualizar noticia existente
export async function PUT(request: NextRequest) {
  try {
    console.log('[ADMIN-NEWS-API] Actualizando noticia...')
    
    const body = await request.json()
    const { id, title, content, image_url, language, status, featured } = body

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "ID de noticia es requerido"
        },
        { status: 400 }
      )
    }

    // Preparar datos para actualización
    const updateData = {
      ...(title && { title: title.trim() }),
      ...(content && { content: content.trim() }),
      ...(image_url !== undefined && { image_url: image_url?.trim() || null }),
      ...(language && { language: language.trim() }),
      ...(status && { status: status.trim() }),
      ...(featured !== undefined && { featured: Boolean(featured) }),
      updated_at: new Date().toISOString()
    }

    console.log('[ADMIN-NEWS-API] Actualizando noticia ID:', id)

    const { data, error } = await supabase
      .from('news')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[ADMIN-NEWS-API] Error actualizando noticia:', error)
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          {
            success: false,
            error: "Noticia no encontrada"
          },
          { status: 404 }
        )
      }
      throw error
    }

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          error: "Noticia no encontrada"
        },
        { status: 404 }
      )
    }

    console.log("[ADMIN-NEWS-API] Noticia actualizada:", data.id)

    return NextResponse.json({
      success: true,
      news: data,
      message: "Noticia actualizada exitosamente"
    })
  } catch (error) {
    console.error("Error updating news:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al actualizar noticia",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar noticia
export async function DELETE(request: NextRequest) {
  try {
    console.log('[ADMIN-NEWS-API] Eliminando noticia...')
    
    const url = new URL(request.url)
    const id = url.searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "ID de noticia es requerido"
        },
        { status: 400 }
      )
    }

    const newsId = parseInt(id, 10)
    
    if (isNaN(newsId)) {
      return NextResponse.json(
        {
          success: false,
          error: "ID de noticia inválido"
        },
        { status: 400 }
      )
    }

    console.log('[ADMIN-NEWS-API] Eliminando noticia ID:', newsId)

    const { error } = await supabase
      .from('news')
      .delete()
      .eq('id', newsId)

    if (error) {
      console.error('[ADMIN-NEWS-API] Error eliminando noticia:', error)
      throw error
    }

    console.log("[ADMIN-NEWS-API] Noticia eliminada ID:", newsId)

    return NextResponse.json({
      success: true,
      message: "Noticia eliminada exitosamente"
    })
  } catch (error) {
    console.error("Error deleting news:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al eliminar noticia",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
} 