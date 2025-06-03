"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Tipo para las noticias
export interface News {
  id: number
  title: string
  content: string
  image_url: string | null
  language: string
  status: string
  featured: boolean
  created_at: string
  updated_at: string
}

interface NewsContextType {
  news: News[]
  loading: boolean
  error: string | null
  addNews: (news: Omit<News, "id" | "created_at" | "updated_at">) => void
  updateNews: (id: number, news: Partial<News>) => void
  deleteNews: (id: number) => void
  getNewsByLanguage: (lang: string) => News[]
  getNewsById: (id: number) => News | undefined
  getFeaturedNews: (lang: string) => News[]
  refreshNews: () => Promise<void>
}

const NewsContext = createContext<NewsContextType | undefined>(undefined)

// Noticias de ejemplo como fallback
const fallbackNews: News[] = [
  {
    id: 1,
    title: "¡Bienvenidos a ETEREALCONQUEST!",
    content:
      "<p>Nos complace anunciar el lanzamiento oficial de ETEREALCONQUEST, ¡la nueva experiencia de MU Online que estabas esperando!</p><p>Prepárate para sumergirte en un mundo de fantasía, magia y aventuras épicas. Nuestros servidores están optimizados para ofrecerte la mejor experiencia de juego.</p>",
    image_url: "/placeholder.svg?height=600&width=800&text=Bienvenidos a ETEREALCONQUEST",
    language: "es",
    status: "active",
    featured: true,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 2,
    title: "Welcome to ETEREALCONQUEST!",
    content:
      "<p>We are pleased to announce the official launch of ETEREALCONQUEST, the new MU Online experience you've been waiting for!</p><p>Get ready to immerse yourself in a world of fantasy, magic, and epic adventures. Our servers are optimized to offer you the best gaming experience.</p>",
    image_url: "/placeholder.svg?height=600&width=800&text=Welcome to ETEREALCONQUEST",
    language: "en",
    status: "active",
    featured: true,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 3,
    title: "Bem-vindo ao ETEREALCONQUEST!",
    content:
      "<p>Temos o prazer de anunciar o lançamento oficial do ETEREALCONQUEST, a nova experiência MU Online que você estava esperando!</p><p>Prepare-se para mergulhar em um mundo de fantasia, magia e aventuras épicas. Nossos servidores estão otimizados para oferecer a melhor experiência de jogo.</p>",
    image_url: "/placeholder.svg?height=600&width=800&text=Bem-vindo ao ETEREALCONQUEST",
    language: "pt",
    status: "active",
    featured: true,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
]

export const NewsProvider = ({ children }: { children: ReactNode }) => {
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Función para cargar noticias desde la API
  const fetchNews = async (): Promise<News[]> => {
    try {
      console.log('[NEWS-CONTEXT] Cargando noticias desde API...')
      
      const response = await fetch('/api/news', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store' // Asegurar datos frescos
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const data = await response.json()
      console.log('[NEWS-CONTEXT] Noticias cargadas:', data.length || 0)
      
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error('[NEWS-CONTEXT] Error cargando noticias:', error)
      throw error
    }
  }

  // Función para refrescar noticias
  const refreshNews = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const fetchedNews = await fetchNews()
      
      if (fetchedNews.length > 0) {
        setNews(fetchedNews)
        console.log('[NEWS-CONTEXT] Noticias actualizadas desde API')
      } else {
        // Si no hay noticias en la BD, usar fallback
        setNews(fallbackNews)
        console.log('[NEWS-CONTEXT] Usando noticias de fallback')
      }
    } catch (error) {
      console.error('[NEWS-CONTEXT] Error al refrescar noticias:', error)
      setError(error instanceof Error ? error.message : 'Error desconocido')
      
      // En caso de error, usar noticias de fallback
      setNews(fallbackNews)
      console.log('[NEWS-CONTEXT] Usando noticias de fallback por error')
    } finally {
      setLoading(false)
    }
  }

  // Cargar noticias al inicializar
  useEffect(() => {
    refreshNews()
  }, [])

  // Añadir una nueva noticia (solo para admin, actualizar en tiempo real)
  const addNews = (newNews: Omit<News, "id" | "created_at" | "updated_at">) => {
    const now = new Date().toISOString()
    const id = news.length > 0 ? Math.max(...news.map((n) => n.id)) + 1 : 1

    const newsItem: News = {
      ...newNews,
      id,
      created_at: now,
      updated_at: now,
    }

    setNews((prevNews) => [newsItem, ...prevNews])
    console.log('[NEWS-CONTEXT] Noticia añadida localmente:', newsItem.title)
  }

  // Actualizar una noticia existente
  const updateNews = (id: number, updatedNews: Partial<News>) => {
    setNews((prevNews) =>
      prevNews.map((item) =>
        item.id === id ? { ...item, ...updatedNews, updated_at: new Date().toISOString() } : item,
      ),
    )
    console.log('[NEWS-CONTEXT] Noticia actualizada localmente:', id)
  }

  // Eliminar una noticia
  const deleteNews = (id: number) => {
    setNews((prevNews) => prevNews.filter((item) => item.id !== id))
    console.log('[NEWS-CONTEXT] Noticia eliminada localmente:', id)
  }

  // Obtener noticias por idioma
  const getNewsByLanguage = (lang: string) => {
    return news.filter((item) => item.language === lang && item.status === "active")
  }

  // Obtener noticia por ID
  const getNewsById = (id: number) => {
    return news.find((item) => item.id === id)
  }

  // Obtener noticias destacadas por idioma
  const getFeaturedNews = (lang: string) => {
    return news.filter((item) => item.language === lang && item.status === "active" && item.featured)
  }

  return (
    <NewsContext.Provider
      value={{
        news,
        loading,
        error,
        addNews,
        updateNews,
        deleteNews,
        getNewsByLanguage,
        getNewsById,
        getFeaturedNews,
        refreshNews,
      }}
    >
      {children}
    </NewsContext.Provider>
  )
}

// Hook personalizado para usar el contexto
export const useNews = () => {
  const context = useContext(NewsContext)
  if (context === undefined) {
    throw new Error("useNews debe ser usado dentro de un NewsProvider")
  }
  return context
}
