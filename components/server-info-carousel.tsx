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
            "🎮 Versión: Season 6",
            "⚡ Experiencia: 10x (Dinámica)",
            "💰 Drop: 30%",
            "🏆 Zen: Low",
            "🔥 Tipo de Servidor: No Reset",
            "🎯 Nivel máximo: 400",
            "💎 Cuentas máximas por PC: 5"
          ]
        },
        {
          title: "Características Especiales en Etereal Mu!",
          content: [
            "⚡ Motor gráfico actualizado, fluidez única!",
            "🎨 Interfaz modernizada",
            "🌍 Sistema multilenguaje 100% funcional en Español, Inglés, Portugués.",
            "💎 Nuevo sistema de rareza en items (Legendary, Epic, Rare, Uncommon)",
            "🏰 Nuevo sistema de Dungeons",
            "🗺️ Nuevo continente",
            "🚁 Sistema de Dirigibles exclusivo para descubrir nuevos continentes"
          ]
        },
        {
          title: "Sistema PvP",
          content: [
            "⚔️ Nuevo evento PvP Battlegrounds",
            "🏆 Sistema de clasificaciones según tus resultados en eventos!",
            "✨ Habilidades mejoradas y modificadas en todas las razas",
            "🛡️ Antihack y anticheat no invasivo",
            "🎯 Torneos organizados por la comunidad",
            "🏰 Castle Siege con características únicas",
            "🎯 Dummys distribuidos en ciudades principales"
          ]
        },
        {
          title: "Economía del servidor",
          content: [
            "🚫 Sin Pay 2 Win, solo podrás adquirir consumibles",
            "🏪 Nueva casa de subastas con características avanzadas",
            "💰 Comercio de WCoin disponible entre usuarios",
            "👹 Tienda de Goblin Points con consumibles únicos",
            "🎮 Obtén Goblin Points participando en eventos",
            "📈 Recibe recompensas progresivas y escalables",
            "🏛️ Recibe recompensas por participación en eventos de Guild"
          ]
        }
      ]
    } else if (lang === "en") {
      return [
        {
          title: "General Information",
          content: [
            "🎮 Version: Season 6",
            "⚡ Experience: 10x (Dynamic)",
            "💰 Drop: 30%",
            "🏆 Zen: Low",
            "🔥 Server Type: No Reset",
            "🎯 Max Level: 400",
            "💎 Max Accounts per PC: 5"
          ]
        },
        {
          title: "Special Features in Etereal Mu!",
          content: [
            "⚡ Updated graphics engine, unique fluidity!",
            "🎨 Modernized interface",
            "🌍 100% functional multilanguage system in Spanish, English, Portuguese.",
            "💎 New item rarity system (Legendary, Epic, Rare, Uncommon)",
            "🏰 New Dungeons system",
            "🗺️ New continent",
            "🚁 Exclusive Airship system to discover new continents"
          ]
        },
        {
          title: "PvP System",
          content: [
            "⚔️ New PvP Battlegrounds event",
            "🏆 Ranking system based on your event results!",
            "✨ Improved and modified skills for all races",
            "🛡️ Non-invasive antihack and anticheat",
            "🎯 Community-organized tournaments",
            "🏰 Castle Siege with unique features",
            "🎯 Dummies distributed in main cities"
          ]
        },
        {
          title: "Server Economy",
          content: [
            "🚫 No Pay 2 Win, you can only acquire consumables",
            "🏪 New auction house with advanced features",
            "💰 WCoin trading available between users",
            "👹 Goblin Points store with unique consumables",
            "🎮 Earn Goblin Points by participating in events",
            "📈 Receive progressive and scalable rewards",
            "🏛️ Receive rewards for participating in Guild events"
          ]
        }
      ]
    } else { // pt
      return [
        {
          title: "Informações Gerais",
          content: [
            "🎮 Versão: Season 6",
            "⚡ Experiência: 10x (Dinâmica)",
            "💰 Drop: 30%",
            "🏆 Zen: Low",
            "🔥 Tipo de Servidor: No Reset",
            "🎯 Nível máximo: 400",
            "💎 Contas máximas por PC: 5"
          ]
        },
        {
          title: "Características Especiais no Etereal Mu!",
          content: [
            "⚡ Motor gráfico atualizado, fluidez única!",
            "🎨 Interface modernizada",
            "🌍 Sistema multilíngue 100% funcional em Espanhol, Inglês, Português.",
            "💎 Novo sistema de raridade de itens (Legendary, Epic, Rare, Uncommon)",
            "🏰 Novo sistema de Dungeons",
            "🗺️ Novo continente",
            "🚁 Sistema de Dirigíveis exclusivo para descobrir novos continentes"
          ]
        },
        {
          title: "Sistema PvP",
          content: [
            "⚔️ Novo evento PvP Battlegrounds",
            "🏆 Sistema de classificações baseado nos seus resultados em eventos!",
            "✨ Habilidades melhoradas e modificadas em todas as raças",
            "🛡️ Antihack e anticheat não invasivo",
            "🎯 Torneios organizados pela comunidade",
            "🏰 Castle Siege com características únicas",
            "🎯 Dummies distribuídos nas cidades principais"
          ]
        },
        {
          title: "Economia do servidor",
          content: [
            "🚫 Sem Pay 2 Win, você só pode adquirir consumíveis",
            "🏪 Nova casa de leilões com características avançadas",
            "💰 Comércio de WCoin disponível entre usuários",
            "👹 Loja de Goblin Points com consumíveis únicos",
            "🎮 Ganhe Goblin Points participando de eventos",
            "📈 Receba recompensas progressivas e escaláveis",
            "🏛️ Receba recompensas por participação em eventos de Guild"
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