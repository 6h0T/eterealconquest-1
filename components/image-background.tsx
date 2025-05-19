"use client"

import { useEffect, useState } from "react"

interface ImageBackgroundProps {
  imageSrc: string
  className?: string
  overlayOpacity?: number
}

export function ImageBackground({ imageSrc, className = "", overlayOpacity = 0.6 }: ImageBackgroundProps) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    // Precargar la imagen para evitar parpadeos
    const img = new Image()
    img.src = imageSrc
    img.onload = () => {
      setLoaded(true)
    }
    img.onerror = () => {
      // En caso de error, también marcamos como cargado para evitar bloqueos
      console.error("Error loading background image:", imageSrc)
      setLoaded(true)
    }

    return () => {
      // Limpiar los event listeners para evitar memory leaks
      img.onload = null
      img.onerror = null
    }
  }, [imageSrc])

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Overlay con opacidad configurable */}
      <div className="absolute inset-0 bg-bunker-950 z-10" style={{ opacity: overlayOpacity }}></div>

      {/* Contenedor de la imagen */}
      <div className="absolute inset-0 w-full h-full z-0">
        <div
          className={`w-full h-full transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
          style={{
            backgroundImage: `url(${imageSrc})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            transform: "scale(1.2)", // Aplicar zoom del 20%
          }}
        />
      </div>
    </div>
  )
}
