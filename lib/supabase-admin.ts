import { createClient } from "@supabase/supabase-js"

// Reemplazar la inicialización del cliente de Supabase con esta versión mejorada

// Verificar que las variables de entorno estén definidas
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error("NEXT_PUBLIC_SUPABASE_URL no está definido")
}

// Usar la variable correcta según las variables de entorno disponibles
if (!process.env.SUPABASE_SERVICES_ROLE_KEY) {
  console.error("SUPABASE_SERVICES_ROLE_KEY no está definido")
}

// Crear cliente de Supabase con clave de servicio para operaciones administrativas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICES_ROLE_KEY || ""

// Verificar si tenemos las credenciales necesarias
if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase URL o Service Role Key no disponibles. Algunas funcionalidades pueden no estar disponibles.")
}

// Crear el cliente solo si tenemos las credenciales
const supabaseAdmin =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null

// Tipo para los streamers
export interface Streamer {
  id: number
  streamer_name: string
  platform: "twitch" | "kick" | "facebook" | "youtube"
  channel_url: string
  is_live: boolean
  is_active: boolean
  thumbnail_url?: string | null
  description?: string | null
  created_at?: string
  updated_at?: string
}

// Tipo para los datos de entrada de streamers
export interface StreamerInput {
  streamer_name: string
  platform: "twitch" | "kick" | "facebook" | "youtube"
  channel_url: string
  is_live?: boolean
  is_active?: boolean
  thumbnail_url?: string | null
  description?: string | null
}

// Obtener todos los streamers
export async function getStreamers(): Promise<Streamer[]> {
  try {
    console.log("Obteniendo streamers desde Supabase...")
    const { data, error } = await supabaseAdmin
      ?.from("streamers")
      .select("*")
      .order("is_live", { ascending: false })
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error al obtener streamers:", error)
      throw new Error(`Error al obtener streamers: ${error.message}`)
    }

    console.log(`Obtenidos ${data?.length || 0} streamers`)
    return data || []
  } catch (error: any) {
    console.error("Error inesperado al obtener streamers:", error)
    throw new Error(`Error al obtener streamers: ${error.message}`)
  }
}

// Obtener streamers activos
export async function getActiveStreamers(): Promise<Streamer[]> {
  try {
    const { data, error } = await supabaseAdmin
      ?.from("streamers")
      .select("*")
      .eq("is_active", true)
      .order("is_live", { ascending: false })
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error al obtener streamers activos:", error)
      throw new Error(`Error al obtener streamers activos: ${error.message}`)
    }

    return data || []
  } catch (error: any) {
    console.error("Error inesperado al obtener streamers activos:", error)
    throw new Error(`Error al obtener streamers activos: ${error.message}`)
  }
}

// Obtener streamers en vivo
export async function getLiveStreamers(): Promise<Streamer[]> {
  try {
    const { data, error } = await supabaseAdmin
      ?.from("streamers")
      .select("*")
      .eq("is_active", true)
      .eq("is_live", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error al obtener streamers en vivo:", error)
      throw new Error(`Error al obtener streamers en vivo: ${error.message}`)
    }

    return data || []
  } catch (error: any) {
    console.error("Error inesperado al obtener streamers en vivo:", error)
    throw new Error(`Error al obtener streamers en vivo: ${error.message}`)
  }
}

// Añadir un nuevo streamer
export async function addStreamer(streamer: StreamerInput): Promise<Streamer> {
  try {
    console.log("Añadiendo streamer:", streamer)

    // Validar datos
    if (!streamer.streamer_name) {
      throw new Error("El nombre del streamer es obligatorio")
    }

    if (!streamer.platform) {
      throw new Error("La plataforma es obligatoria")
    }

    if (!streamer.channel_url) {
      throw new Error("La URL del canal es obligatoria")
    }

    // Preparar datos para inserción
    const streamerData = {
      streamer_name: streamer.streamer_name,
      platform: streamer.platform,
      channel_url: streamer.channel_url,
      is_live: streamer.is_live !== undefined ? streamer.is_live : false,
      is_active: streamer.is_active !== undefined ? streamer.is_active : true,
      thumbnail_url: streamer.thumbnail_url || null,
      description: streamer.description || null,
    }

    console.log("Datos a insertar:", streamerData)

    const { data, error } = await supabaseAdmin?.from("streamers").insert([streamerData]).select()

    if (error) {
      console.error("Error al añadir streamer:", error)
      throw new Error(`Error al añadir streamer: ${error.message}`)
    }

    if (!data || data.length === 0) {
      throw new Error("No se pudo añadir el streamer")
    }

    console.log("Streamer añadido correctamente:", data[0])
    return data[0] as Streamer
  } catch (error: any) {
    console.error("Error inesperado al añadir streamer:", error)
    throw new Error(`Error al añadir streamer: ${error.message}`)
  }
}

// Actualizar un streamer existente
export async function updateStreamer(id: number, updates: Partial<StreamerInput>): Promise<Streamer> {
  try {
    console.log(`Actualizando streamer con ID ${id}:`, updates)

    const { data, error } = await supabaseAdmin?.from("streamers").update(updates).eq("id", id).select()

    if (error) {
      console.error("Error al actualizar streamer:", error)
      throw new Error(`Error al actualizar streamer: ${error.message}`)
    }

    if (!data || data.length === 0) {
      throw new Error(`No se encontró el streamer con ID ${id}`)
    }

    console.log("Streamer actualizado correctamente:", data[0])
    return data[0] as Streamer
  } catch (error: any) {
    console.error("Error inesperado al actualizar streamer:", error)
    throw new Error(`Error al actualizar streamer: ${error.message}`)
  }
}

// Eliminar un streamer
export async function deleteStreamer(id: number): Promise<void> {
  try {
    console.log(`Eliminando streamer con ID ${id}`)

    const { error } = await supabaseAdmin?.from("streamers").delete().eq("id", id)

    if (error) {
      console.error("Error al eliminar streamer:", error)
      throw new Error(`Error al eliminar streamer: ${error.message}`)
    }

    console.log(`Streamer con ID ${id} eliminado correctamente`)
  } catch (error: any) {
    console.error("Error inesperado al eliminar streamer:", error)
    throw new Error(`Error al eliminar streamer: ${error.message}`)
  }
}

// Cambiar el estado activo/inactivo de un streamer
export async function toggleStreamerStatus(id: number, isActive: boolean): Promise<Streamer> {
  return updateStreamer(id, { is_active: isActive })
}

// Cambiar el estado en vivo de un streamer
export async function toggleLiveStatus(id: number, isLive: boolean): Promise<Streamer> {
  return updateStreamer(id, { is_live: isLive })
}

export { supabaseAdmin }
