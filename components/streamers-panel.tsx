"use client"

import { useState, useEffect, useRef } from "react"
import { Tv, ChevronUp, ExternalLink } from "lucide-react"
import { Twitch, Youtube, Facebook } from "lucide-react"

// Tipo para los streamers
interface Streamer {
  id: number
  streamer_name: string
  platform: "twitch" | "kick" | "facebook" | "youtube"
  channel_url: string
  is_live: boolean
  is_active: boolean
  thumbnail_url?: string
  description?: string
}

export default function StreamersPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [streamers, setStreamers] = useState<Streamer[]>([])
  const [liveCount, setLiveCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Función para obtener los streamers
  const fetchStreamers = async () => {
    try {
      setIsLoading(true)
      const timestamp = new Date().getTime() // Para evitar caché
      const response = await fetch(`/api/streamers?t=${timestamp}`)

      if (!response.ok) {
        throw new Error("Error al obtener streamers")
      }

      const data = await response.json()
      setStreamers(data.streamers || [])
      setLiveCount(data.liveCount || 0)
      setError(null)
    } catch (err) {
      console.error("Error al cargar streamers:", err)
      setError("No se pudieron cargar los streamers")
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar streamers al montar el componente
  useEffect(() => {
    fetchStreamers()

    // Actualizar cada 5 minutos
    const interval = setInterval(fetchStreamers, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  // Cerrar el panel al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Función para obtener el icono según la plataforma
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "twitch":
        return <Twitch className="h-4 w-4 text-purple-500" />
      case "youtube":
        return <Youtube className="h-4 w-4 text-red-500" />
      case "facebook":
        return <Facebook className="h-4 w-4 text-blue-500" />
      case "kick":
        return <Tv className="h-4 w-4 text-green-500" />
      default:
        return <Tv className="h-4 w-4" />
    }
  }

  return (
    <div ref={panelRef} className="fixed bottom-4 left-4 z-50">
      {/* Panel desplegable */}
      <div
        className={`bg-bunker-900 border border-bunker-700 rounded-lg shadow-lg transition-all duration-300 overflow-hidden ${
          isOpen ? "max-h-96 w-72 opacity-100 translate-y-0" : "max-h-0 w-0 opacity-0 translate-y-4"
        }`}
      >
        <div className="p-3 border-b border-bunker-800">
          <h3 className="text-gold-100 font-medium flex items-center">
            <Tv className="mr-2 h-4 w-4" />
            Streamers en vivo
          </h3>
        </div>

        <div className="max-h-72 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-gray-400">Cargando streamers...</div>
          ) : error ? (
            <div className="p-4 text-center text-sm text-red-400">{error}</div>
          ) : streamers.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-400">No hay streamers disponibles</div>
          ) : (
            <ul className="divide-y divide-bunker-800">
              {streamers.map((streamer) => (
                <li key={streamer.id} className="p-3 hover:bg-bunker-800 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getPlatformIcon(streamer.platform)}
                      <span className="ml-2 text-sm font-medium text-gold-100">{streamer.streamer_name}</span>
                      {streamer.is_live && (
                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-900 text-red-100">
                          EN VIVO
                        </span>
                      )}
                    </div>
                    <a
                      href={streamer.channel_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gold-300 hover:text-gold-100 transition-colors"
                      aria-label={`Ver stream de ${streamer.streamer_name}`}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                  {streamer.description && (
                    <p className="mt-1 text-xs text-gray-400 line-clamp-2">{streamer.description}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Botón para abrir/cerrar el panel */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 bg-bunker-900 text-gold-100 px-3 py-2 rounded-lg shadow-lg hover:bg-bunker-800 transition-colors ${
          isOpen ? "border-t-0 rounded-t-none" : "border border-bunker-700"
        }`}
        aria-expanded={isOpen}
        aria-controls="streamers-panel"
      >
        <Tv className="h-5 w-5" />
        <span className="font-medium text-sm">{liveCount > 0 ? `${liveCount} en vivo` : "Streamers"}</span>
        <ChevronUp className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
    </div>
  )
}
