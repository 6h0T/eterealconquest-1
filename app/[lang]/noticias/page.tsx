"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useNews } from "@/contexts/news-context"
import { NewsProvider } from "@/contexts/news-context"
import Link from "next/link"
import { Loader2, Calendar, ChevronRight } from "lucide-react"

export default function NewsPage() {
  const params = useParams()
  const { getNewsByLanguage } = useNews()
  const [news, setNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.lang) {
      const newsItems = getNewsByLanguage(params.lang as string)
      setNews(newsItems)
      setLoading(false)
    }
  }, [params.lang, getNewsByLanguage])

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
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">Noticias</h1>

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
        <div className="text-center py-12 text-gray-400">No hay noticias disponibles en este momento.</div>
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
