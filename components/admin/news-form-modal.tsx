"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { X, Upload, Loader2, AlertCircle, RefreshCw, ImageIcon } from "lucide-react"
import type { News } from "@/contexts/news-context"

interface NewsFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (newsData: Partial<News>) => void
  news?: News
}

export function NewsFormModal({ isOpen, onClose, onSave, news }: NewsFormModalProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [language, setLanguage] = useState("es")
  const [status, setStatus] = useState("active")
  const [featured, setFeatured] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [imagePreviewError, setImagePreviewError] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Cargar datos si estamos editando
  useEffect(() => {
    if (news) {
      setTitle(news.title || "")
      setContent(news.content || "")
      setImageUrl(news.image_url)
      setLanguage(news.language || "es")
      setStatus(news.status || "active")
      setFeatured(news.featured || false)
    } else {
      // Limpiar el formulario si es una nueva noticia
      setTitle("")
      setContent("")
      setImageUrl(null)
      setLanguage("es")
      setStatus("active")
      setFeatured(false)
      setErrors({})
      setImagePreviewError(false)
    }
  }, [news, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validación
    const newErrors: Record<string, string> = {}
    if (!title.trim()) newErrors.title = "El título es obligatorio"
    if (!content.trim()) newErrors.content = "El contenido es obligatorio"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSave({
      title,
      content,
      image_url: imageUrl,
      language,
      status,
      featured,
    })
  }

  // Subir imagen a Vercel Blob
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadError(null)
    setUploadProgress(0)
    setImagePreviewError(false)

    try {
      // Validar tipo de archivo
      if (!file.type.startsWith("image/")) {
        throw new Error("El archivo debe ser una imagen")
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("La imagen no debe superar los 5MB")
      }

      // Crear FormData para enviar el archivo
      const formData = new FormData()
      formData.append("file", file)

      // Simular progreso de carga
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + 10
          return newProgress > 90 ? 90 : newProgress
        })
      }, 300)

      // Enviar a nuestro endpoint
      const response = await fetch("/api/upload-news-image", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al subir la imagen")
      }

      const data = await response.json()

      if (data.success && data.url) {
        // Usar directamente la URL proporcionada por el servidor
        setImageUrl(data.url)
      } else {
        throw new Error("No se recibió una URL válida del servidor")
      }
    } catch (error) {
      console.error("Error al subir imagen:", error)
      setUploadError(error instanceof Error ? error.message : "Error al subir la imagen")
    } finally {
      setIsUploading(false)
      // Limpiar el input de archivo para permitir subir el mismo archivo nuevamente
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleImageError = () => {
    console.error("Error al cargar la imagen:", imageUrl)
    setImagePreviewError(true)
  }

  const retryLoadImage = () => {
    setImagePreviewError(false)
    // Forzar recarga de la imagen
    if (imageUrl) {
      const timestamp = new Date().getTime()
      const urlWithCache = imageUrl.includes("?") ? `${imageUrl}&cache=${timestamp}` : `${imageUrl}?cache=${timestamp}`

      // Solo para la vista previa, no afecta el valor guardado
      const img = new Image()
      img.src = urlWithCache
      img.onload = () => {
        // Actualizar la vista previa con la imagen cargada correctamente
        setImagePreviewError(false)
      }
      img.onerror = () => {
        setImagePreviewError(true)
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-bunker-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center border-b border-bunker-700 px-6 py-4">
          <h2
            className="text-xl font-semibold text-gray-100"
            style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
          >
            {news ? "Editar noticia" : "Crear nueva noticia"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6" style={{ maxHeight: "calc(90vh - 70px)" }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Columna izquierda */}
            <div className="md:col-span-2 space-y-6">
              {/* Título */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-300 mb-1"
                  style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
                >
                  Título
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full px-3 py-2 bg-bunker-800 border ${
                    errors.title ? "border-red-500" : "border-bunker-700"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 text-gray-100`}
                  style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
                />
                {errors.title && (
                  <p
                    className="mt-1 text-sm text-red-400"
                    style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
                  >
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Contenido */}
              <div>
                <label
                  htmlFor="content"
                  className="block text-sm font-medium text-gray-300 mb-1"
                  style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
                >
                  Contenido
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={12}
                  className={`w-full px-3 py-2 bg-bunker-800 border ${
                    errors.content ? "border-red-500" : "border-bunker-700"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 text-gray-100`}
                  style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
                />
                {errors.content && (
                  <p
                    className="mt-1 text-sm text-red-400"
                    style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
                  >
                    {errors.content}
                  </p>
                )}
              </div>
            </div>

            {/* Columna derecha */}
            <div className="space-y-6">
              {/* Imagen */}
              <div>
                <label
                  className="block text-sm font-medium text-gray-300 mb-1"
                  style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
                >
                  Imagen destacada
                </label>
                <div className="border border-bunker-700 rounded-md overflow-hidden">
                  <div className="relative h-48 bg-bunker-800">
                    {imageUrl && !imagePreviewError ? (
                      // Usar img nativo en lugar de Image de Next.js
                      <img
                        src={imageUrl || "/placeholder.svg"}
                        alt="Vista previa"
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={handleImageError}
                      />
                    ) : imagePreviewError ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 bg-bunker-800">
                        <AlertCircle className="h-8 w-8 mb-2 text-amber-500" />
                        <p className="text-sm text-center px-4">Error al cargar la imagen</p>
                        <button
                          type="button"
                          onClick={retryLoadImage}
                          className="mt-2 flex items-center text-xs text-blue-400 hover:text-blue-300"
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Reintentar
                        </button>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                        <ImageIcon className="h-12 w-12 text-gray-700" />
                        <span className="sr-only">Sin imagen</span>
                      </div>
                    )}

                    {isUploading && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-gold-500 mb-2" />
                        <div className="w-3/4 bg-bunker-700 rounded-full h-2">
                          <div
                            className="bg-gold-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-300 mt-1">{uploadProgress}%</p>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <label
                      className="flex items-center justify-center w-full px-4 py-2 text-sm text-white bg-gold-600 rounded-md hover:bg-gold-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Subiendo...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Subir imagen
                        </>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
                    </label>

                    {uploadError && (
                      <div className="mt-3 p-3 bg-red-900/30 border border-red-800 rounded-md">
                        <div
                          className="flex items-start text-xs text-red-400"
                          style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
                        >
                          <AlertCircle className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                          <span>{uploadError}</span>
                        </div>
                      </div>
                    )}

                    {imageUrl && !imagePreviewError && (
                      <div className="mt-2 text-xs text-gray-500 break-all">
                        <p className="font-mono">URL: {imageUrl.substring(0, 50)}...</p>
                      </div>
                    )}

                    <p
                      className="mt-2 text-xs text-gray-500"
                      style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
                    >
                      Formatos: JPG, PNG, GIF, WEBP. Máx: 5MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Idioma */}
              <div>
                <label
                  htmlFor="language"
                  className="block text-sm font-medium text-gray-300 mb-1"
                  style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
                >
                  Idioma
                </label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 bg-bunker-800 border border-bunker-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 text-gray-100"
                  style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
                >
                  <option value="es">Español</option>
                  <option value="en">Inglés</option>
                  <option value="pt">Portugués</option>
                </select>
              </div>

              {/* Estado */}
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-300 mb-1"
                  style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
                >
                  Estado
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-bunker-800 border border-bunker-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 text-gray-100"
                  style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
                >
                  <option value="active">Publicada</option>
                  <option value="draft">Borrador</option>
                </select>
              </div>

              {/* Destacada */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="h-4 w-4 text-gold-500 focus:ring-gold-500 border-bunker-700 rounded bg-bunker-800"
                />
                <label
                  htmlFor="featured"
                  className="ml-2 block text-sm text-gray-300"
                  style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
                >
                  Destacar noticia
                </label>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-bunker-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-300 border border-bunker-700 rounded-md hover:bg-bunker-800"
              style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm text-white bg-gold-600 rounded-md hover:bg-gold-500 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
              disabled={isUploading}
            >
              {news ? "Guardar cambios" : "Crear noticia"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
