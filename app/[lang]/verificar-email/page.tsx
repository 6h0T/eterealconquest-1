"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type VerificationState = "loading" | "success" | "error" | "invalid"

interface VerificationTexts {
  title: string
  verifying: string
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
    success: {
      title: "¡Cuenta Verificada!",
      description: "Tu cuenta ha sido verificada exitosamente. Ya puedes iniciar sesión.",
      button: "Ir al Login"
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

export default function VerificarEmailPage({ params }: { params: { lang: string } }) {
  const [state, setState] = useState<VerificationState>("loading")
  const [message, setMessage] = useState("")
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")
  
  const lang = params.lang || "es"
  const t = texts[lang] || texts.es

  useEffect(() => {
    if (!token) {
      setState("invalid")
      return
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch("/api/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (response.ok && data.success) {
          setState("success")
          setMessage(data.message || "")
          // Redirigir al login después de 3 segundos
          setTimeout(() => {
            router.push(`/${lang}/login`)
          }, 3000)
        } else {
          setState("error")
          setMessage(data.error || "Error desconocido")
        }
      } catch (error) {
        console.error("Error al verificar email:", error)
        setState("error")
        setMessage("Error de conexión")
      }
    }

    verifyEmail()
  }, [token, router, lang])

  const handleButtonClick = () => {
    switch (state) {
      case "success":
        router.push(`/${lang}/login`)
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
        return <Loader2 className="h-16 w-16 animate-spin text-blue-500" />
      case "success":
        return <CheckCircle className="h-16 w-16 text-green-500" />
      case "error":
      case "invalid":
        return <XCircle className="h-16 w-16 text-red-500" />
    }
  }

  const getContent = () => {
    switch (state) {
      case "loading":
        return {
          title: t.verifying,
          description: "Por favor espera mientras verificamos tu cuenta...",
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
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
            <CardTitle className="text-2xl font-bold text-white">
              {t.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-xl font-semibold text-white mb-2">
                {content.title}
              </h3>
              <p className="text-gray-300 mb-6">
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
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
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
                className="text-sm text-gray-400 mt-4"
              >
                Serás redirigido automáticamente en unos segundos...
              </motion.p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
} 