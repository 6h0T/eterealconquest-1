import { NextResponse } from "next/server"
import {
  getStreamers,
  addStreamer,
  updateStreamer,
  deleteStreamer,
  toggleStreamerStatus,
  toggleLiveStatus,
  type StreamerInput,
} from "@/lib/streamers"
import { supabaseAdmin } from "@/lib/supabaseClient"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    console.log("GET /api/admin/streamers - Obteniendo streamers")

    // Verificar si tenemos acceso a Supabase
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "No se pudo conectar a la base de datos. Credenciales de Supabase no disponibles." },
        { status: 503 },
      )
    }

    const streamers = await getStreamers()
    return NextResponse.json({ streamers })
  } catch (error: any) {
    console.error("Error al obtener streamers:", error)
    return NextResponse.json({ error: `Error al obtener streamers: ${error.message}` }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    console.log("POST /api/admin/streamers - Añadiendo streamer")

    // Verificar si tenemos acceso a Supabase
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "No se pudo conectar a la base de datos. Credenciales de Supabase no disponibles." },
        { status: 503 },
      )
    }

    // Obtener datos del cuerpo de la solicitud
    const data = await req.json()
    console.log("Datos recibidos:", data)

    // Validar datos
    if (!data.streamer_name || !data.platform || !data.channel_url) {
      console.error("Faltan campos requeridos:", { data })
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    const streamerInput: StreamerInput = {
      streamer_name: data.streamer_name,
      platform: data.platform,
      channel_url: data.channel_url,
      is_live: data.is_live || false,
      is_active: data.is_active !== undefined ? data.is_active : true,
      thumbnail_url: data.thumbnail_url || null,
      description: data.description || null,
    }

    console.log("Enviando datos a Supabase:", streamerInput)
    const streamer = await addStreamer(streamerInput)
    console.log("Streamer añadido:", streamer)

    return NextResponse.json({ streamer })
  } catch (error: any) {
    console.error("Error al añadir streamer:", error)
    return NextResponse.json({ error: `Error al añadir streamer: ${error.message}` }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    console.log("PUT /api/admin/streamers - Actualizando streamer")

    // Verificar si tenemos acceso a Supabase
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "No se pudo conectar a la base de datos. Credenciales de Supabase no disponibles." },
        { status: 503 },
      )
    }

    // Obtener datos del cuerpo de la solicitud
    const data = await req.json()
    console.log("Datos recibidos:", data)

    // Validar ID
    if (!data.id) {
      console.error("ID de streamer requerido")
      return NextResponse.json({ error: "ID de streamer requerido" }, { status: 400 })
    }

    // Preparar actualizaciones
    const updates: Partial<StreamerInput> = {}
    if (data.streamer_name) updates.streamer_name = data.streamer_name
    if (data.platform) updates.platform = data.platform
    if (data.channel_url) updates.channel_url = data.channel_url
    if (data.is_live !== undefined) updates.is_live = data.is_live
    if (data.is_active !== undefined) updates.is_active = data.is_active
    if (data.thumbnail_url !== undefined) updates.thumbnail_url = data.thumbnail_url
    if (data.description !== undefined) updates.description = data.description

    console.log(`Actualizando streamer con ID ${data.id}:`, updates)
    const streamer = await updateStreamer(data.id, updates)
    console.log("Streamer actualizado:", streamer)

    return NextResponse.json({ streamer })
  } catch (error: any) {
    console.error("Error al actualizar streamer:", error)
    return NextResponse.json({ error: `Error al actualizar streamer: ${error.message}` }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    console.log("DELETE /api/admin/streamers - Eliminando streamer")

    // Verificar si tenemos acceso a Supabase
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "No se pudo conectar a la base de datos. Credenciales de Supabase no disponibles." },
        { status: 503 },
      )
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    console.log("ID recibido:", id)

    if (!id) {
      console.error("ID de streamer requerido")
      return NextResponse.json({ error: "ID de streamer requerido" }, { status: 400 })
    }

    await deleteStreamer(Number.parseInt(id))
    console.log(`Streamer con ID ${id} eliminado correctamente`)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error al eliminar streamer:", error)
    return NextResponse.json({ error: `Error al eliminar streamer: ${error.message}` }, { status: 500 })
  }
}

// Endpoint para cambiar el estado activo/inactivo
export async function PATCH(req: Request) {
  try {
    console.log("PATCH /api/admin/streamers - Cambiando estado del streamer")

    // Verificar si tenemos acceso a Supabase
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "No se pudo conectar a la base de datos. Credenciales de Supabase no disponibles." },
        { status: 503 },
      )
    }

    // Obtener datos del cuerpo de la solicitud
    const data = await req.json()
    console.log("Datos recibidos:", data)

    if (!data.id) {
      console.error("ID de streamer requerido")
      return NextResponse.json({ error: "ID de streamer requerido" }, { status: 400 })
    }

    // Si se proporciona is_active, cambiar estado activo
    if (data.is_active !== undefined) {
      console.log(`Cambiando estado activo del streamer con ID ${data.id} a ${data.is_active}`)
      const streamer = await toggleStreamerStatus(data.id, data.is_active)
      console.log("Streamer actualizado:", streamer)
      return NextResponse.json({ streamer })
    }

    // Si se proporciona is_live, cambiar estado en vivo
    if (data.is_live !== undefined) {
      console.log(`Cambiando estado en vivo del streamer con ID ${data.id} a ${data.is_live}`)
      const streamer = await toggleLiveStatus(data.id, data.is_live)
      console.log("Streamer actualizado:", streamer)
      return NextResponse.json({ streamer })
    }

    console.error("No se proporcionó ningún estado para cambiar")
    return NextResponse.json({ error: "No se proporcionó ningún estado para cambiar" }, { status: 400 })
  } catch (error: any) {
    console.error("Error al cambiar estado del streamer:", error)
    return NextResponse.json({ error: `Error al cambiar estado del streamer: ${error.message}` }, { status: 500 })
  }
}
