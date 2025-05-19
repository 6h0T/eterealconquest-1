"use client"

import { useState, useEffect } from "react"
import { RankingsTabs } from "@/components/rankings-tabs"
import { SectionDivider } from "@/components/section-divider"
import { VimeoBackground } from "@/components/vimeo-background"
import type { Locale } from "@/i18n/config"
import { motion, AnimatePresence } from "framer-motion"

export default function RankingsPage({ params }: { params: { lang: Locale } }) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Establecer isLoaded a true después de un breve retraso para activar la animación
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <div className="pt-20 pb-16 relative overflow-visible min-h-screen">
        {/* Fondo con video de Vimeo */}
        <VimeoBackground videoId="1074464598" fallbackId="1074465089" />

        <AnimatePresence mode="wait">
          <motion.div
            key="rankings-content"
            className="container max-w-5xl mx-auto px-4 sm:px-6 relative z-20"
            initial={{ opacity: 0 }}
            animate={{
              opacity: isLoaded ? 1 : 0,
              y: isLoaded ? 0 : 20,
            }}
            transition={{
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-4xl font-bold gold-gradient-text mb-4">Rankings</h1>
              <p className="text-xl text-gold-100 max-w-3xl mx-auto">
                Descubre quiénes son los mejores jugadores de ETEREALCONQUEST
              </p>
            </div>

            <RankingsTabs />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Divisor entre el contenido y el footer */}
      <SectionDivider />
    </>
  )
}
