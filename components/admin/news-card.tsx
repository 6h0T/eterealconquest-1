"use client"

import { useState } from "react"
import { Edit, Trash2, Eye } from "lucide-react"
import Link from "next/link"
import type { News } from "@/contexts/news-context"

interface NewsCardProps {
  news: News
  onEdit: () => void
  onDelete: () => void
}

export function NewsCard({ news, onEdit, onDelete }: NewsCardProps) {
  const [imageError, setImageError] = useState(false)

  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date)
  }

  // Función para truncar el texto
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  // Eliminar etiquetas HTML del contenido
  const stripHtml = (html: string) => {
    const tmp = document.createElement("DIV")
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ""
  }

  const plainContent = stripHtml(news.content)

  return (
    <div className="bg-bunker-800 border border-bunker-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Imagen de la noticia */}
      <div className="relative h-48 w-full bg-bunker-900">
        {news.image_url && !imageError ? (
          // Usar img nativo en lugar de Image de Next.js para mejor control de errores
          <img
            src={news.image_url || "/placeholder.svg"}
            alt={news.title}
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center text-gray-500"
            style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
          >
            {imageError ? "Error al cargar la imagen" : "Sin imagen"}
          </div>
        )}

        {/* Indicador de estado */}
        <div className="absolute top-2 right-2">
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              news.status === "active" ? "bg-green-900/30 text-green-400" : "bg-gray-800 text-gray-400"
            }`}
            style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
          >
            {news.status === "active" ? "Activa" : "Borrador"}
          </span>
        </div>
      </div>

      {/* Contenido de la noticia */}
      <div className="p-4">
        <h3
          className="text-lg font-semibold text-gray-100 mb-2"
          style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
        >
          {news.title}
        </h3>

        <div
          className="flex items-center text-xs text-gray-500 mb-3"
          style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
        >
          <span>{formatDate(news.created_at)}</span>
          <span className="mx-2">•</span>
          <span className="uppercase">{news.language}</span>
          {news.featured && (
            <>
              <span className="mx-2">•</span>
              <span className="text-gold-500 font-medium">Destacada</span>
            </>
          )}
        </div>

        <p className="text-gray-400 text-sm mb-4" style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}>
          {truncateText(plainContent, 120)}
        </p>

        {/* Botones de acción */}
        <div className="flex justify-between items-center pt-3 border-t border-bunker-700">
          <Link
            href={`/${news.language}/noticias/${news.id}`}
            target="_blank"
            className="flex items-center text-sm text-gray-400 hover:text-gold-500"
            style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
          >
            <Eye className="h-4 w-4 mr-1" />
            Ver
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={onEdit}
              className="flex items-center text-sm text-gray-400 hover:text-gold-500"
              style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
            >
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </button>

            <button
              onClick={onDelete}
              className="flex items-center text-sm text-gray-400 hover:text-red-400"
              style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
