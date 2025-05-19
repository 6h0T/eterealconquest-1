import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Crear cliente de Supabase con clave de servicio para operaciones administrativas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICES_ROLE_KEY || ""

// Verificar si tenemos las credenciales necesarias
let supabaseAdmin = null
if (supabaseUrl && supabaseKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseKey)
} else {
  console.warn("Supabase URL o Service Role Key no disponibles. API de streams no funcionará correctamente.")
}

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    console.log("GET /api/admin/streams - Obteniendo streams")

    // Verificar si el cliente de Supabase está inicializado
    if (!supabaseAdmin) {
      console.error("Cliente de Supabase no inicializado. Credenciales no disponibles.")
      return NextResponse.json(
        { error: "Servicio de base de datos no disponible. Por favor, contacte al administrador." },
        { status: 503 },
      )
    }

    const { data, error } = await supabaseAdmin
      .from("streams")
      .select("*")
      .order("is_live", { ascending: false })
      .order("title", { ascending: true })

    if (error) {
      console.error("Error al obtener streams:", error)
      return NextResponse.json({ error: `Error al obtener streams: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ streams: data })
  } catch (error: any) {
    console.error("Error al obtener streams:", error)
    return NextResponse.json({ error: `Error al obtener streams: ${error.message}` }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    console.log("POST /api/admin/streams - Añadiendo stream")

    // Verificar si el cliente de Supabase está inicializado
    if (!supabaseAdmin) {
      console.error("Cliente de Supabase no inicializado. Credenciales no disponibles.")
      return NextResponse.json(
        { error: "Servicio de base de datos no disponible. Por favor, contacte al administrador." },
        { status: 503 },
      )
    }

    // Obtener datos del cuerpo de la solicitud
    const data = await req.json()
    console.log("Datos recibidos:", data)

    // Validar datos
    if (!data.title || !data.platform || !data.url || !data.embed_url) {
      console.error("Faltan campos requeridos:", { data })
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    // Añadir nuevo stream
    const { error } = await supabaseAdmin.from("streams").insert([
      {
        title: data.title,
        platform: data.platform,
        url: data.url,
        embed_url: data.embed_url,
        thumbnail_url: data.thumbnail_url || null,
        is_live: data.is_live || false,
        is_active: data.is_active !== undefined ? data.is_active : true,
      },
    ])

    if (error) {
      console.error("Error al añadir stream:", error)
      return NextResponse.json({ error: `Error al añadir stream: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error al añadir stream:", error)
    return NextResponse.json({ error: `Error al añadir stream: ${error.message}` }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    console.log("PUT /api/admin/streams - Actualizando stream")

    // Verificar si el cliente de Supabase está inicializado
    if (!supabaseAdmin) {
      console.error("Cliente de Supabase no inicializado. Credenciales no disponibles.")
      return NextResponse.json(
        { error: "Servicio de base de datos no disponible. Por favor, contacte al administrador." },
        { status: 503 },
      )
    }

    // Obtener datos del cuerpo de la solicitud
    const data = await req.json()
    console.log("Datos recibidos:", data)

    // Validar ID
    if (!data.id) {
      console.error("ID de stream requerido")
      return NextResponse.json({ error: "ID de stream requerido" }, { status: 400 })
    }

    // Actualizar stream
    const { error } = await supabaseAdmin
      .from("streams")
      .update({
        title: data.title,
        platform: data.platform,
        url: data.url,
        embed_url: data.embed_url,
        thumbnail_url: data.thumbnail_url || null,
        is_live: data.is_live,
        is_active: data.is_active,
      })
      .eq("id", data.id)

    if (error) {
      console.error("Error al actualizar stream:", error)
      return NextResponse.json({ error: `Error al actualizar stream: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error al actualizar stream:", error)
    return NextResponse.json({ error: `Error al actualizar stream: ${error.message}` }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    console.log("DELETE /api/admin/streams - Eliminando stream")

    // Verificar si el cliente de Supabase está inicializado
    if (!supabaseAdmin) {
      console.error("Cliente de Supabase no inicializado. Credenciales no disponibles.")
      return NextResponse.json(
        { error: "Servicio de base de datos no disponible. Por favor, contacte al administrador." },
        { status: 503 },
      )
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    console.log("ID recibido:", id)

    if (!id) {
      console.error("ID de stream requerido")
      return NextResponse.json({ error: "ID de stream requerido" }, { status: 400 })
    }

    // Eliminar stream
    const { error } = await supabaseAdmin.from("streams").delete().eq("id", id)

    if (error) {
      console.error("Error al eliminar stream:", error)
      return NextResponse.json({ error: `Error al eliminar stream: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error al eliminar stream:", error)
    return NextResponse.json({ error: `Error al eliminar stream: ${error.message}` }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    console.log("PATCH /api/admin/streams - Cambiando estado del stream")

    // Verificar si el cliente de Supabase está inicializado
    if (!supabaseAdmin) {
      console.error("Cliente de Supabase no inicializado. Credenciales no disponibles.")
      return NextResponse.json(
        { error: "Servicio de base de datos no disponible. Por favor, contacte al administrador." },
        { status: 503 },
      )
    }

    // Obtener datos del cuerpo de la solicitud
    const data = await req.json()
    console.log("Datos recibidos:", data)

    if (!data.id) {
      console.error("ID de stream requerido")
      return NextResponse.json({ error: "ID de stream requerido" }, { status: 400 })
    }

    // Preparar actualizaciones
    const updates: any = {}
    if (data.is_live !== undefined) updates.is_live = data.is_live
    if (data.is_active !== undefined) updates.is_active = data.is_active

    // Actualizar stream
    const { error } = await supabaseAdmin.from("streams").update(updates).eq("id", data.id)

    if (error) {
      console.error("Error al cambiar estado del stream:", error)
      return NextResponse.json({ error: `Error al cambiar estado del stream: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error al cambiar estado del stream:", error)
    return NextResponse.json({ error: `Error al cambiar estado del stream: ${error.message}` }, { status: 500 })
  }
}
