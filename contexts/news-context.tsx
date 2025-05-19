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
  addNews: (news: Omit<News, "id" | "created_at" | "updated_at">) => void
  updateNews: (id: number, news: Partial<News>) => void
  deleteNews: (id: number) => void
  getNewsByLanguage: (lang: string) => News[]
  getNewsById: (id: number) => News | undefined
  getFeaturedNews: (lang: string) => News[]
}

const NewsContext = createContext<NewsContextType | undefined>(undefined)

// Clave para almacenar noticias en localStorage
const NEWS_STORAGE_KEY = "eterealconquest_news"

// Noticias de ejemplo iniciales
const initialNews: News[] = [
  {
    id: 1,
    title: "¡Bienvenidos a ETEREALCONQUEST!",
    content:
      "<p>Nos complace anunciar el lanzamiento oficial de ETEREALCONQUEST, ¡la nueva experiencia de MU Online que estabas esperando!</p><p>Prepárate para sumergirte en un mundo de fantasía, magia y aventuras épicas. Nuestros servidores están optimizados para ofrecerte la mejor experiencia de juego.</p>",
    image_url: "/placeholder.svg?height=600&width=800&text=Bienvenidos a ETEREALCONQUEST",
    language: "es",
    status: "active",
    featured: true,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 días atrás
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 2,
    title: "Nuevo evento: La Caída de los Dragones",
    content:
      "<p>¡Atención guerreros! Un nuevo evento ha comenzado en el mundo de MU. Los dragones ancestrales han despertado y amenazan con destruir el reino.</p><p>Únete a otros jugadores para enfrentar esta amenaza y obtén recompensas exclusivas como sets legendarios y armas únicas.</p>",
    image_url: "/placeholder.svg?height=600&width=800&text=Evento Dragones",
    language: "es",
    status: "active",
    featured: true,
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 día atrás
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 3,
    title: "Guía para nuevos jugadores",
    content:
      "<p>¿Eres nuevo en ETEREALCONQUEST? No te preocupes, hemos preparado una guía completa para ayudarte a dar tus primeros pasos en este vasto mundo.</p><p>Aprende sobre las diferentes clases, cómo subir de nivel eficientemente y los mejores lugares para farmear.</p>",
    image_url: "/placeholder.svg?height=600&width=800&text=Guía para Novatos",
    language: "es",
    status: "active",
    featured: false,
    created_at: new Date(Date.now() - 86400000 * 0.5).toISOString(), // 12 horas atrás
    updated_at: new Date(Date.now() - 86400000 * 0.5).toISOString(),
  },
  {
    id: 4,
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
    id: 5,
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

  // Cargar noticias del localStorage al iniciar
  useEffect(() => {
    const storedNews = localStorage.getItem(NEWS_STORAGE_KEY)
    if (storedNews) {
      setNews(JSON.parse(storedNews))
    } else {
      // Si no hay noticias almacenadas, usar las iniciales
      setNews(initialNews)
      localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(initialNews))
    }
  }, [])

  // Guardar noticias en localStorage cuando cambien
  useEffect(() => {
    if (news.length > 0) {
      localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(news))
    }
  }, [news])

  // Añadir una nueva noticia
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
  }

  // Actualizar una noticia existente
  const updateNews = (id: number, updatedNews: Partial<News>) => {
    setNews((prevNews) =>
      prevNews.map((item) =>
        item.id === id ? { ...item, ...updatedNews, updated_at: new Date().toISOString() } : item,
      ),
    )
  }

  // Eliminar una noticia
  const deleteNews = (id: number) => {
    setNews((prevNews) => prevNews.filter((item) => item.id !== id))
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
        addNews,
        updateNews,
        deleteNews,
        getNewsByLanguage,
        getNewsById,
        getFeaturedNews,
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
