"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useNews } from "@/contexts/news-context"
import { NewsProvider } from "@/contexts/news-context"
import { Loader2 } from "lucide-react"
import Link from "next/link"

export default function NewsDetailPage() {
  const params = useParams()
  const { getNewsById } = useNews()
  const [news, setNews] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    if (params.id) {
      const newsId = Number.parseInt(params.id as string, 10)
      const newsItem = getNewsById(newsId)
      setNews(newsItem)
      setLoading(false)
    }
  }, [params.id, getNewsById])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
      </div>
    )
  }

  if (!news) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Noticia no encontrada</h1>
          <p className="mb-6">La noticia que estás buscando no existe o ha sido eliminada.</p>
          <Link
            href={`/${params.lang}/noticias`}
            className="inline-block px-6 py-2 bg-gold-600 text-black font-medium rounded-md hover:bg-gold-500"
          >
            Volver a noticias
          </Link>
        </div>
      </div>
    )
  }

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat(params.lang as string, {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-400">
          <Link href={`/${params.lang}`} className="hover:text-gold-500">
            Inicio
          </Link>{" "}
          /{" "}
          <Link href={`/${params.lang}/noticias`} className="hover:text-gold-500">
            Noticias
          </Link>{" "}
          / <span className="text-gray-300">{news.title}</span>
        </div>

        {/* Título y fecha */}
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{news.title}</h1>
        <div className="flex items-center text-sm text-gray-400 mb-8">
          <span>{formatDate(news.created_at)}</span>
        </div>

        {/* Imagen destacada */}
        {news.image_url && !imageError ? (
          <div className="relative w-full h-[300px] md:h-[400px] mb-8 rounded-lg overflow-hidden">
            <img
              src={news.image_url || "/placeholder.svg"}
              alt={news.title}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          </div>
        ) : null}

        {/* Contenido */}
        <div className="prose prose-lg prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: news.content }} />

        {/* Botón volver */}
        <div className="mt-12 text-center">
          <Link
            href={`/${params.lang}/noticias`}
            className="inline-block px-6 py-2 bg-bunker-800 border border-bunker-700 text-gray-200 rounded-md hover:bg-bunker-700"
          >
            Volver a noticias
          </Link>
        </div>
      </div>
    </div>
  )
}

// Envolver la página con el proveedor de noticias
export function NewsDetailPageWrapper() {
  return (
    <NewsProvider>
      <NewsDetailPage />
    </NewsProvider>
  )
}
