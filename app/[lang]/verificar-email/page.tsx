"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageBackground } from "@/components/image-background"

type VerificationState = "loading" | "success" | "error" | "invalid"

interface VerificationTexts {
  title: string
  verifying: string
  retrying: string
  success: {
    title: string
    description: string
    button: string
  }
  error: {
    title: string
    description: string
    button: string
  }
  invalid: {
    title: string
    description: string
    button: string
  }
}

const texts: Record<string, VerificationTexts> = {
  es: {
    title: "Verificación de Email",
    verifying: "Verificando tu cuenta...",
    retrying: "Reintentando verificación...",
    success: {
      title: "¡Cuenta Verificada!",
      description: "Tu cuenta ha sido verificada exitosamente. Ya puedes iniciar sesión.",
      button: "Ir al Inicio de Sesión"
    },
    error: {
      title: "Error de Verificación",
      description: "Hubo un problema al verificar tu cuenta. El enlace puede haber expirado o ser inválido.",
      button: "Volver al Registro"
    },
    invalid: {
      title: "Enlace Inválido",
      description: "El enlace de verificación no es válido o está mal formado.",
      button: "Volver al Inicio"
    }
  },
  en: {
    title: "Email Verification",
    verifying: "Verifying your account...",
    retrying: "Retrying verification...",
    success: {
      title: "Account Verified!",
      description: "Your account has been successfully verified. You can now log in.",
      button: "Go to Login"
    },
    error: {
      title: "Verification Error",
      description: "There was a problem verifying your account. The link may have expired or be invalid.",
      button: "Back to Registration"
    },
    invalid: {
      title: "Invalid Link",
      description: "The verification link is invalid or malformed.",
      button: "Back to Home"
    }
  },
  pt: {
    title: "Verificação de Email",
    verifying: "Verificando sua conta...",
    retrying: "Tentando verificação novamente...",
    success: {
      title: "Conta Verificada!",
      description: "Sua conta foi verificada com sucesso. Agora você pode fazer login.",
      button: "Ir para Login"
    },
    error: {
      title: "Erro de Verificação",
      description: "Houve um problema ao verificar sua conta. O link pode ter expirado ou ser inválido.",
      button: "Voltar ao Registro"
    },
    invalid: {
      title: "Link Inválido",
      description: "O link de verificação é inválido ou está mal formado.",
      button: "Voltar ao Início"
    }
  }
}

