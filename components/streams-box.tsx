"use client"

import { useState, useEffect, useRef } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Tv, ChevronUp, ExternalLink, X } from "lucide-react"
import { Twitch, Youtube, Facebook } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// Tipos
interface Stream {
  id: number
  title: string
  platform: string
  url: string
  embed_url: string
  thumbnail_url?: string
  is_live: boolean
  is_active: boolean
  created_at: string
}

export default function StreamsBox() {
  const [isOpen, setIsOpen] = useState(false)
  const [streams, setStreams] = useState<Stream[]>([])
  const [liveCount, setLiveCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Función para obtener los streams
  const fetchStreams = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const supabase = createClientComponentClient()
      const { data, error } = await supabase
        .from("streams")
        .select("*")
        .eq("is_live", true)
        .eq("is_active", true)
        .order("title", { ascending: true })

      if (error) {
        console.error("Error al obtener streams:", error)
        throw new Error(`Error al obtener streams: ${error.message}`)
      }

      setStreams(data || [])
      setLiveCount(data?.length || 0)
    } catch (err: any) {
      console.error("Error al cargar streams:", err)
      setError(err.message || "Error al obtener streams")
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar streams al montar el componente y configurar suscripción en tiempo real
  useEffect(() => {
    fetchStreams()

    // Configurar suscripción en tiempo real
    const supabase = createClientComponentClient()

    const streamsSubscription = supabase
      .channel("streams-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "streams",
        },
        () => {
          // Cuando hay cambios, actualizar los datos
          fetchStreams()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(streamsSubscription)
    }
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

  // Función para obtener la URL de la miniatura
  const getThumbnailUrl = (stream: Stream) => {
    if (stream.thumbnail_url) {
      return stream.thumbnail_url
    }

    // Si no hay miniatura personalizada, usar una predeterminada según la plataforma
    if (stream.platform === "twitch") {
      // Extraer el nombre de usuario de la URL de Twitch
      const twitchRegex = /(?:https?:\/\/)?(?:www\.)?twitch\.tv\/([a-zA-Z0-9_]+)/
      const match = stream.url.match(twitchRegex)
      if (match && match[1]) {
        const username = match[1]
        return `https://static-cdn.jtvnw.net/previews-ttv/live_user_${username.toLowerCase()}-320x180.jpg?${Date.now()}`
      }
    }

    // Para otras plataformas o si no se pudo extraer el nombre de usuario
    return "/placeholder.svg?height=180&width=320"
  }

  // Seleccionar stream para ver
  const handleSelectStream = (stream: Stream) => {
    setSelectedStream(stream)
  }

  // Cerrar stream seleccionado
  const handleCloseStream = () => {
    setSelectedStream(null)
  }

  return (
    <div ref={panelRef} className="fixed bottom-4 left-4 z-50">
      {/* Panel desplegable */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, width: 0 }}
            animate={{ opacity: 1, height: "auto", width: "320px" }}
            exit={{ opacity: 0, height: 0, width: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-12 left-0 bg-black/90 backdrop-blur-sm border border-bunker-800/50 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            <div className="p-3 border-b border-bunker-800">
              <h3 className="text-gold-100 font-medium flex items-center">
                <Tv className="mr-2 h-4 w-4" />
                Streams en vivo
              </h3>
            </div>

            <div className="max-h-72 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-sm text-gray-400">Cargando streams...</div>
              ) : error ? (
                <div className="p-4 text-center text-sm text-red-400">{error}</div>
              ) : streams.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-400">No hay streams en vivo</div>
              ) : (
                <ul className="divide-y divide-bunker-800">
                  {streams.map((stream) => (
                    <li key={stream.id} className="p-3 hover:bg-bunker-800 transition-colors">
                      <button onClick={() => handleSelectStream(stream)} className="w-full text-left">
                        <div className="aspect-video w-full overflow-hidden rounded-md mb-2">
                          <img
                            src={getThumbnailUrl(stream) || "/placeholder.svg"}
                            alt={stream.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {getPlatformIcon(stream.platform)}
                            <span className="ml-2 text-sm font-medium text-gold-100">{stream.title}</span>
                          </div>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-900 text-red-100">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1 animate-pulse"></span>
                            EN VIVO
                          </span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón para abrir/cerrar el panel */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 bg-bunker-900 text-gold-100 px-3 py-2 rounded-lg shadow-lg hover:bg-bunker-800 transition-colors ${
          isOpen ? "border-t-0 rounded-t-none" : "border border-bunker-700"
        }`}
        aria-expanded={isOpen}
        aria-controls="streams-panel"
      >
        <Tv className="h-5 w-5" />
        <span className="font-medium text-sm">{liveCount > 0 ? `${liveCount} en vivo` : "Streams"}</span>
        <ChevronUp className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Stream seleccionado */}
      <AnimatePresence>
        {selectedStream && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-bunker-800 rounded-lg shadow-lg w-full max-w-4xl">
              <div className="flex justify-between items-center p-4 border-b border-bunker-700">
                <div className="flex items-center">
                  {getPlatformIcon(selectedStream.platform)}
                  <h3 className="text-lg font-medium ml-2">{selectedStream.title}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <a
                    href={selectedStream.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label="Abrir en plataforma original"
                    title="Abrir en plataforma original"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </a>
                  <button
                    onClick={handleCloseStream}
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
                    src={selectedStream.embed_url}
                    className="w-full h-full"
                    allowFullScreen
                    allow="autoplay; encrypted-media; picture-in-picture"
                    referrerPolicy="origin"
                  ></iframe>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
