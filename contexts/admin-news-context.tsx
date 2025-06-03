"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Tipo para las noticias
export interface AdminNews {
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

interface AdminNewsContextType {
  news: AdminNews[]
  loading: boolean
  error: string | null
  addNews: (news: Omit<AdminNews, "id" | "created_at" | "updated_at">) => Promise<boolean>
  updateNews: (id: number, news: Partial<AdminNews>) => Promise<boolean>
  deleteNews: (id: number) => Promise<boolean>
  refreshNews: () => Promise<void>
}

const AdminNewsContext = createContext<AdminNewsContextType | undefined>(undefined)

export const AdminNewsProvider = ({ children }: { children: ReactNode }) => {
  const [news, setNews] = useState<AdminNews[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Función para cargar noticias desde la API de administración
  const fetchNews = async (): Promise<AdminNews[]> => {
    try {
      console.log('[ADMIN-NEWS-CONTEXT] Cargando noticias desde API admin...')
      
      const response = await fetch('/api/admin/news', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Error al cargar noticias')
      }
      
      console.log('[ADMIN-NEWS-CONTEXT] Noticias cargadas:', data.news.length)
      return data.news || []
    } catch (error) {
      console.error('[ADMIN-NEWS-CONTEXT] Error cargando noticias:', error)
      throw error
    }
  }

  // Función para refrescar noticias
  const refreshNews = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const fetchedNews = await fetchNews()
      setNews(fetchedNews)
      console.log('[ADMIN-NEWS-CONTEXT] Noticias actualizadas desde API admin')
    } catch (error) {
      console.error('[ADMIN-NEWS-CONTEXT] Error al refrescar noticias:', error)
      setError(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  // Cargar noticias al inicializar
  useEffect(() => {
    refreshNews()
  }, [])

  // Añadir una nueva noticia
  const addNews = async (newNews: Omit<AdminNews, "id" | "created_at" | "updated_at">): Promise<boolean> => {
    try {
      console.log('[ADMIN-NEWS-CONTEXT] Creando nueva noticia:', newNews.title)
      
      const response = await fetch('/api/admin/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newNews)
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Error al crear noticia')
      }

      // Actualizar la lista local
      setNews(prevNews => [data.news, ...prevNews])
      console.log('[ADMIN-NEWS-CONTEXT] Noticia creada exitosamente:', data.news.id)
      
      return true
    } catch (error) {
      console.error('[ADMIN-NEWS-CONTEXT] Error creando noticia:', error)
      setError(error instanceof Error ? error.message : 'Error al crear noticia')
      return false
    }
  }

  // Actualizar una noticia existente
  const updateNews = async (id: number, updatedNews: Partial<AdminNews>): Promise<boolean> => {
    try {
      console.log('[ADMIN-NEWS-CONTEXT] Actualizando noticia:', id)
      
      const response = await fetch('/api/admin/news', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...updatedNews })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Error al actualizar noticia')
      }

      // Actualizar la lista local
      setNews(prevNews => 
        prevNews.map(item => 
          item.id === id ? { ...item, ...data.news } : item
        )
      )
      
      console.log('[ADMIN-NEWS-CONTEXT] Noticia actualizada exitosamente:', id)
      return true
    } catch (error) {
      console.error('[ADMIN-NEWS-CONTEXT] Error actualizando noticia:', error)
      setError(error instanceof Error ? error.message : 'Error al actualizar noticia')
      return false
    }
  }

  // Eliminar una noticia
  const deleteNews = async (id: number): Promise<boolean> => {
    try {
      console.log('[ADMIN-NEWS-CONTEXT] Eliminando noticia:', id)
      
      const response = await fetch(`/api/admin/news?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Error al eliminar noticia')
      }

      // Actualizar la lista local
      setNews(prevNews => prevNews.filter(item => item.id !== id))
      console.log('[ADMIN-NEWS-CONTEXT] Noticia eliminada exitosamente:', id)
      
      return true
    } catch (error) {
      console.error('[ADMIN-NEWS-CONTEXT] Error eliminando noticia:', error)
      setError(error instanceof Error ? error.message : 'Error al eliminar noticia')
      return false
    }
  }

  return (
    <AdminNewsContext.Provider
      value={{
        news,
        loading,
        error,
        addNews,
        updateNews,
        deleteNews,
        refreshNews,
      }}
    >
      {children}
    </AdminNewsContext.Provider>
  )
}

// Hook personalizado para usar el contexto
export const useAdminNews = () => {
  const context = useContext(AdminNewsContext)
  if (context === undefined) {
    throw new Error("useAdminNews debe ser usado dentro de un AdminNewsProvider")
  }
  return context
} 