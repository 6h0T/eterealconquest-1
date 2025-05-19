"use client"

import { useState, useEffect } from "react"
import { Trash2, Edit, Plus, X, Check, Loader2, Eye, EyeOff, Tv, Twitch, Youtube, Facebook } from "lucide-react"
import { useForm } from "react-hook-form"

// Tipos
interface Streamer {
  id: number
  streamer_name: string
  platform: string
  channel_url: string
  is_live: boolean
  is_active: boolean
  thumbnail_url?: string
  description?: string
  created_at: string
  updated_at: string
  embed_url: string
}

interface StreamerFormData {
  streamer_name: string
  platform: string
  channel_url: string
  is_live: boolean
  is_active: boolean
  thumbnail_url?: string
  description?: string
  embed_url: string
}

export default function StreamersManager() {
  const [streamers, setStreamers] = useState<Streamer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingStreamer, setEditingStreamer] = useState<Streamer | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  // React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StreamerFormData>({
    defaultValues: {
      streamer_name: "",
      platform: "twitch",
      channel_url: "",
      is_live: false,
      is_active: true,
      thumbnail_url: "",
      description: "",
      embed_url: "",
    },
  })

  // Observar cambios en la URL y la plataforma para generar automáticamente la URL de embebido
  const watchChannelUrl = watch("channel_url")
  const watchPlatform = watch("platform")

  // Generar automáticamente la URL de embebido cuando cambia la URL o la plataforma
  useEffect(() => {
    if (watchChannelUrl) {
      let embedUrl = ""
      const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'localhost'

      if (watchPlatform === "twitch") {
        const twitchRegex = /(?:https?:\/\/)?(?:www\.)?twitch\.tv\/([a-zA-Z0-9_]+)/
        const match = watchChannelUrl.match(twitchRegex)
        if (match && match[1]) {
          const username = match[1]
          embedUrl = `https://player.twitch.tv/?channel=${username}&parent=${currentDomain}`
        }
      } else if (watchPlatform === "youtube") {
        const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/
        const youtubeShortRegex = /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]+)/

        let match = watchChannelUrl.match(youtubeRegex)
        if (!match) {
          match = watchChannelUrl.match(youtubeShortRegex)
        }

        if (match && match[1]) {
          const videoId = match[1]
          embedUrl = `https://www.youtube.com/embed/${videoId}`
        }
      } else if (watchPlatform === "facebook") {
        embedUrl = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(watchChannelUrl)}&show_text=false&width=560&height=315`
      } else if (watchPlatform === "kick") {
        const kickRegex = /(?:https?:\/\/)?(?:www\.)?kick\.com\/([a-zA-Z0-9_]+)/
        const match = watchChannelUrl.match(kickRegex)
        if (match && match[1]) {
          const username = match[1]
          embedUrl = `https://player.kick.com/${username}`
        }
      }

      setValue("embed_url", embedUrl)
    }
  }, [watchChannelUrl, watchPlatform, setValue])

  // Cargar streamers
  const fetchStreamers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      console.log("Obteniendo streamers...")

      const response = await fetch("/api/admin/streamers", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      })

      console.log("Respuesta recibida:", response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error en la respuesta:", errorText)

        try {
          const jsonError = JSON.parse(errorText)
          throw new Error(jsonError.error || "Error al obtener streamers")
        } catch (e) {
          throw new Error(`Error al obtener streamers: ${response.status} ${response.statusText}`)
        }
      }

      const data = await response.json()
      console.log("Datos recibidos:", data)

      setStreamers(data.streamers || [])
    } catch (err: any) {
      console.error("Error al cargar streamers:", err)
      setError(err.message || "Error al obtener streamers")
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar streamers al montar el componente
  useEffect(() => {
    fetchStreamers()
  }, [])

  // Abrir formulario para editar
  const handleEdit = (streamer: Streamer) => {
    setEditingStreamer(streamer)
    setValue("streamer_name", streamer.streamer_name)
    setValue("platform", streamer.platform)
    setValue("channel_url", streamer.channel_url)
    setValue("is_live", streamer.is_live)
    setValue("is_active", streamer.is_active)
    setValue("thumbnail_url", streamer.thumbnail_url || "")
    setValue("description", streamer.description || "")
    setValue("embed_url", streamer.embed_url || "")
    setIsFormOpen(true)
  }

  // Abrir formulario para añadir
  const handleAdd = () => {
    setEditingStreamer(null)
    reset()
    setIsFormOpen(true)
  }

  // Cerrar formulario
  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingStreamer(null)
    reset()
  }

  // Enviar formulario
  const onSubmit = async (data: StreamerFormData) => {
    try {
      setIsSubmitting(true)
      setError(null)
      console.log("Enviando datos:", data)

      const url = "/api/admin/streamers"
      const method = editingStreamer ? "PUT" : "POST"
      const body = editingStreamer ? JSON.stringify({ id: editingStreamer.id, ...data }) : JSON.stringify(data)

      console.log(`Enviando solicitud ${method} a ${url}:`, body)

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body,
      })

      console.log("Respuesta recibida:", response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error en la respuesta:", errorText)

        try {
          const jsonError = JSON.parse(errorText)
          throw new Error(jsonError.error || `Error al ${editingStreamer ? "actualizar" : "añadir"} streamer`)
        } catch (e) {
          throw new Error(
            `Error al ${editingStreamer ? "actualizar" : "añadir"} streamer: ${response.status} ${response.statusText}`,
          )
        }
      }

      const responseData = await response.json()
      console.log("Datos recibidos:", responseData)

      // Mostrar mensaje de éxito
      setSuccessMessage(editingStreamer ? "Streamer actualizado correctamente" : "Streamer añadido correctamente")

      // Ocultar mensaje después de 3 segundos
      setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)

      // Cerrar formulario y recargar streamers
      handleCloseForm()
      fetchStreamers()
    } catch (err: any) {
      console.error("Error al guardar streamer:", err)
      setError(err.message || `Error al ${editingStreamer ? "actualizar" : "añadir"} streamer`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Eliminar streamer
  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este streamer?")) {
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      console.log(`Eliminando streamer con ID ${id}...`)

      const response = await fetch(`/api/admin/streamers?id=${id}`, {
        method: "DELETE",
      })

      console.log("Respuesta recibida:", response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error en la respuesta:", errorText)

        try {
          const jsonError = JSON.parse(errorText)
          throw new Error(jsonError.error || "Error al eliminar streamer")
        } catch (e) {
          throw new Error(`Error al eliminar streamer: ${response.status} ${response.statusText}`)
        }
      }

      // Mostrar mensaje de éxito
      setSuccessMessage("Streamer eliminado correctamente")

      // Ocultar mensaje después de 3 segundos
      setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)

      // Recargar streamers
      fetchStreamers()
    } catch (err: any) {
      console.error("Error al eliminar streamer:", err)
      setError(err.message || "Error al eliminar streamer")
    } finally {
      setIsLoading(false)
    }
  }

  // Cambiar estado activo/inactivo
  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      setError(null)
      console.log(`Cambiando estado activo del streamer con ID ${id} a ${!isActive}...`)

      const response = await fetch("/api/admin/streamers", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, is_active: !isActive }),
      })

      console.log("Respuesta recibida:", response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error en la respuesta:", errorText)

        try {
          const jsonError = JSON.parse(errorText)
          throw new Error(jsonError.error || "Error al cambiar estado del streamer")
        } catch (e) {
          throw new Error(`Error al cambiar estado del streamer: ${response.status} ${response.statusText}`)
        }
      }

      // Recargar streamers
      fetchStreamers()
    } catch (err: any) {
      console.error("Error al cambiar estado del streamer:", err)
      setError(err.message || "Error al cambiar estado del streamer")
    }
  }

  // Cambiar estado en vivo
  const handleToggleLive = async (id: number, isLive: boolean) => {
    try {
      setError(null)
      console.log(`Cambiando estado en vivo del streamer con ID ${id} a ${!isLive}...`)

      const response = await fetch("/api/admin/streamers", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, is_live: !isLive }),
      })

      console.log("Respuesta recibida:", response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error en la respuesta:", errorText)

        try {
          const jsonError = JSON.parse(errorText)
          throw new Error(jsonError.error || "Error al cambiar estado en vivo del streamer")
        } catch (e) {
          throw new Error(`Error al cambiar estado en vivo del streamer: ${response.status} ${response.statusText}`)
        }
      }

      // Recargar streamers
      fetchStreamers()
    } catch (err: any) {
      console.error("Error al cambiar estado en vivo del streamer:", err)
      setError(err.message || "Error al cambiar estado en vivo del streamer")
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

  // Función para mostrar/ocultar vista previa
  const togglePreview = () => {
    setShowPreview(!showPreview)
  }

  return (
    <div className="bg-bunker-800 rounded-lg shadow-lg p-6">
      {/* Mensajes de éxito y error */}
      {successMessage && <div className="mb-4 p-3 bg-green-900 text-green-100 rounded-md">{successMessage}</div>}

      {error && <div className="mb-4 p-3 bg-red-900 text-red-100 rounded-md">{error}</div>}

      {/* Botón para añadir streamer */}
      <div className="mb-6">
        <button
          onClick={handleAdd}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          disabled={isLoading}
        >
          <Plus className="h-4 w-4 mr-2" />
          Añadir Streamer
        </button>
      </div>

      {/* Formulario */}
      {isFormOpen && (
        <div className="mb-6 p-4 bg-bunker-700 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">{editingStreamer ? "Editar Streamer" : "Añadir Streamer"}</h3>
            <button onClick={handleCloseForm} className="text-gray-400 hover:text-white" aria-label="Cerrar">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Nombre del streamer */}
              <div>
                <label className="block text-sm font-medium mb-1">Nombre del streamer *</label>
                <input
                  type="text"
                  {...register("streamer_name", { required: "Este campo es obligatorio" })}
                  className="w-full px-3 py-2 bg-bunker-800 border border-bunker-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {errors.streamer_name && <p className="mt-1 text-sm text-red-400">{errors.streamer_name.message}</p>}
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
                <label className="block text-sm font-medium mb-1">URL del canal *</label>
                <input
                  type="url"
                  {...register("channel_url", {
                    required: "Este campo es obligatorio",
                    pattern: {
                      value: /^https?:\/\/.+/i,
                      message: "Debe ser una URL válida",
                    },
                  })}
                  className="w-full px-3 py-2 bg-bunker-800 border border-bunker-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="https://"
                />
                {errors.channel_url && <p className="mt-1 text-sm text-red-400">{errors.channel_url.message}</p>}
              </div>

              {/* Campo oculto para embed_url */}
              <input type="hidden" {...register("embed_url")} />

              {/* Botón de vista previa */}
              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={togglePreview}
                  className="px-4 py-2 bg-bunker-700 text-white rounded-md hover:bg-bunker-600 transition-colors"
                >
                  {showPreview ? "Ocultar vista previa" : "Ver vista previa"}
                </button>
              </div>

              {/* Vista previa del stream */}
              {showPreview && watch("embed_url") && (
                <div className="md:col-span-2 mt-2 border border-bunker-600 rounded-md overflow-hidden">
                  <div className="aspect-video w-full bg-black">
                    <iframe
                      src={watch("embed_url")}
                      className="w-full h-full"
                      allowFullScreen
                      allow="autoplay; encrypted-media; picture-in-picture"
                      referrerPolicy="origin"
                    ></iframe>
                  </div>
                </div>
              )}

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
                {errors.thumbnail_url && <p className="mt-1 text-sm text-red-400">{errors.thumbnail_url.message}</p>}
              </div>

              {/* Descripción */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Descripción (opcional)</label>
                <textarea
                  {...register("description")}
                  className="w-full px-3 py-2 bg-bunker-800 border border-bunker-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              {/* Estados */}
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

      {/* Tabla de streamers */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-bunker-700">
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Nombre</th>
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
            ) : streamers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-4 text-center text-gray-400">
                  No hay streamers registrados
                </td>
              </tr>
            ) : (
              streamers.map((streamer) => (
                <tr key={streamer.id} className="hover:bg-bunker-700">
                  <td className="px-4 py-3 text-sm">
                    <div className="font-medium text-white">{streamer.streamer_name}</div>
                    {streamer.description && (
                      <div className="text-xs text-gray-400 mt-1 line-clamp-1">{streamer.description}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center">
                      {getPlatformIcon(streamer.platform)}
                      <span className="ml-2 capitalize">{streamer.platform}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex flex-col space-y-1">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          streamer.is_active ? "bg-green-900 text-green-100" : "bg-gray-700 text-gray-300"
                        }`}
                      >
                        {streamer.is_active ? "Activo" : "Inactivo"}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          streamer.is_live ? "bg-red-900 text-red-100" : "bg-gray-700 text-gray-300"
                        }`}
                      >
                        {streamer.is_live ? "En vivo" : "Offline"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleToggleActive(streamer.id, streamer.is_active)}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                        aria-label={streamer.is_active ? "Desactivar" : "Activar"}
                        title={streamer.is_active ? "Desactivar" : "Activar"}
                      >
                        {streamer.is_active ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                      <button
                        onClick={() => handleToggleLive(streamer.id, streamer.is_live)}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                        aria-label={streamer.is_live ? "Marcar como offline" : "Marcar como en vivo"}
                        title={streamer.is_live ? "Marcar como offline" : "Marcar como en vivo"}
                      >
                        <Tv className={`h-5 w-5 ${streamer.is_live ? "text-red-500" : ""}`} />
                      </button>
                      <button
                        onClick={() => handleEdit(streamer)}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                        aria-label="Editar"
                        title="Editar"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(streamer.id)}
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
