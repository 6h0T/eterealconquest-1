import { createClient } from "@supabase/supabase-js"

// Obtener las variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Verificar que las variables de entorno estén definidas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("⚠️ Variables de entorno de Supabase no configuradas correctamente")
  console.error("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "Configurado" : "No configurado")
  console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseAnonKey ? "Configurado" : "No configurado")
}

// Crear el cliente de Supabase con opciones adicionales
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Para evitar problemas en el servidor
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
})

// Función para verificar la conexión a Supabase
export async function checkSupabaseConnection() {
  try {
    // Intentar una operación simple para verificar la conexión
    const { data, error } = await supabase.storage.listBuckets()

    if (error) {
      console.error("Error al conectar con Supabase Storage:", error)
      return {
        success: false,
        error: error.message,
        details: "Verifica tus credenciales de Supabase y asegúrate de que el servicio esté disponible.",
      }
    }

    return { success: true, buckets: data }
  } catch (err) {
    console.error("Excepción al verificar conexión con Supabase:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error desconocido",
      details: "Ocurrió un error inesperado al conectar con Supabase.",
    }
  }
}

// Función para verificar y crear el bucket de imágenes
export async function ensureImageBucket() {
  try {
    // Verificar si el bucket existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      return {
        success: false,
        error: listError.message,
        details: "No se pudo verificar los buckets existentes.",
      }
    }

    // Buscar el bucket 'images'
    const imagesBucket = buckets?.find((bucket) => bucket.name === "images")

    if (!imagesBucket) {
      // El bucket no existe, intentar crearlo
      const { data: createData, error: createError } = await supabase.storage.createBucket("images", {
        public: true,
        fileSizeLimit: 5242880, // 5MB
      })

      if (createError) {
        return {
          success: false,
          error: createError.message,
          details: "No se pudo crear el bucket 'images'. Verifica tus permisos en Supabase.",
        }
      }

      // Configurar políticas de acceso público
      // Nota: Esto requiere permisos de administrador
      try {
        // Esta operación puede fallar si no tienes permisos suficientes
        // En ese caso, deberás configurar las políticas manualmente
        await supabase.rpc("create_public_bucket_policy", { bucket_name: "images" })
      } catch (policyError) {
        console.warn("No se pudieron configurar automáticamente las políticas de acceso:", policyError)
        // No fallamos aquí, ya que el usuario puede configurar las políticas manualmente
      }

      return {
        success: true,
        message: "Bucket 'images' creado exitosamente.",
        isNew: true,
      }
    }

    return {
      success: true,
      message: "El bucket 'images' ya existe.",
      isNew: false,
    }
  } catch (err) {
    console.error("Error al verificar/crear el bucket 'images':", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error desconocido",
      details: "Ocurrió un error inesperado al verificar/crear el bucket 'images'.",
    }
  }
}
