"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useNews } from "@/contexts/news-context"
import { NewsProvider } from "@/contexts/news-context"
import Link from "next/link"
import { Loader2, Calendar, ChevronRight, AlertCircle, RefreshCw } from "lucide-react"

export default function NewsPage() {
  const params = useParams()
  const { getNewsByLanguage, loading, error, refreshNews } = useNews()
  const [news, setNews] = useState<any[]>([])

  useEffect(() => {
    if (params.lang && !loading) {
      const newsItems = getNewsByLanguage(params.lang as string)
      setNews(newsItems)
    }
  }, [params.lang, getNewsByLanguage, loading])

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat(params.lang as string, {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date)
  }

  // Eliminar etiquetas HTML del contenido
  const stripHtml = (html: string) => {
    const tmp = document.createElement("DIV")
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ""
  }

  // Truncar texto
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-gold-500 mx-auto mb-4" />
            <p className="text-gray-400">Cargando noticias...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center">Noticias</h1>
        
        {/* Botón de refrescar solo visible si hay error */}
        {error && (
          <button
            onClick={refreshNews}
            className="flex items-center px-4 py-2 bg-gold-600 hover:bg-gold-700 text-bunker-950 rounded-md font-medium transition-colors"
            title="Recargar noticias"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Recargar
          </button>
        )}
      </div>

      {/* Mostrar error si existe */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-700/50 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
          <span className="text-red-300 text-sm">
            Error cargando noticias desde el servidor. Mostrando noticias de respaldo.
          </span>
        </div>
      )}

      {news.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((item) => (
            <div
              key={item.id}
              className="bg-bunker-800 border border-bunker-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              {/* Imagen */}
              <div className="relative h-48 w-full bg-bunker-900">
                {item.image_url ? (
                  <img
                    src={item.image_url || "/placeholder.svg"}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback a una imagen por defecto si hay error
                      ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=400&width=600&text=Noticia"
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500">Sin imagen</div>
                )}
              </div>

              {/* Contenido */}
              <div className="p-6">
                <h2 className="text-xl font-bold mb-3 text-gray-100">{item.title}</h2>

                <div className="flex items-center text-xs text-gray-400 mb-4">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>{formatDate(item.created_at)}</span>
                </div>

                <p className="text-gray-300 text-sm mb-4">{truncateText(stripHtml(item.content), 150)}</p>

                <Link
                  href={`/${params.lang}/noticias/${item.id}`}
                  className="inline-flex items-center text-gold-500 hover:text-gold-400"
                >
                  Leer más <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg mb-4">No hay noticias disponibles en este idioma.</p>
          <p className="text-sm">Las noticias aparecerán aquí cuando los administradores las publiquen.</p>
        </div>
      )}
    </div>
  )
}

// Envolver la página con el proveedor de noticias
export function NewsPageWrapper() {
  return (
    <NewsProvider>
      <NewsPage />
    </NewsProvider>
  )
}
