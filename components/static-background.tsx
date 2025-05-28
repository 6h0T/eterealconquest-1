import Image from "next/image"

interface StaticBackgroundProps {
  imagePath?: string
  overlayOpacity?: number
  className?: string
}

export function StaticBackground({
  imagePath = "https://i.imgur.com/MrDWSAr.jpeg",
  overlayOpacity = 0.6,
  className = "",
}: StaticBackgroundProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Imagen de fondo */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Image
          src={imagePath}
          alt="Background"
          fill
          className="object-cover"
          priority
          quality={100}
        />
      </div>
      
      {/* Overlay con opacidad configurable */}
      <div className="absolute inset-0 bg-bunker-950 z-10" style={{ opacity: overlayOpacity }}></div>
    </div>
  )
} 