// Función para esperar con delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export default function VerificarEmailPage({ params }: { params: { lang: string } }) {
  const [state, setState] = useState<VerificationState>("loading")
  const [message, setMessage] = useState("")
  const [currentAttempt, setCurrentAttempt] = useState(1)
  const [maxAttempts] = useState(3)
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")
  
  const lang = params.lang || "es"
  const t = texts[lang] || texts.es

  // Función para verificar email con reintentos
  const verifyEmailWithRetry = async (token: string, attempt: number = 1): Promise<void> => {
    try {
      console.log(`[FRONTEND] Intento de verificación ${attempt}/${maxAttempts}`)
      setCurrentAttempt(attempt)
      
      const response = await fetch("/api/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      })

      console.log(`[FRONTEND] Respuesta intento ${attempt}:`, response.status, response.statusText)
      const data = await response.json()
      console.log(`[FRONTEND] Datos respuesta intento ${attempt}:`, data)

      if (response.ok && data.success) {
        console.log(`[FRONTEND] Verificación exitosa en intento ${attempt}`)
        setState("success")
        setMessage(data.message || "")
        // Redirigir al inicio de sesión después de 3 segundos
        setTimeout(() => {
          router.push(`/${lang}/inicio-sesion`)
        }, 3000)
        return
      } else {
        // Si es un error específico que no debe reintentarse, fallar inmediatamente
        if (data.error && (
          data.error.includes("expirado") || 
          data.error.includes("expired") ||
          data.error.includes("inválido") ||
          data.error.includes("invalid") ||
          data.error.includes("ya ha sido verificada") ||
          data.error.includes("already been verified") ||
          data.error.includes("já foi verificada")
        )) {
          console.log(`[FRONTEND] Error no recuperable:`, data.error)
          setState("error")
          setMessage(data.error)
          return
        }

        // Si es un error de conexión o temporal, reintentar
        if (attempt < maxAttempts) {
          console.log(`[FRONTEND] Error temporal en intento ${attempt}, reintentando...`)
          const delayMs = Math.pow(2, attempt - 1) * 1000 // 1s, 2s, 4s
          await delay(delayMs)
          return verifyEmailWithRetry(token, attempt + 1)
        } else {
          console.log(`[FRONTEND] Todos los intentos fallaron`)
          setState("error")
          setMessage(data.error || "Error desconocido")
        }
      }
    } catch (error) {
      console.error(`[FRONTEND] Error en intento ${attempt}:`, error)
      
      // Si es un error de red y no es el último intento, reintentar
      if (attempt < maxAttempts) {
        console.log(`[FRONTEND] Error de red en intento ${attempt}, reintentando...`)
        const delayMs = Math.pow(2, attempt - 1) * 1000 // 1s, 2s, 4s
        await delay(delayMs)
        return verifyEmailWithRetry(token, attempt + 1)
      } else {
        console.log(`[FRONTEND] Todos los intentos de conexión fallaron`)
        setState("error")
        setMessage("Error de conexión")
      }
    }
  }

  useEffect(() => {
    console.log("[FRONTEND] Token recibido:", token)
    console.log("[FRONTEND] URL completa:", window.location.href)
    console.log("[FRONTEND] Search params:", window.location.search)
    
    if (!token) {
      console.log("[FRONTEND] No se encontró token en la URL")
      setState("invalid")
      return
    }

    // Iniciar verificación con reintentos
    verifyEmailWithRetry(token)
  }, [token, router, lang])

  const handleButtonClick = () => {
    switch (state) {
      case "success":
        router.push(`/${lang}/inicio-sesion`)
        break
      case "error":
        router.push(`/${lang}/registro`)
        break
      case "invalid":
        router.push(`/${lang}`)
        break
    }
  }

  const getIcon = () => {
    switch (state) {
      case "loading":
        return <Loader2 className="h-16 w-16 animate-spin text-gold-500" />
      case "success":
        return <CheckCircle className="h-16 w-16 text-green-400" />
      case "error":
      case "invalid":
        return <XCircle className="h-16 w-16 text-red-400" />
    }
  }

  const getContent = () => {
    switch (state) {
      case "loading":
        return {
          title: currentAttempt > 1 ? t.retrying : t.verifying,
          description: currentAttempt > 1 
            ? `Intento ${currentAttempt} de ${maxAttempts}. Por favor espera...`
            : "Por favor espera mientras verificamos tu cuenta...",
          showButton: false
        }
      case "success":
        return {
          title: t.success.title,
          description: t.success.description,
          buttonText: t.success.button,
          showButton: true
        }
      case "error":
        return {
          title: t.error.title,
          description: message || t.error.description,
          buttonText: t.error.button,
          showButton: true
        }
      case "invalid":
        return {
          title: t.invalid.title,
          description: t.invalid.description,
          buttonText: t.invalid.button,
          showButton: true
        }
    }
  }

  const content = getContent()

  return (
    <div className="pt-20 pb-16 relative overflow-visible min-h-screen">
      {/* Fondo con imagen igual al panel de usuario */}
      <ImageBackground imagePath="https://i.imgur.com/MrDWSAr.jpeg" overlayOpacity={0.3} />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20 flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="bg-bunker-800/90 backdrop-blur-sm border border-gold-700/30 shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                {getIcon()}
              </motion.div>
            </div>
            <CardTitle className="text-2xl font-bold text-gold-300 font-trade-winds">
              {t.title}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="text-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-xl font-semibold text-gold-200 mb-2">
                {content.title}
              </h3>
              <p className="text-gold-100 mb-6">
                {content.description}
              </p>
            </motion.div>

            {content.showButton && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  onClick={handleButtonClick}
                  className="w-full bg-gold-600 hover:bg-gold-700 text-bunker-950 font-semibold"
                  size="lg"
                >
                  {content.buttonText}
                </Button>
              </motion.div>
            )}

            {state === "success" && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-sm text-gold-400 mt-4"
              >
                Serás redirigido automáticamente en unos segundos...
              </motion.p>
            )}

            {state === "loading" && currentAttempt > 1 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-gold-400 mt-4"
              >
                El sistema está reintentando automáticamente...
              </motion.p>
            )}
          </CardContent>
        </Card>
      </motion.div>
      </div>
    </div>
  )
} 