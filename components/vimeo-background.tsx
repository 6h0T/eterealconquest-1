"use client"

import { useEffect, useRef, useState } from "react"

interface VimeoBackgroundProps {
  videoId: string
  fallbackId?: string // ID de respaldo en caso de que el principal no funcione
  className?: string
  overlayOpacity?: number
  extraZoom?: boolean // No usaremos esta prop pero la mantenemos para compatibilidad
  pauseOnClick?: boolean // Prop para controlar si el video se pausa al hacer clic
}

export function VimeoBackground({
  videoId,
  fallbackId,
  className = "",
  overlayOpacity = 0.6,
  extraZoom = false, // Mantenido por compatibilidad
  pauseOnClick = true, // Por defecto, pausar al hacer clic
}: VimeoBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [vimeoPlayer, setVimeoPlayer] = useState<any>(null)
  const [isPlaying, setIsPlaying] = useState(true)

  // Asegurar que el ID del video es válido
  const validVideoId = videoId || fallbackId || "1074465089" // ID de respaldo por si acaso

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  // Inicializar el reproductor de Vimeo cuando el iframe está cargado
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined" && window.Vimeo && iframeRef.current) {
      try {
        const player = new window.Vimeo.Player(iframeRef.current)
        setVimeoPlayer(player)

        // Asegurarse de que el video se reproduce automáticamente
        player.play().catch((error: Error) => {
          console.warn("Error al reproducir automáticamente el video de Vimeo:", error)
        })

        // Configurar eventos
        player.on("play", () => setIsPlaying(true))
        player.on("pause", () => setIsPlaying(false))

        return () => {
          player.off("play")
          player.off("pause")
          player.destroy()
        }
      } catch (error) {
        console.error("Error al inicializar el reproductor de Vimeo:", error)
      }
    }
  }, [isLoaded])

  // Manejar clic en el contenedor
  const handleClick = () => {
    if (pauseOnClick && vimeoPlayer) {
      if (isPlaying) {
        vimeoPlayer.pause()
      } else {
        vimeoPlayer.play()
      }
    }
  }

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden ${className}`}
      onClick={pauseOnClick ? handleClick : undefined}
      style={{ height: "100%" }}
    >
      {/* Overlay con opacidad configurable */}
      <div className="absolute inset-0 bg-bunker-950 z-10" style={{ opacity: overlayOpacity }}></div>

      {/* Contenedor del video */}
      <div className="absolute inset-0 w-full h-full z-0">
        {isLoaded && (
          <iframe
            ref={iframeRef}
            src={`https://player.vimeo.com/video/${validVideoId}?h=468905b58b&badge=0&autopause=0&player_id=vimeo-background-${validVideoId}&app_id=58479&background=1&muted=1&loop=1&autoplay=1&controls=0&title=0&byline=0&portrait=0`}
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
            title="Background Video"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "250%",
              height: "250%",
              objectFit: "cover"
            }}
            onError={() => {
              // Si hay un error al cargar el video, intentar con el ID de respaldo
              if (videoId !== fallbackId && fallbackId) {
                console.log(`Error loading Vimeo video ${videoId}, falling back to ${fallbackId}`)
                // No podemos cambiar la URL directamente, pero podemos notificar al usuario
                console.warn("Vimeo video failed to load. Please check the video ID.")
              }
            }}
          ></iframe>
        )}
      </div>
    </div>
  )
}
