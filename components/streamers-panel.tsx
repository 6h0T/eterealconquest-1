"use client"

import { useState, useEffect, useRef } from "react"
import { Tv, ChevronUp, ExternalLink, X } from "lucide-react"
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
  embed_url?: string
}

export default function StreamersPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [streamers, setStreamers] = useState<Streamer[]>([])
  const [liveCount, setLiveCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStreamer, setSelectedStreamer] = useState<Streamer | null>(null)
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

  // Función para generar la URL de embebido si no existe
  const getEmbedUrl = (streamer: Streamer): string => {
    if (streamer.embed_url) {
      return streamer.embed_url
    }

    const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
    
    if (streamer.platform === "twitch") {
      const twitchRegex = /(?:https?:\/\/)?(?:www\.)?twitch\.tv\/([a-zA-Z0-9_]+)/
      const match = streamer.channel_url.match(twitchRegex)
      if (match && match[1]) {
        const username = match[1]
        return `https://player.twitch.tv/?channel=${username}&parent=${currentDomain}`
      }
    } else if (streamer.platform === "youtube") {
      const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/
      const youtubeShortRegex = /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]+)/

      let match = streamer.channel_url.match(youtubeRegex)
      if (!match) {
        match = streamer.channel_url.match(youtubeShortRegex)
      }

      if (match && match[1]) {
        const videoId = match[1]
        return `https://www.youtube.com/embed/${videoId}`
      }
    } else if (streamer.platform === "facebook") {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(streamer.channel_url)}&show_text=false&width=560&height=315`
    } else if (streamer.platform === "kick") {
      const kickRegex = /(?:https?:\/\/)?(?:www\.)?kick\.com\/([a-zA-Z0-9_]+)/
      const match = streamer.channel_url.match(kickRegex)
      if (match && match[1]) {
        const username = match[1]
        return `https://player.kick.com/${username}`
      }
    }

    return ""
  }

  // Mostrar streamer seleccionado
  const handleShowStreamer = (streamer: Streamer) => {
    setSelectedStreamer(streamer)
  }

  // Cerrar streamer seleccionado
  const handleCloseStreamer = () => {
    setSelectedStreamer(null)
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
                    <div className="flex space-x-2">
                      {streamer.is_live && (
                        <button
                          onClick={() => handleShowStreamer(streamer)}
                          className="text-gold-300 hover:text-gold-100 transition-colors"
                          aria-label={`Ver stream de ${streamer.streamer_name}`}
                          title="Ver stream"
                        >
                          <Tv className="h-4 w-4" />
                        </button>
                      )}
                      <a
                        href={streamer.channel_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gold-300 hover:text-gold-100 transition-colors"
                        aria-label={`Ver canal de ${streamer.streamer_name}`}
                        title="Abrir en plataforma"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
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

      {/* Streamer seleccionado */}
      {selectedStreamer && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-bunker-800 rounded-lg shadow-lg w-full max-w-4xl">
            <div className="flex justify-between items-center p-4 border-b border-bunker-700">
              <div className="flex items-center">
                {getPlatformIcon(selectedStreamer.platform)}
                <h3 className="text-lg font-medium ml-2">{selectedStreamer.streamer_name}</h3>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href={selectedStreamer.channel_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Abrir en plataforma original"
                  title="Abrir en plataforma original"
                >
                  <ExternalLink className="h-5 w-5" />
                </a>
                <button
                  onClick={handleCloseStreamer}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Cerrar"
                  title="Cerrar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="aspect-video w-full bg-black">
                <iframe
                  src={getEmbedUrl(selectedStreamer)}
                  className="w-full h-full"
                  allowFullScreen
                  allow="autoplay; encrypted-media; picture-in-picture"
                  referrerPolicy="origin"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
