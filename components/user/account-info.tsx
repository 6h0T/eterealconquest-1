"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Mail, User, Shield } from "lucide-react"
import type { Locale } from "@/i18n/config"

interface UserAccountInfoProps {
  username: string
  lang: Locale
}

export function UserAccountInfo({ username, lang }: UserAccountInfoProps) {
  const [accountData, setAccountData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Traducciones específicas para la información de cuenta
  const translations = {
    es: {
      accountInfo: "Información de la Cuenta",
      username: "Nombre de usuario",
      email: "Correo electrónico",
      created: "Fecha de creación",
      status: "Estado de la cuenta",
      active: "Activa",
      blocked: "Bloqueada",
      loading: "Cargando información de la cuenta...",
      error: "Error al cargar la información de la cuenta",
      retry: "Reintentar",
    },
    en: {
      accountInfo: "Account Information",
      username: "Username",
      email: "Email address",
      created: "Creation date",
      status: "Account status",
      active: "Active",
      blocked: "Blocked",
      loading: "Loading account information...",
      error: "Error loading account information",
      retry: "Retry",
    },
    pt: {
      accountInfo: "Informações da Conta",
      username: "Nome de usuário",
      email: "Endereço de email",
      created: "Data de criação",
      status: "Status da conta",
      active: "Ativa",
      blocked: "Bloqueada",
      loading: "Carregando informações da conta...",
      error: "Erro ao carregar informações da conta",
      retry: "Tentar novamente",
    },
  }

  const t = translations[lang as keyof typeof translations]

  // Cargar datos de la cuenta
  useEffect(() => {
    const fetchAccountData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // En un entorno real, haríamos una petición a la API
        // Por ahora, simulamos los datos con la información almacenada en localStorage
        const email = localStorage.getItem("userEmail") || "usuario@ejemplo.com"
        const creationDate = new Date().toISOString()

        // Simular un retraso de red
        await new Promise((resolve) => setTimeout(resolve, 800))

        // Datos simulados
        const mockData = {
          memb___id: username,
          mail_addr: email,
          bloc_code: 0, // 0 = cuenta activa
          ctl1_code: 0,
          sno__numb: "S1",
          reg_date: creationDate,
          memb_name: username,
        }

        setAccountData(mockData)
      } catch (err: any) {
        console.error("Error fetching account data:", err)
        setError(err.message || "Error desconocido")
      } finally {
        setIsLoading(false)
      }
    }

    if (username) {
      fetchAccountData()
    }
  }, [username])

  // Renderizar estado de carga
  if (isLoading) {
    return (
      <Card className="bg-bunker-800/90 backdrop-blur-sm border border-gold-700/30">
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-400 mb-4"></div>
            <p className="text-gold-300">{t.loading}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Renderizar estado de error
  if (error) {
    return (
      <Card className="bg-bunker-800/90 backdrop-blur-sm border border-gold-700/30">
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-red-500 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <p className="text-red-400 mb-4">{t.error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-bunker-700 text-gold-400 rounded-md hover:bg-bunker-600 transition-colors"
            >
              {t.retry}
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-bunker-800/90 backdrop-blur-sm border border-gold-700/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-gold-400 flex items-center text-2xl">
            <User className="h-6 w-6 mr-2" />
            {t.accountInfo}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-bunker-950/50 p-4 rounded-lg border border-gold-700/20">
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center mr-3 flex-shrink-0">
                  <User className="h-5 w-5 text-gold-400" />
                </div>
                <div>
                  <p className="text-gold-400 text-sm font-semibold">{t.username}</p>
                  <p className="text-gold-100 font-medium text-lg">{accountData?.memb___id}</p>
                </div>
              </div>
            </div>

            <div className="bg-bunker-950/50 p-4 rounded-lg border border-gold-700/20">
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center mr-3 flex-shrink-0">
                  <Mail className="h-5 w-5 text-gold-400" />
                </div>
                <div>
                  <p className="text-gold-400 text-sm font-semibold">{t.email}</p>
                  <p className="text-gold-100 font-medium text-lg">{accountData?.mail_addr}</p>
                </div>
              </div>
            </div>

            <div className="bg-bunker-950/50 p-4 rounded-lg border border-gold-700/20">
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center mr-3 flex-shrink-0">
                  <Shield className="h-5 w-5 text-gold-400" />
                </div>
                <div>
                  <p className="text-gold-400 text-sm font-semibold">{t.status}</p>
                  <p className="text-green-400 font-medium text-lg flex items-center">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-2 inline-block"></span>
                    {t.active}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-gold-500/10 rounded-lg p-4 border border-gold-600/20">
            <h3 className="text-gold-300 font-semibold mb-2">Información importante</h3>
            <p className="text-gold-100 text-sm">
              Bienvenido a tu panel de usuario de ETEREALCONQUEST. Aquí podrás administrar tus personajes, cambiar tu
              contraseña y configurar tu cuenta. Si encuentras algún problema, no dudes en contactar a nuestro equipo de
              soporte.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
