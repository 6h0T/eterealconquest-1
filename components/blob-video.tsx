"use client"

import type React from "react"
import { useRef, useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Play, Pause } from "lucide-react"

interface BlobVideoProps {
  src: string
  className?: string
  autoPlay?: boolean
  loop?: boolean
  muted?: boolean
  controls?: boolean
  poster?: string
  showPlayButton?: boolean
}

export function BlobVideo({
  src,
  className,
  autoPlay = true,
  loop = true,
  muted = true,
  controls = false,
  poster,
  showPlayButton = true,
  ...props
}: BlobVideoProps & React.ComponentPropsWithoutRef<"video">) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [showOverlay, setShowOverlay] = useState(false)

  // Verificar si la URL ya es de Vercel Blob
  const isVercelBlob = src.startsWith("https://v0.blob.com/")

  // Si no es una URL de Vercel Blob, usar un placeholder o una URL vacía
  const videoSrc = isVercelBlob ? src : ""

  // Iniciar reproducción automática
  useEffect(() => {
    const videoElement = videoRef.current
    if (videoElement) {
      const playPromise = videoElement.play()

      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Error al reproducir el video:", error)
          setIsPlaying(false)
        })
      }
    }
  }, [src])

  // Manejar clic en el video
  const handleVideoClick = () => {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch((error) => {
          console.error("Error al reproducir el video:", error)
          setIsPlaying(false)
        })
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }

  // Mostrar overlay brevemente al hacer clic
  const handleContainerClick = () => {
    handleVideoClick()
    setShowOverlay(true)
    setTimeout(() => {
      setShowOverlay(false)
    }, 1500) // Ocultar después de 1.5 segundos
  }

  return (
    <div className={`relative ${className}`} onClick={handleContainerClick}>
      <video
        ref={videoRef}
        className={cn("w-full h-auto", className)}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        controls={controls}
        poster={poster}
        playsInline
        {...props}
      >
        {videoSrc && <source src={videoSrc} type="video/mp4" />}
        Tu navegador no soporta el elemento de video.
      </video>

      {showPlayButton && showOverlay && (
        <div
          className="absolute inset-0 flex items-center justify-center transition-opacity duration-300"
          style={{ backgroundColor: "rgba(17, 20, 26, 0.4)" }}
        >
          <div
            className="w-16 h-16 rounded-full bg-gold-500/80 flex items-center justify-center text-bunker-950"
            aria-label={isPlaying ? "Video pausado" : "Video reproduciendo"}
          >
            {isPlaying ? <Pause size={32} /> : <Play size={32} />}
          </div>
        </div>
      )}
    </div>
  )
}
