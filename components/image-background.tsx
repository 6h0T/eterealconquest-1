"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

interface ImageBackgroundProps {
  imagePath: string
  className?: string
  overlayOpacity?: number
}

export function ImageBackground({
  imagePath,
  className = "",
  overlayOpacity = 0.6,
}: ImageBackgroundProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} style={{ height: "100%" }}>
      {/* Overlay con opacidad configurable */}
      <div className="absolute inset-0 bg-bunker-950 z-10" style={{ opacity: overlayOpacity }}></div>

      {/* Contenedor de la imagen */}
      <div className="absolute inset-0 w-full h-full z-0">
        {isLoaded && (
          <Image
            src={imagePath}
            alt="Background"
            fill
            sizes="100vw"
            priority
            style={{
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
        )}
      </div>
    </div>
  )
}
