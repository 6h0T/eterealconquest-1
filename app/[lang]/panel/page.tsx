"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getDictionary } from "@/i18n/config"
import type { Locale } from "@/i18n/config"
import { VimeoBackground } from "@/components/vimeo-background"
import { SectionDivider } from "@/components/section-divider"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import { UserAccountInfo } from "@/components/user/account-info"
import { UserCharacters } from "@/components/user/characters"
import { UserSettings } from "@/components/user/settings"
import { UserDonation } from "@/components/user/donation"
import { Shield, User, Settings, Gift } from "lucide-react"

export default function UserPanelPage({ params }: { params: { lang: Locale } }) {
  const [dictionary, setDictionary] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState("")
  const router = useRouter()
  const lang = params.lang as Locale

  // Cargar el diccionario
  useEffect(() => {
    const loadDictionary = async () => {
      setIsLoading(true)
      try {
        const dict = await getDictionary(lang as any)
        setDictionary(dict)
      } catch (error) {
        console.error("Error loading dictionary:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDictionary()
  }, [lang])

  // Verificar autenticación
  useEffect(() => {
    const storedUsername = localStorage.getItem("username")
    const isAuth = localStorage.getItem("isAuthenticated")
    const lastLogin = localStorage.getItem("lastLogin")

    // Verificar si hay información de sesión válida
    if (storedUsername && isAuth === "true") {
      setIsAuthenticated(true)
      setUsername(storedUsername)
      console.log("Usuario autenticado:", storedUsername)

      // Si hay una fecha de último login, registrarla para análisis
      if (lastLogin) {
        console.log("Último inicio de sesión:", new Date(lastLogin).toLocaleString())
      }
    } else {
      console.log("Usuario no autenticado, redirigiendo a inicio de sesión")
      // Usar replace en lugar de push para evitar problemas con el historial
      router.replace(`/${lang}/inicio-sesion?redirect=panel`)
    }
  }, [router, lang])

  // Traducciones específicas para el panel de usuario
  const translations = {
    es: {
      title: "Panel de Usuario",
      subtitle: "Gestiona tu cuenta y personajes de ETEREALCONQUEST",
      account: "Cuenta",
      characters: "Personajes",
      donation: "Donación",
      settings: "Configuración",
      loading: "Cargando...",
      notAuthenticated: "No has iniciado sesión. Redirigiendo...",
    },
    en: {
      title: "User Panel",
      subtitle: "Manage your ETEREALCONQUEST account and characters",
      account: "Account",
      characters: "Characters",
      donation: "Donation",
      settings: "Settings",
      loading: "Loading...",
      notAuthenticated: "You are not logged in. Redirecting...",
    },
    pt: {
      title: "Painel do Usuário",
      subtitle: "Gerencie sua conta e personagens do ETEREALCONQUEST",
      account: "Conta",
      characters: "Configurações",
      donation: "Doação",
      settings: "Configurações",
      loading: "Carregando...",
      notAuthenticated: "Você não está logado. Redirecionando...",
    },
  }

  const t = isLoading ? translations.es : translations[lang as keyof typeof translations]

  // Variantes para animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  }

  if (isLoading) {
    return (
      <div className="pt-20 pb-16 relative overflow-visible min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse h-10 w-64 bg-bunker-800 rounded-md mx-auto mb-8"></div>
          <div className="animate-pulse h-96 bg-bunker-800 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="pt-20 pb-16 relative overflow-visible min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gold-300">{t.notAuthenticated}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-20 pb-16 relative overflow-visible min-h-screen">
      {/* Fondo con video de Vimeo */}
      <VimeoBackground videoId="1074464598" fallbackId="1074465089" />

      <motion.div
        className="container max-w-6xl mx-auto px-4 sm:px-6 relative z-20"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div className="text-center mb-10" variants={itemVariants}>
          <h1 className="text-4xl md:text-5xl font-bold gold-gradient-text mb-4">{t.title}</h1>
          <p className="text-xl text-gold-100 max-w-3xl mx-auto mb-2">{t.subtitle}</p>
          <p className="text-gold-400">
            <span className="text-green-400 font-medium flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2 inline-block"></span>
              Bienvenido, <span className="font-bold text-gold-300 mx-1">{username}</span>
            </span>
          </p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Tabs defaultValue="characters" className="w-full">
            <TabsList className="h-16 items-center justify-center bg-transparent grid grid-cols-4 overflow-hidden rounded-lg mb-8 shadow-lg shadow-bunker-900/50 border border-gold-700/30 gap-2 p-2">
              <TabsTrigger
                value="characters"
                className="relative inline-flex items-center justify-center gap-2 h-full px-4 overflow-hidden font-medium transition-all rounded-md font-trade-winds border border-gold-700/30
                data-[state=active]:!bg-[#ffd70030] data-[state=active]:!text-gold-300 data-[state=active]:border-gold-500
                data-[state=inactive]:bg-transparent data-[state=inactive]:text-gold-400 data-[state=inactive]:hover:bg-bunker-700/50 data-[state=inactive]:hover:text-gold-300
                focus-visible:outline-none focus-visible:ring-0 dark:focus-visible:ring-0 dark:data-[state=active]:!bg-[#ffd70030]"
              >
                <Shield className="h-5 w-5" />
                <span className="font-medium">{t.characters}</span>
              </TabsTrigger>
              <TabsTrigger
                value="account"
                className="relative inline-flex items-center justify-center gap-2 h-full px-4 overflow-hidden font-medium transition-all rounded-md font-trade-winds border border-gold-700/30
                data-[state=active]:!bg-[#ffd70030] data-[state=active]:!text-gold-300 data-[state=active]:border-gold-500
                data-[state=inactive]:bg-transparent data-[state=inactive]:text-gold-400 data-[state=inactive]:hover:bg-bunker-700/50 data-[state=inactive]:hover:text-gold-300
                focus-visible:outline-none focus-visible:ring-0 dark:focus-visible:ring-0 dark:data-[state=active]:!bg-[#ffd70030]"
              >
                <User className="h-5 w-5" />
                <span className="font-medium">{t.account}</span>
              </TabsTrigger>
              <TabsTrigger
                value="donation"
                className="bg-red-600 text-white data-[state=active]:bg-red-700 data-[state=active]:text-white data-[state=inactive]:bg-red-600 flex items-center justify-center gap-2 h-full px-4 rounded-md font-trade-winds border border-red-400/30
                focus-visible:outline-none focus-visible:ring-0"
              >
                <Gift className="h-5 w-5" />
                <span className="font-medium">{t.donation}</span>
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="relative inline-flex items-center justify-center gap-2 h-full px-4 overflow-hidden font-medium transition-all rounded-md font-trade-winds border border-gold-700/30
                data-[state=active]:!bg-[#ffd70030] data-[state=active]:!text-gold-300 data-[state=active]:border-gold-500
                data-[state=inactive]:bg-transparent data-[state=inactive]:text-gold-400 data-[state=inactive]:hover:bg-bunker-700/50 data-[state=inactive]:hover:text-gold-300
                focus-visible:outline-none focus-visible:ring-0 dark:focus-visible:ring-0 dark:data-[state=active]:!bg-[#ffd70030]"
              >
                <Settings className="h-5 w-5" />
                <span className="font-medium">{t.settings}</span>
              </TabsTrigger>
            </TabsList>

            <div className="bg-bunker-900/30 backdrop-blur-sm p-1 rounded-xl border border-gold-700/20 shadow-xl">
              <TabsContent value="characters" className="p-4">
                <UserCharacters username={username} lang={lang} />
              </TabsContent>

              <TabsContent value="account" className="p-4">
                <UserAccountInfo username={username} lang={lang} />
              </TabsContent>

              <TabsContent value="donation" className="p-4">
                <UserDonation username={username} lang={lang} />
              </TabsContent>

              <TabsContent value="settings" className="p-4">
                <UserSettings username={username} lang={lang} />
              </TabsContent>
            </div>
          </Tabs>
        </motion.div>
      </motion.div>

      {/* Divisor al final de la página */}
      <SectionDivider />
    </div>
  )
}
