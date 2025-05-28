"use client"

import { useState, useEffect } from "react"
import { getDictionary } from "@/i18n/config"
import type { Locale } from "@/i18n/config"
import { RegistroForm } from "@/components/registro-form"
import { VimeoBackground } from "@/components/vimeo-background"
import { motion } from "framer-motion"
// import type { PageProps } from "next"

// export default function RegistroPage({ params }: PageProps) {
export default function RegistroPage({ params }: { params: { lang: Locale } }) {
  const [dictionary, setDictionary] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)
  const lang = params.lang as Locale

  // Cargar el diccionario
  useEffect(() => {
    const loadDictionary = async () => {
      setIsLoading(true)
      try {
        const dict = await getDictionary(lang)
        setDictionary(dict)
        setIsLoading(false)
      } catch (error) {
        console.error("Error loading dictionary:", error)
        setIsLoading(false)
      }
    }

    loadDictionary()
  }, [lang])

  // Traducciones específicas para la página de registro
  const translations = {
    es: {
      title: "Registro de Cuenta",
      subtitle: "Únete a ETEREALCONQUEST y comienza tu aventura",
    },
    en: {
      title: "Account Registration",
      subtitle: "Join ETEREALCONQUEST and start your adventure",
    },
    pt: {
      title: "Registro de Conta",
      subtitle: "Junte-se ao ETEREALCONQUEST e comece sua aventura",
    },
  }

  if (isLoading) {
    return (
      <main className="min-h-screen pt-32 pb-8 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex items-center justify-center min-h-[calc(100vh-8rem)]">
          <div className="max-w-3xl mx-auto w-full">
            <div className="text-center mb-6">
              <div className="h-10 w-64 bg-bunker-800 animate-pulse mx-auto rounded-md"></div>
              <div className="h-6 w-96 bg-bunker-800 animate-pulse mx-auto mt-4 rounded-md"></div>
            </div>
            <div className="bg-bunker-800 animate-pulse h-96 rounded-lg"></div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      <motion.div
        className="pt-32 pb-8 relative overflow-hidden min-h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeIn" }}
      >
        {/* Fondo con video de Vimeo */}
        <VimeoBackground videoId="1074465089" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex items-center justify-center min-h-[calc(100vh-8rem)]">
          <motion.div
            className="max-w-3xl mx-auto w-full"
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
          >
            <div className="text-center mb-6">
              <h1 className="text-3xl md:text-4xl font-bold gold-gradient-text mb-2">
                {translations[lang as keyof typeof translations].title}
              </h1>
              <p className="text-lg text-gold-100">{translations[lang as keyof typeof translations].subtitle}</p>
            </div>

            {/* Formulario de registro */}
            <RegistroForm lang={lang} />
          </motion.div>
        </div>
      </motion.div>
    </main>
  )
}
