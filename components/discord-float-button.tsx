"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import type { Locale } from "@/i18n/config"

interface DiscordFloatButtonProps {
  lang: Locale
}

export function DiscordFloatButton({ lang }: DiscordFloatButtonProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isHeroInView, setIsHeroInView] = useState(true) // Inicialmente el hero está en vista

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

  // Intersection Observer para detectar cuando el hero sale del viewport
  useEffect(() => {
    const heroSection = document.getElementById('hero-section')
    
    if (!heroSection) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeroInView(entry.isIntersecting)
      },
      {
        rootMargin: '0px',
        threshold: 0.7 // El botón cambia cuando solo el 70% del hero está visible (30% ya salió)
      }
    )

    observer.observe(heroSection)

    return () => {
      observer.disconnect()
    }
  }, [])

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        y: 0
      }}
      transition={{ 
        duration: 0.5, 
        ease: "easeOut"
      }}
      className={`fixed z-50 ${
        isHeroInView 
          ? "bottom-4 right-20" // 25% más abajo que la posición anterior
          : "bottom-4 right-6"   // Posición flotante cuando hero no está visible
      } hidden lg:block`}
      style={{
        transition: 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)' // Transición suave ease-out personalizada
      }}
    >
      <motion.a
        href="https://discord.gg/2NTgd7837a"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex flex-col items-center gap-2"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          scale: isHeroInView ? 0.9 : 1,
        }}
        transition={{ 
          duration: 0.4,
          ease: "easeOut" 
        }}
      >
        {/* Texto arriba */}
        <motion.span 
          className="text-white font-medium text-sm whitespace-nowrap bg-black/70 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          animate={{
            // El texto aparece diferente según la posición
            fontSize: isHeroInView ? "0.8rem" : "0.875rem"
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {text}
        </motion.span>
        
        {/* Imagen de Discord con efecto glow */}
        <div className="relative">
          {/* Efecto glow dorado detrás de la imagen */}
          <motion.div 
            className="absolute inset-0 bg-yellow-400 opacity-30 blur-md group-hover:opacity-50 transition-opacity duration-300 rounded-full"
            animate={{
              opacity: isHeroInView ? 0.2 : 0.3, // Menos glow cuando está al lado del botón de mutear
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
          
          {/* Imagen PNG */}
          <motion.img
            src="https://i.imgur.com/rUD4A6Q.png"
            alt="Discord"
            className="relative z-10 object-contain cursor-pointer transition-all duration-300 group-hover:drop-shadow-lg"
            animate={{
              width: isHeroInView ? 80 : 96,  // w-20 vs w-24
              height: isHeroInView ? 80 : 96  // h-20 vs h-24
            }}
            transition={{ 
              duration: 0.4, 
              ease: "easeOut" 
            }}
          />
        </div>
      </motion.a>
    </motion.div>
  )
} 
