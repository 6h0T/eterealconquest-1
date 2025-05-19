"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import {
  Trash2,
  Edit,
  Plus,
  X,
  Check,
  Loader2,
  Eye,
  EyeOff,
  Tv,
  Twitch,
  Youtube,
  Facebook,
  ExternalLink,
  Play,
} from "lucide-react"
import { useForm } from "react-hook-form"

// Tipos
interface Stream {
  id: number
  title: string
  platform: string
  url: string
  embed_url: string
  thumbnail_url?: string
  is_live: boolean
  is_active: boolean
  created_at: string
}

interface StreamFormData {
  title: string
  platform: string
  url: string
  embed_url?: string
  thumbnail_url?: string
  is_live: boolean
  is_active: boolean
}

export default function StreamsManagement() {
  const [streams, setStreams] = useState<Stream[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingStream, setEditingStream] = useState<Stream | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [previewStream, setPreviewStream] = useState<Stream | null>(null)

  // React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StreamFormData>({
    defaultValues: {
      title: "",
      platform: "twitch",
      url: "",
      embed_url: "",
      thumbnail_url: "",
      is_live: false,
      is_active: true,
    },
  })

  // Observar cambios en la URL y la plataforma para generar automáticamente la URL de embebido
  const watchUrl = watch("url")
  const watchPlatform = watch("platform")

  // Generar automáticamente la URL de embebido cuando cambia la URL o la plataforma
  useEffect(() => {
    if (watchUrl) {
      let embedUrl = ""
      const currentDomain = window.location.hostname

      if (watchPlatform === "twitch") {
        const twitchRegex = /(?:https?:\/\/)?(?:www\.)?twitch\.tv\/([a-zA-Z0-9_]+)/
        const match = watchUrl.match(twitchRegex)
        if (match && match[1]) {
          const username = match[1]
          embedUrl = `https://player.twitch.tv/?channel=${username}&parent=${currentDomain}`
        }
      } else if (watchPlatform === "youtube") {
        const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/
        const youtubeShortRegex = /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]+)/

        let match = watchUrl.match(youtubeRegex)
        if (!match) {
          match = watchUrl.match(youtubeShortRegex)
        }

        if (match && match[1]) {
          const videoId = match[1]
          embedUrl = `https://www.youtube.com/embed/${videoId}`
        }
      } else if (watchPlatform === "facebook") {
        const facebookRegex = /(?:https?:\/\/)?(?:www\.)?facebook\.com\/([^/]+)\/videos\/([0-9]+)/
        const match = watchUrl.match(facebookRegex)
        if (match && match[2]) {
          embedUrl = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(watchUrl)}&show_text=false&width=560&height=315`
        }
      } else if (watchPlatform === "kick") {
        const kickRegex = /(?:https?:\/\/)?(?:www\.)?kick\.com\/([a-zA-Z0-9_]+)/
        const match = watchUrl.match(kickRegex)
        if (match && match[1]) {
          const username = match[1]
          embedUrl = `https://kick.com/embed/${username}`
        }
      }

      setValue("embed_url", embedUrl)
    }
  }, [watchUrl, watchPlatform, setValue])

  // Cargar streams
  const fetchStreams = async () => {
    try {
      setIsLoading(true)
      setError(null)
      console.log("Obteniendo streams...")

      // Usar el cliente de Supabase con la clave anónima
      const supabase = createClientComponentClient()
      const { data, error } = await supabase
        .from("streams")
        .select("*")
        .order("is_live", { ascending: false })
        .order("title", { ascending: true })

      if (error) {
        console.error("Error al obtener streams:", error)
        throw new Error(`Error al obtener streams: ${error.message}`)
      }

      console.log("Streams obtenidos:", data)
      setStreams(data || [])
    } catch (err: any) {
      console.error("Error al cargar streams:", err)
      setError(err.message || "Error al obtener streams")
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar streams al montar el componente y configurar suscripción en tiempo real
  useEffect(() => {
    fetchStreams()

    // Configurar suscripción en tiempo real
    const supabase = createClientComponentClient()

    const streamsSubscription = supabase
      .channel("streams-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "streams",
        },
        () => {
          // Cuando hay cambios, actualizar los datos
          fetchStreams()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(streamsSubscription)
    }
  }, [])

  // Abrir formulario para editar
  const handleEdit = (stream: Stream) => {
    setEditingStream(stream)
    setValue("title", stream.title)
    setValue("platform", stream.platform)
    setValue("url", stream.url)
    setValue("embed_url", stream.embed_url)
    setValue("thumbnail_url", stream.thumbnail_url || "")
    setValue("is_live", stream.is_live)
    setValue("is_active", stream.is_active)
    setIsFormOpen(true)
  }

  // Abrir formulario para añadir
  const handleAdd = () => {
    setEditingStream(null)
    reset({
      title: "",
      platform: "twitch",
      url: "",
      embed_url: "",
      thumbnail_url: "",
      is_live: false,
      is_active: true,
    })
    setIsFormOpen(true)
  }

  // Cerrar formulario
  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingStream(null)
    reset()
  }

  // Abrir vista previa
  const handlePreview = (stream: Stream) => {
    setPreviewStream(stream)
  }

  // Cerrar vista previa
  const handleClosePreview = () => {
    setPreviewStream(null)
  }

  // Enviar formulario
  const onSubmit = async (data: StreamFormData) => {
    try {
      setIsSubmitting(true)
      setError(null)
      console.log("Enviando datos:", data)

      // Usar el cliente de Supabase con la clave anónima
      const supabase = createClientComponentClient()

      if (editingStream) {
        // Actualizar stream existente
        const { error } = await supabase
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
          .eq("id", editingStream.id)

        if (error) {
          console.error("Error al actualizar stream:", error)
          throw new Error(`Error al actualizar stream: ${error.message}`)
        }
      } else {
        // Añadir nuevo stream
        const { error } = await supabase.from("streams").insert([
          {
            title: data.title,
            platform: data.platform,
            url: data.url,
            embed_url: data.embed_url,
            thumbnail_url: data.thumbnail_url || null,
            is_live: data.is_live,
            is_active: data.is_active,
          },
        ])

        if (error) {
          console.error("Error al añadir stream:", error)
          throw new Error(`Error al añadir stream: ${error.message}`)
        }
      }

      // Mostrar mensaje de éxito
      setSuccessMessage(editingStream ? "Stream actualizado correctamente" : "Stream añadido correctamente")

      // Ocultar mensaje después de 3 segundos
      setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)

      // Cerrar formulario y recargar streams
      handleCloseForm()
      fetchStreams()
    } catch (err: any) {
      console.error("Error al guardar stream:", err)
      setError(err.message || `Error al ${editingStream ? "actualizar" : "añadir"} stream`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Eliminar stream
  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este stream?")) {
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      console.log(`Eliminando stream con ID ${id}...`)

      const supabase = createClientComponentClient()
      const { error } = await supabase.from("streams").delete().eq("id", id)

      if (error) {
        console.error("Error al eliminar stream:", error)
        throw new Error(`Error al eliminar stream: ${error.message}`)
      }

      // Mostrar mensaje de éxito
      setSuccessMessage("Stream eliminado correctamente")

      // Ocultar mensaje después de 3 segundos
      setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)

      // Recargar streams
      fetchStreams()
    } catch (err: any) {
      console.error("Error al eliminar stream:", err)
      setError(err.message || "Error al eliminar stream")
    } finally {
      setIsLoading(false)
    }
  }

  // Cambiar estado en vivo
  const handleToggleLive = async (id: number, isLive: boolean) => {
    try {
      setError(null)
      console.log(`Cambiando estado en vivo del stream con ID ${id} a ${!isLive}...`)

      const supabase = createClientComponentClient()
      const { error } = await supabase.from("streams").update({ is_live: !isLive }).eq("id", id)

      if (error) {
        console.error("Error al cambiar estado en vivo del stream:", error)
        throw new Error(`Error al cambiar estado en vivo del stream: ${error.message}`)
      }

      // Recargar streams
      fetchStreams()
    } catch (err: any) {
      console.error("Error al cambiar estado en vivo del stream:", err)
      setError(err.message || "Error al cambiar estado en vivo del stream")
    }
  }

  // Cambiar estado activo
  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      setError(null)
      console.log(`Cambiando estado activo del stream con ID ${id} a ${!isActive}...`)

      const supabase = createClientComponentClient()
      const { error } = await supabase.from("streams").update({ is_active: !isActive }).eq("id", id)

      if (error) {
        console.error("Error al cambiar estado activo del stream:", error)
        throw new Error(`Error al cambiar estado activo del stream: ${error.message}`)
      }

      // Recargar streams
      fetchStreams()
    } catch (err: any) {
      console.error("Error al cambiar estado activo del stream:", err)
      setError(err.message || "Error al cambiar estado activo del stream")
    }
  }

  // Función para obtener el icono según la plataforma
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "twitch":
        return <Twitch className="h-4 w-4 text-purple-500" />
      case "youtube":
        return <Youtube className="h-4 w-4 text-red-500" />
      case "facebook":
        return <Facebook className="h-4 w-4 text-blue-500" />
      case "kick":
        return <Tv className="h-4 w-4 text-green-500" />
      default:
        return <Tv className="h-4 w-4" />
    }
  }

  // Función para obtener la clase de color según la plataforma
  const getPlatformClass = (platform: string) => {
    switch (platform) {
      case "twitch":
        return "bg-purple-900 text-purple-100"
      case "youtube":
        return "bg-red-900 text-red-100"
      case "facebook":
        return "bg-blue-900 text-blue-100"
      case "kick":
        return "bg-green-900 text-green-100"
      default:
        return "bg-gray-700 text-gray-300"
    }
  }

  return (
    <div className="bg-bunker-800 rounded-lg shadow-lg p-6">
      {/* Mensajes de éxito y error */}
      {successMessage && <div className="mb-4 p-3 bg-green-900 text-green-100 rounded-md">{successMessage}</div>}

      {error && <div className="mb-4 p-3 bg-red-900 text-red-100 rounded-md">{error}</div>}

      {/* Botón para añadir stream */}
      <div className="mb-6">
        <button
          onClick={handleAdd}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          disabled={isLoading}
        >
          <Plus className="h-4 w-4 mr-2" />
          Añadir Stream
        </button>
      </div>

      {/* Formulario */}
      {isFormOpen && (
        <div className="mb-6 p-4 bg-bunker-700 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">{editingStream ? "Editar Stream" : "Añadir Stream"}</h3>
            <button onClick={handleCloseForm} className="text-gray-400 hover:text-white" aria-label="Cerrar">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Título */}
              <div>
                <label className="block text-sm font-medium mb-1">Título *</label>
                <input
                  type="text"
                  {...register("title", { required: "Este campo es obligatorio" })}
                  className="w-full px-3 py-2 bg-bunker-800 border border-bunker-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {errors.title && <p className="mt-1 text-sm text-red-400">{errors.title.message}</p>}
              </div>

              {/* Plataforma */}
              <div>
                <label className="block text-sm font-medium mb-1">Plataforma *</label>
                <select
                  {...register("platform", { required: "Este campo es obligatorio" })}
                  className="w-full px-3 py-2 bg-bunker-800 border border-bunker-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="twitch">Twitch</option>
                  <option value="youtube">YouTube</option>
                  <option value="facebook">Facebook</option>
                  <option value="kick">Kick</option>
                </select>
                {errors.platform && <p className="mt-1 text-sm text-red-400">{errors.platform.message}</p>}
              </div>

              {/* URL del canal */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">URL del canal/video *</label>
                <input
                  type="url"
                  {...register("url", {
                    required: "Este campo es obligatorio",
                    pattern: {
                      value: /^https?:\/\/.+/i,
                      message: "Debe ser una URL válida",
                    },
                  })}
                  className="w-full px-3 py-2 bg-bunker-800 border border-bunker-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="https://"
                />
                {errors.url && <p className="mt-1 text-sm text-red-400">{errors.url.message}</p>}
              </div>

              {/* URL de embebido */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">URL de embebido *</label>
                <input
                  type="url"
                  {...register("embed_url", {
                    required: "Este campo es obligatorio",
                    pattern: {
                      value: /^https?:\/\/.+/i,
                      message: "Debe ser una URL válida",
                    },
                  })}
                  className="w-full px-3 py-2 bg-bunker-800 border border-bunker-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="https://"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Esta URL se genera automáticamente, pero puedes modificarla si es necesario.
                </p>
                {errors.embed_url && <p className="mt-1 text-sm text-red-400">{errors.embed_url.message}</p>}
              </div>

              {/* URL de la miniatura */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">URL de la miniatura (opcional)</label>
                <input
                  type="url"
                  {...register("thumbnail_url", {
                    pattern: {
                      value: /^https?:\/\/.+/i,
                      message: "Debe ser una URL válida",
                    },
                  })}
                  className="w-full px-3 py-2 bg-bunker-800 border border-bunker-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="https://"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Si no se proporciona, se intentará obtener automáticamente de la plataforma.
                </p>
                {errors.thumbnail_url && <p className="mt-1 text-sm text-red-400">{errors.thumbnail_url.message}</p>}
              </div>

              {/* Estado en vivo */}
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    {...register("is_live")}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">En vivo</span>
                </label>
              </div>

              {/* Estado activo */}
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    {...register("is_active")}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">Activo</span>
                </label>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCloseForm}
                className="px-4 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 transition-colors"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Guardar
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Vista previa */}
      {previewStream && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-bunker-800 rounded-lg shadow-lg w-full max-w-4xl">
            <div className="flex justify-between items-center p-4 border-b border-bunker-700">
              <h3 className="text-lg font-medium">{previewStream.title}</h3>
              <button onClick={handleClosePreview} className="text-gray-400 hover:text-white" aria-label="Cerrar">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="aspect-video w-full bg-black">
                <iframe
                  src={previewStream.embed_url}
                  className="w-full h-full"
                  allowFullScreen
                  allow="autoplay; encrypted-media; picture-in-picture"
                ></iframe>
              </div>
              <div className="mt-4 flex justify-end">
                <a
                  href={previewStream.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-4 py-2 bg-bunker-700 text-white rounded-md hover:bg-bunker-600 transition-colors"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir en {previewStream.platform}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de streams */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-bunker-700">
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Título</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Plataforma</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Estado</th>
              <th className="px-4 py-2 text-right text-sm font-medium text-gray-300">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-bunker-700">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-4 py-4 text-center text-gray-400">
                  <Loader2 className="h-5 w-5 mx-auto animate-spin" />
                </td>
              </tr>
            ) : streams.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-4 text-center text-gray-400">
                  No hay streams registrados
                </td>
              </tr>
            ) : (
              streams.map((stream) => (
                <tr key={stream.id} className="hover:bg-bunker-700">
                  <td className="px-4 py-3 text-sm">
                    <div className="font-medium text-white">{stream.title}</div>
                    <div className="text-xs text-gray-400 mt-1 truncate">{stream.url}</div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPlatformClass(
                          stream.platform,
                        )}`}
                      >
                        {getPlatformIcon(stream.platform)}
                        <span className="ml-1 capitalize">{stream.platform}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          stream.is_live ? "bg-red-900 text-red-100" : "bg-gray-700 text-gray-300"
                        }`}
                      >
                        {stream.is_live ? (
                          <>
                            <span className="w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse"></span>
                            En vivo
                          </>
                        ) : (
                          "Offline"
                        )}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          stream.is_active ? "bg-green-900 text-green-100" : "bg-gray-700 text-gray-300"
                        }`}
                      >
                        {stream.is_active ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleToggleLive(stream.id, stream.is_live)}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                        aria-label={stream.is_live ? "Marcar como offline" : "Marcar como en vivo"}
                        title={stream.is_live ? "Marcar como offline" : "Marcar como en vivo"}
                      >
                        {stream.is_live ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                      <button
                        onClick={() => handleToggleActive(stream.id, stream.is_active)}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                        aria-label={stream.is_active ? "Desactivar" : "Activar"}
                        title={stream.is_active ? "Desactivar" : "Activar"}
                      >
                        {stream.is_active ? (
                          <X className="h-5 w-5 text-red-400" />
                        ) : (
                          <Check className="h-5 w-5 text-green-400" />
                        )}
                      </button>
                      <button
                        onClick={() => handlePreview(stream)}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                        aria-label="Vista previa"
                        title="Vista previa"
                      >
                        <Play className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(stream)}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                        aria-label="Editar"
                        title="Editar"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(stream.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        aria-label="Eliminar"
                        title="Eliminar"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
