"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Calendar, ChevronRight } from "lucide-react"
import { useNews } from "@/contexts/news-context"

interface HomeNewsSectionProps {
  lang: string
  translations: any
}

export default function HomeNewsSection({ lang, translations }: HomeNewsSectionProps) {
  const { news, loading, error, getFeaturedNews } = useNews()
  const [displayNews, setDisplayNews] = useState<any[]>([])

  useEffect(() => {
    if (!loading) {
      const featuredNews = getFeaturedNews(lang)
      setDisplayNews(featuredNews.slice(0, 3)) // Mostrar solo las 3 primeras noticias destacadas
    }
  }, [lang, news, loading, getFeaturedNews])

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat(lang, {
      day: "2-digit",
      month: "short",
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
      <section className="py-12 bg-bunker-900">
        <div className="container mx-auto px-4">
          <div className="h-8 w-48 bg-bunker-800 animate-pulse rounded-md mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-bunker-800 animate-pulse rounded-lg"></div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    console.warn('[HOME-NEWS-SECTION] Error cargando noticias:', error)
    // Continuar mostrando noticias fallback sin mensaje de error visible
  }

  if (displayNews.length === 0) {
    return null // No mostrar la sección si no hay noticias destacadas
  }

  return (
    <section className="py-12 bg-bunker-900">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gold-500">Últimas noticias</h2>
          <Link href={`/${lang}/noticias`} className="text-gold-500 hover:text-gold-400 flex items-center">
            Ver todas <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayNews.map((item) => (
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
              <div className="p-4">
                <h3 className="text-lg font-bold mb-3 text-gray-100">{item.title}</h3>

                <div className="flex items-center text-xs text-gray-400 mb-4">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>{formatDate(item.created_at)}</span>
                </div>

                <p className="text-gray-300 text-sm mb-4">{truncateText(stripHtml(item.content), 100)}</p>

                <Link
                  href={`/${lang}/noticias/${item.id}`}
                  className="inline-flex items-center text-gold-500 hover:text-gold-400"
                >
                  Leer más <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
