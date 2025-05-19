"use client"

import { useState, useEffect } from "react"
import { getDictionary } from "@/i18n/config"
import type { Locale } from "@/i18n/config"
import { LoginForm } from "@/components/login-form"
import { VimeoBackground } from "@/components/vimeo-background"
import { motion } from "framer-motion"

interface LoginPageClientProps {
  lang: Locale
}

export function LoginPageClient({ lang }: LoginPageClientProps) {
  const [dictionary, setDictionary] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)

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

  // Traducciones específicas para la página de inicio de sesión
  const translations = {
    es: {
      title: "Iniciar Sesión",
      subtitle: "Accede a tu cuenta de ETEREALCONQUEST",
    },
    en: {
      title: "Sign In",
      subtitle: "Access your ETEREALCONQUEST account",
    },
    pt: {
      title: "Entrar",
      subtitle: "Acesse sua conta ETEREALCONQUEST",
    },
  }

  if (isLoading) {
    return (
      <div className="pt-32 pb-8 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex items-center justify-center">
          <div className="max-w-md mx-auto w-full">
            <div className="text-center mb-6">
              <div className="h-10 w-64 bg-bunker-800 animate-pulse mx-auto rounded-md"></div>
              <div className="h-6 w-96 bg-bunker-800 animate-pulse mx-auto mt-4 rounded-md"></div>
            </div>
            <div className="bg-bunker-800 animate-pulse h-80 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="pt-32 pb-8 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeIn" }}
    >
      {/* Fondo con video de Vimeo */}
      <VimeoBackground videoId="1074465089" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex items-center justify-center">
        <motion.div
          className="max-w-md mx-auto w-full"
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

          {/* Formulario de inicio de sesión */}
          <LoginForm lang={lang} />
        </motion.div>
      </div>
    </motion.div>
  )
}
