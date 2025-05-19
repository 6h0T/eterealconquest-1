"use client"

import { useState, useEffect } from "react"
import { useNews } from "@/contexts/news-context"
import { NewsCard } from "./news-card"
import { NewsFormModal } from "./news-form-modal"
import { DeleteConfirmationModal } from "./delete-confirmation-modal"
import { Plus, Search, Filter, SortAsc, SortDesc, RefreshCw } from "lucide-react"

export function NewsManager() {
  const { news, addNews, updateNews, deleteNews } = useNews()
  const [filteredNews, setFilteredNews] = useState(news)
  const [searchTerm, setSearchTerm] = useState("")
  const [languageFilter, setLanguageFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedNews, setSelectedNews] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Simular tiempo de carga
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // Actualizar noticias filtradas cuando cambian los filtros o las noticias
  useEffect(() => {
    let result = [...news]

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (item) => item.title.toLowerCase().includes(term) || item.content.toLowerCase().includes(term),
      )
    }

    // Filtrar por idioma
    if (languageFilter !== "all") {
      result = result.filter((item) => item.language === languageFilter)
    }

    // Filtrar por estado
    if (statusFilter !== "all") {
      result = result.filter((item) => item.status === statusFilter)
    }

    // Ordenar por fecha
    result.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA
    })

    setFilteredNews(result)
  }, [news, searchTerm, languageFilter, statusFilter, sortOrder])

  // Manejar creación o actualización de noticia
  const handleSaveNews = (newsData: any) => {
    if (selectedNews !== null) {
      // Actualizar noticia existente
      updateNews(selectedNews, newsData)
    } else {
      // Crear nueva noticia
      addNews(newsData)
    }
    setIsFormModalOpen(false)
    setSelectedNews(null)
  }

  // Manejar eliminación de noticia
  const handleDeleteNews = () => {
    if (selectedNews !== null) {
      deleteNews(selectedNews)
      setIsDeleteModalOpen(false)
      setSelectedNews(null)
    }
  }

  // Abrir modal para editar noticia
  const handleEditNews = (id: number) => {
    setSelectedNews(id)
    setIsFormModalOpen(true)
  }

  // Abrir modal para confirmar eliminación
  const handleDeleteConfirm = (id: number) => {
    setSelectedNews(id)
    setIsDeleteModalOpen(true)
  }

  // Abrir modal para crear nueva noticia
  const handleCreateNews = () => {
    setSelectedNews(null)
    setIsFormModalOpen(true)
  }

  // Alternar orden de clasificación
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
  }

  // Reiniciar filtros
  const resetFilters = () => {
    setSearchTerm("")
    setLanguageFilter("all")
    setStatusFilter("all")
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-bunker-800 animate-pulse rounded-md"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-bunker-800 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Barra de herramientas */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Búsqueda */}
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar noticias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-bunker-800 border border-bunker-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 text-gray-100"
            style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
          />
        </div>

        {/* Filtros */}
        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="pl-10 pr-4 py-2 bg-bunker-800 border border-bunker-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 text-gray-100"
              style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
            >
              <option value="all">Todos los idiomas</option>
              <option value="es">Español</option>
              <option value="en">Inglés</option>
              <option value="pt">Portugués</option>
            </select>
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-4 py-2 bg-bunker-800 border border-bunker-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 text-gray-100"
              style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activas</option>
              <option value="draft">Borradores</option>
            </select>
          </div>

          <button
            onClick={toggleSortOrder}
            className="px-3 py-2 bg-bunker-800 border border-bunker-700 rounded-md hover:bg-bunker-700 focus:outline-none focus:ring-2 focus:ring-gold-500"
            title={sortOrder === "asc" ? "Más antiguas primero" : "Más recientes primero"}
          >
            {sortOrder === "asc" ? (
              <SortAsc className="h-5 w-5 text-gray-400" />
            ) : (
              <SortDesc className="h-5 w-5 text-gray-400" />
            )}
          </button>

          <button
            onClick={resetFilters}
            className="px-3 py-2 bg-bunker-800 border border-bunker-700 rounded-md hover:bg-bunker-700 focus:outline-none focus:ring-2 focus:ring-gold-500"
            title="Reiniciar filtros"
          >
            <RefreshCw className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Botón crear */}
        <button
          onClick={handleCreateNews}
          className="flex items-center justify-center px-4 py-2 bg-gold-600 text-black font-medium rounded-md hover:bg-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500"
          style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
        >
          <Plus className="h-5 w-5 mr-2" />
          Nueva noticia
        </button>
      </div>

      {/* Lista de noticias */}
      {filteredNews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map((item) => (
            <NewsCard
              key={item.id}
              news={item}
              onEdit={() => handleEditNews(item.id)}
              onDelete={() => handleDeleteConfirm(item.id)}
            />
          ))}
        </div>
      ) : (
        <div
          className="text-center py-12 text-gray-400"
          style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
        >
          {news.length === 0
            ? "No hay noticias. ¡Crea la primera!"
            : "No se encontraron noticias con los filtros aplicados."}
        </div>
      )}

      {/* Modal de formulario */}
      {isFormModalOpen && (
        <NewsFormModal
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false)
            setSelectedNews(null)
          }}
          onSave={handleSaveNews}
          news={selectedNews !== null ? news.find((item) => item.id === selectedNews) : undefined}
        />
      )}

      {/* Modal de confirmación de eliminación */}
      {isDeleteModalOpen && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false)
            setSelectedNews(null)
          }}
          onConfirm={handleDeleteNews}
          title="Eliminar noticia"
          message="¿Estás seguro de que deseas eliminar esta noticia? Esta acción no se puede deshacer."
        />
      )}
    </div>
  )
}
