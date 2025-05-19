"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface EpicCardProps {
  title: string
  content?: React.ReactNode
  icon?: React.ReactNode
  className?: string
  videoSrc?: string
  size?: "normal" | "large"
  children?: React.ReactNode
}

export function EpicCard({ title, content, icon, className, videoSrc, size = "normal", children }: EpicCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Manejar la reproducción del video en hover
  useEffect(() => {
    if (videoRef.current) {
      if (isHovered) {
        videoRef.current.play().catch((err) => console.error("Error playing video:", err))
      } else {
        videoRef.current.pause()
        videoRef.current.currentTime = 0
      }
    }
  }, [isHovered])

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-500 epic-card",
        "bg-bunker-900/80 border-gold-600/30 backdrop-blur-sm",
        "before:absolute before:inset-0 before:border before:border-gold-500/20 before:rounded-lg",
        "after:absolute after:inset-0 after:border-2 after:border-gold-400/10 after:rounded-lg after:m-[1px]",
        "hover:border-gold-400/50 hover:shadow-[0_0_15px_rgba(212,175,55,0.3)]",
        "",
        size === "large" ? "md:col-span-2" : "",
        className,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Video de fondo en hover */}
      {videoSrc && (
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <div
            className="absolute inset-0 bg-bunker-950/80 z-10 transition-opacity duration-500"
            style={{ opacity: isHovered ? 0.5 : 1 }}
          ></div>
          <video
            ref={videoRef}
            src={videoSrc}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              opacity: isHovered ? 1 : 0,
              transition: "opacity 0.5s ease-in-out",
            }}
            muted
            loop
            playsInline
          />
        </div>
      )}

      {/* Efecto de brillo en los bordes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-700">
          <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-gold-400/20 via-gold-300/5 to-gold-400/20 blur-sm"></div>
        </div>
      </div>

      {/* Contenido de la tarjeta */}
      <CardContent
        className={cn("p-6 flex flex-col relative z-20", size === "large" ? "pb-2" : "items-center text-center")}
      >
        {children ? (
          children
        ) : (
          <>
            {icon && (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-500/30 to-gold-700/10 flex items-center justify-center mb-4 shadow-[0_0_10px_rgba(212,175,55,0.2)]">
                {icon}
              </div>
            )}
            <h3 className="text-xl font-bold text-gold-300 mb-2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">{title}</h3>
            {content && <div className="text-gold-100/90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">{content}</div>}
          </>
        )}
      </CardContent>
    </Card>
  )
}
