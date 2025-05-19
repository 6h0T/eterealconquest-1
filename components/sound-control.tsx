"use client"

import { useState, useEffect, useRef } from "react"
import { Volume2, VolumeX } from "lucide-react"
import { getDictionary } from "@/i18n/config"
import type { Locale } from "@/i18n/config"

interface SoundControlProps {
  playerId: string
  heroSectionId?: string
  lang: Locale
}

export function SoundControl({ playerId, heroSectionId = "hero-section", lang }: SoundControlProps) {
  const [isMuted, setIsMuted] = useState(true)
  const [isVisible, setIsVisible] = useState(true)
  const [playerReady, setPlayerReady] = useState(false)
  const [dictionary, setDictionary] = useState<any>({})
  const playerRef = useRef<any>(null)
  const controlRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadDictionary = async () => {
      const dict = await getDictionary(lang)
      setDictionary(dict)
    }
    loadDictionary()
  }, [lang])

  useEffect(() => {
    // Función para verificar si el usuario está viendo el hero section
    const checkVisibility = () => {
      const heroSection = document.getElementById(heroSectionId)
      if (heroSection) {
        const rect = heroSection.getBoundingClientRect()
        const isInView = rect.top < window.innerHeight && rect.bottom >= 0
        setIsVisible(isInView)
      }
    }

    // Verificar la visibilidad inicialmente
    checkVisibility()

    // Verificar la visibilidad al hacer scroll
    window.addEventListener("scroll", checkVisibility)

    return () => {
      window.removeEventListener("scroll", checkVisibility)
    }
  }, [heroSectionId])

  useEffect(() => {
    // Función para inicializar el reproductor cuando el script esté cargado
    const initializePlayer = () => {
      // Verificar si la API de Vimeo está disponible
      if (typeof window === "undefined" || !window.Vimeo || !window.Vimeo.Player) {
        return false
      }

      try {
        // Verificar si el iframe existe
        const iframe = document.getElementById(playerId) as HTMLIFrameElement
        if (!iframe) {
          console.log(`Iframe con ID ${playerId} no encontrado`)
          return false
        }

        // Crear el reproductor
        const player = new window.Vimeo.Player(iframe)
        playerRef.current = player

        // Configurar eventos
        player.on("loaded", () => {
          console.log("Vimeo player loaded")
          setPlayerReady(true)

          // Asegurar que el video esté inicialmente silenciado
          player.setVolume(0).catch(console.error)
        })

        return true
      } catch (error) {
        console.error("Error al inicializar el reproductor de Vimeo:", error)
        return false
      }
    }

    // Intentar inicializar el reproductor cuando el componente se monta
    let initialized = initializePlayer()

    // Si no se pudo inicializar, intentar de nuevo cuando el script se cargue
    if (!initialized) {
      const handleScriptLoad = () => {
        initialized = initializePlayer()
      }

      // Verificar si el script ya está cargado
      if (document.querySelector('script[src*="player.vimeo.com/api/player.js"]')) {
        handleScriptLoad()
      } else {
        // Si no está cargado, agregar un listener para cuando se cargue
        window.addEventListener("vimeoApiReady", handleScriptLoad)
      }

      return () => {
        window.removeEventListener("vimeoApiReady", handleScriptLoad)
      }
    }

    // Limpiar al desmontar
    return () => {
      if (playerRef.current) {
        playerRef.current.off("loaded")
      }
    }
  }, [playerId])

  const toggleMute = () => {
    const player = playerRef.current

    if (!player) {
      console.log("El reproductor no está disponible")
      return
    }

    if (isMuted) {
      player
        .setVolume(1)
        .then(() => {
          setIsMuted(false)
          console.log("Sonido activado")
        })
        .catch((error: any) => {
          console.error("Error al activar el sonido:", error)
        })
    } else {
      player
        .setVolume(0)
        .then(() => {
          setIsMuted(true)
          console.log("Sonido desactivado")
        })
        .catch((error: any) => {
          console.error("Error al desactivar el sonido:", error)
        })
    }
  }

  // Si el reproductor no está listo, mostrar un botón deshabilitado
  if (!playerReady) {
    return (
      <div
        ref={controlRef}
        className={`fixed bottom-8 right-8 z-50 transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <button
          disabled
          className="flex items-center justify-center w-12 h-12 rounded-full bg-bunker-900/50 backdrop-blur-sm border border-gold-500/20 opacity-50 cursor-not-allowed"
          aria-label={dictionary.soundControl?.unavailable || "Control de sonido no disponible"}
        >
          <VolumeX className="h-6 w-6 text-gold-400/50" />
        </button>
      </div>
    )
  }

  return (
    <div
      ref={controlRef}
      className={`fixed bottom-8 right-8 z-50 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <button
        onClick={toggleMute}
        className="flex items-center justify-center w-12 h-12 rounded-full bg-bunker-900/80 backdrop-blur-sm border border-gold-500/30 hover:bg-bunker-800 transition-all"
        aria-label={
          isMuted ? dictionary.soundControl?.unmute || "Activar sonido" : dictionary.soundControl?.mute || "Silenciar"
        }
      >
        {isMuted ? <VolumeX className="h-6 w-6 text-gold-400" /> : <Volume2 className="h-6 w-6 text-gold-400" />}
      </button>
    </div>
  )
}
