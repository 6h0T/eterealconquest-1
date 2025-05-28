"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Locale } from "@/i18n/config"

interface ServerInfoCarouselProps {
  lang: Locale
}

export default function ServerInfoCarousel({ lang }: ServerInfoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  // Información del servidor traducida
  const getServerInfo = () => {
    if (lang === "es") {
      return [
        {
          title: "Información General",
          content: [
            "🎮 Versión: Season 6 Episode 3",
            "⚡ Experiencia: 9999x",
            "💰 Drop: 80%",
            "🏆 Zen: 60%",
            "🔥 Máximo Reset: 50",
            "⭐ Máximo Grand Reset: 20",
            "🎯 Máximo Nivel: 400",
            "💎 Máximo Stats: 32.767"
          ]
        },
        {
          title: "Sistema de Resets",
          content: [
            "🔄 Reset disponible desde nivel 400",
            "📈 Cada reset otorga puntos adicionales",
            "🌟 Grand Reset disponible tras 50 resets",
            "💪 Bonificaciones especiales por Grand Reset",
            "🎁 Recompensas exclusivas por milestone",
            "⚔️ Acceso a contenido de alto nivel",
            "🏅 Títulos especiales por logros",
            "🔮 Items únicos por progresión"
          ]
        },
        {
          title: "Sistema PvP",
          content: [
            "⚔️ PvP balanceado y competitivo",
            "🏟️ Eventos PvP regulares",
            "🏆 Rankings y torneos",
            "💀 Sistema de duelos mejorado",
            "🛡️ Anti-hack y anti-cheat activo",
            "🎯 Zonas PvP especializadas",
            "👑 Recompensas por victorias",
            "🔥 Sistema de guilds avanzado"
          ]
        },
        {
          title: "Características Especiales",
          content: [
            "🎨 Motor gráfico modernizado",
            "🔧 Sistema de rareza de items",
            "🏰 Dungeons exclusivos",
            "🎪 Eventos automáticos",
            "💳 Sistema WCoins integrado",
            "📱 Panel web completo",
            "🔒 Seguridad avanzada",
            "🌐 Soporte multiidioma"
          ]
        },
        {
          title: "Economía del Servidor",
          content: [
            "💰 Economía balanceada y estable",
            "🏪 Sistema de comercio seguro",
            "💎 WCoins para items premium",
            "🎁 Eventos con recompensas",
            "📊 Market dinámico",
            "🔄 Sistema de intercambio",
            "💸 Sin pay-to-win",
            "⚖️ Precios equilibrados"
          ]
        }
      ]
    } else if (lang === "en") {
      return [
        {
          title: "General Information",
          content: [
            "🎮 Version: Season 6 Episode 3",
            "⚡ Experience: 9999x",
            "💰 Drop: 80%",
            "🏆 Zen: 60%",
            "🔥 Maximum Reset: 50",
            "⭐ Maximum Grand Reset: 20",
            "🎯 Maximum Level: 400",
            "💎 Maximum Stats: 32,767"
          ]
        },
        {
          title: "Reset System",
          content: [
            "🔄 Reset available from level 400",
            "📈 Each reset grants additional points",
            "🌟 Grand Reset available after 50 resets",
            "💪 Special bonuses per Grand Reset",
            "🎁 Exclusive milestone rewards",
            "⚔️ Access to high-level content",
            "🏅 Special titles for achievements",
            "🔮 Unique items through progression"
          ]
        },
        {
          title: "PvP System",
          content: [
            "⚔️ Balanced and competitive PvP",
            "🏟️ Regular PvP events",
            "🏆 Rankings and tournaments",
            "💀 Enhanced duel system",
            "🛡️ Active anti-hack and anti-cheat",
            "🎯 Specialized PvP zones",
            "👑 Victory rewards",
            "🔥 Advanced guild system"
          ]
        },
        {
          title: "Special Features",
          content: [
            "🎨 Modernized graphic engine",
            "🔧 Item rarity system",
            "🏰 Exclusive dungeons",
            "🎪 Automatic events",
            "💳 Integrated WCoins system",
            "📱 Complete web panel",
            "🔒 Advanced security",
            "🌐 Multi-language support"
          ]
        },
        {
          title: "Server Economy",
          content: [
            "💰 Balanced and stable economy",
            "🏪 Secure trading system",
            "💎 WCoins for premium items",
            "🎁 Events with rewards",
            "📊 Dynamic market",
            "🔄 Exchange system",
            "💸 No pay-to-win",
            "⚖️ Balanced prices"
          ]
        }
      ]
    } else { // pt
      return [
        {
          title: "Informações Gerais",
          content: [
            "🎮 Versão: Season 6 Episode 3",
            "⚡ Experiência: 9999x",
            "💰 Drop: 80%",
            "🏆 Zen: 60%",
            "🔥 Reset Máximo: 50",
            "⭐ Grand Reset Máximo: 20",
            "🎯 Nível Máximo: 400",
            "💎 Stats Máximos: 32.767"
          ]
        },
        {
          title: "Sistema de Reset",
          content: [
            "🔄 Reset disponível a partir do nível 400",
            "📈 Cada reset concede pontos adicionais",
            "🌟 Grand Reset disponível após 50 resets",
            "💪 Bônus especiais por Grand Reset",
            "🎁 Recompensas exclusivas por marco",
            "⚔️ Acesso a conteúdo de alto nível",
            "🏅 Títulos especiais por conquistas",
            "🔮 Itens únicos por progressão"
          ]
        },
        {
          title: "Sistema PvP",
          content: [
            "⚔️ PvP balanceado e competitivo",
            "🏟️ Eventos PvP regulares",
            "🏆 Rankings e torneios",
            "💀 Sistema de duelos aprimorado",
            "🛡️ Anti-hack e anti-cheat ativo",
            "🎯 Zonas PvP especializadas",
            "👑 Recompensas por vitórias",
            "🔥 Sistema de guildas avançado"
          ]
        },
        {
          title: "Características Especiais",
          content: [
            "🎨 Motor gráfico modernizado",
            "🔧 Sistema de raridade de itens",
            "🏰 Dungeons exclusivas",
            "🎪 Eventos automáticos",
            "💳 Sistema WCoins integrado",
            "📱 Painel web completo",
            "🔒 Segurança avançada",
            "🌐 Suporte multi-idioma"
          ]
        },
        {
          title: "Economia do Servidor",
          content: [
            "💰 Economia balanceada e estável",
            "🏪 Sistema de comércio seguro",
            "💎 WCoins para itens premium",
            "🎁 Eventos com recompensas",
            "📊 Mercado dinâmico",
            "🔄 Sistema de troca",
            "💸 Sem pay-to-win",
            "⚖️ Preços equilibrados"
          ]
        }
      ]
    }
  }

  const serverInfo = getServerInfo()

  const nextSlide = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex((prev) => (prev + 1) % serverInfo.length)
    setTimeout(() => setIsAnimating(false), 500)
  }

  const prevSlide = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex((prev) => (prev - 1 + serverInfo.length) % serverInfo.length)
    setTimeout(() => setIsAnimating(false), 500)
  }

  // Auto-advance slides
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isAnimating) {
        nextSlide()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [isAnimating])

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Flechas de navegación a los lados */}
      <button
        onClick={prevSlide}
        disabled={isAnimating}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 z-20 p-3 bg-bunker-700/80 hover:bg-bunker-600/80 text-gold-400 rounded-full transition-colors disabled:opacity-50 -translate-x-4"
      >
        <ChevronLeft size={20} />
      </button>
      
      <button
        onClick={nextSlide}
        disabled={isAnimating}
        className="absolute right-0 top-1/2 transform -translate-y-1/2 z-20 p-3 bg-bunker-700/80 hover:bg-bunker-600/80 text-gold-400 rounded-full transition-colors disabled:opacity-50 translate-x-4"
      >
        <ChevronRight size={20} />
      </button>

      {/* Contenedor principal del carrusel */}
      <div className="relative bg-bunker-800/90 backdrop-blur-sm border border-gold-700/30 rounded-lg overflow-hidden min-h-[400px]">
        {/* Contenido */}
        <div className="p-4 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="text-center"
            >
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold gold-gradient-text mb-6 md:mb-8">
                {serverInfo[currentIndex].title}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 max-w-3xl mx-auto">
                {serverInfo[currentIndex].content.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center text-left p-2 md:p-3 bg-bunker-700/50 rounded-lg border border-gold-700/20 hover:border-gold-700/40 transition-colors"
                  >
                    <span className="text-gold-100 text-xs md:text-sm lg:text-base font-medium">
                      {item}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Indicadores fuera del carrusel */}
      <div className="flex justify-center mt-4 gap-2">
        {serverInfo.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (!isAnimating) {
                setIsAnimating(true)
                setCurrentIndex(index)
                setTimeout(() => setIsAnimating(false), 500)
              }
            }}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentIndex ? "bg-gold-400" : "bg-bunker-600 hover:bg-bunker-500"
            }`}
          />
        ))}
      </div>
    </div>
  )
} 