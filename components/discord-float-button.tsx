"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import type { Locale } from "@/i18n/config"

interface DiscordFloatButtonProps {
  lang: Locale
}

export function DiscordFloatButton({ lang }: DiscordFloatButtonProps) {
  const [isVisible, setIsVisible] = useState(false)

  // Traducciones para el texto del botón
  const translations = {
    es: "Únete a nuestra comunidad",
    en: "Join our community", 
    pt: "Junte-se à nossa comunidade"
  }

  const text = translations[lang] || translations.es

  // Mostrar el botón después de un pequeño delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed bottom-6 right-6 z-50 hidden lg:block"
    >
      <motion.a
        href="https://discord.com/invite/2pF7h7uvRU"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex flex-col items-center gap-2"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Texto arriba */}
        <span className="text-white font-medium text-sm whitespace-nowrap bg-black/70 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {text}
        </span>
        
        {/* Imagen de Discord con efecto glow */}
        <div className="relative">
          {/* Efecto glow dorado detrás de la imagen */}
          <div className="absolute inset-0 bg-yellow-400 opacity-30 blur-md group-hover:opacity-50 transition-opacity duration-300 rounded-full"></div>
          
          {/* Imagen PNG */}
          <img
            src="https://i.imgur.com/rUD4A6Q.png"
            alt="Discord"
            className="relative z-10 w-24 h-24 object-contain cursor-pointer transition-all duration-300 group-hover:drop-shadow-lg"
          />
        </div>
      </motion.a>
    </motion.div>
  )
} 