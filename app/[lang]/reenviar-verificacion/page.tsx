"use client"

import { useState, use } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Mail, AlertCircle, CheckCircle, ArrowLeft, Send } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageBackground } from "@/components/image-background"

// Esquema de validación
const formSchema = z.object({
  email: z.string().email("Email inválido").max(50, "Email muy largo"),
})

type FormData = z.infer<typeof formSchema>

interface ResendTexts {
  title: string
  subtitle: string
  email: string
  emailPlaceholder: string
  resend: string
  resending: string
  success: string
  successDescription: string
  error: string
  backToRegister: string
  backToLogin: string
  emailRequired: string
  emailInvalid: string
  cooldownMessage: string
  notFoundMessage: string
  alreadyVerifiedMessage: string
}

const texts: Record<string, ResendTexts> = {
  es: {
    title: "Reenviar Verificación",
    subtitle: "Ingresa tu email para recibir un nuevo enlace de verificación",
    email: "Correo electrónico",
    emailPlaceholder: "Ingresa tu correo electrónico",
    resend: "Reenviar Verificación",
    resending: "Reenviando...",
    success: "¡Email Reenviado!",
    successDescription: "Revisa tu bandeja de entrada para el nuevo enlace de verificación.",
    error: "Error al reenviar",
    backToRegister: "Volver al Registro",
    backToLogin: "Ir al Inicio de Sesión",
    emailRequired: "El email es requerido",
    emailInvalid: "Email inválido",
    cooldownMessage: "Debes esperar antes de reenviar nuevamente",
    notFoundMessage: "No se encontró registro pendiente para este email",
    alreadyVerifiedMessage: "Esta cuenta ya ha sido verificada"
  },
  en: {
    title: "Resend Verification",
    subtitle: "Enter your email to receive a new verification link",
    email: "Email address",
    emailPlaceholder: "Enter your email address",
    resend: "Resend Verification",
    resending: "Resending...",
    success: "Email Resent!",
    successDescription: "Check your inbox for the new verification link.",
    error: "Error resending",
    backToRegister: "Back to Registration",
    backToLogin: "Go to Login",
    emailRequired: "Email is required",
    emailInvalid: "Invalid email",
    cooldownMessage: "You must wait before resending again",
    notFoundMessage: "No pending registration found for this email",
    alreadyVerifiedMessage: "This account has already been verified"
  }
}

export default function ReenviarVerificacionPage({ params }: { params: Promise<{ lang: string }> }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const router = useRouter()
  
  const { lang } = use(params)
  const t = texts[lang] || texts.es

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    setSubmitError("")

    try {
      console.log("[RESEND-PAGE] Enviando solicitud para:", data.email)

      const response = await fetch("/api/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email }),
      })

      console.log("[RESEND-PAGE] Respuesta recibida:", response.status, response.statusText)
      console.log("[RESEND-PAGE] Content-Type:", response.headers.get("content-type"))

      // Verificar si la respuesta es JSON
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        console.error("[RESEND-PAGE] Respuesta no es JSON:", text.substring(0, 200))
        throw new Error("Respuesta del servidor no válida")
      }

      const result = await response.json()
      console.log("[RESEND-PAGE] JSON parseado:", result)

      if (!response.ok) {
        // Manejar diferentes tipos de errores
        if (result.error?.includes("esperar")) {
          setSubmitError(t.cooldownMessage)
        } else if (result.error?.includes("no se encontró") || result.error?.includes("not found")) {
          setSubmitError(t.notFoundMessage)
        } else if (result.error?.includes("ya ha sido verificada") || result.error?.includes("already been verified")) {
          setSubmitError(t.alreadyVerifiedMessage)
        } else {
          setSubmitError(result.error || t.error)
        }
        return
      }

      // Éxito
      setSubmitSuccess(true)
      console.log("[RESEND-PAGE] Email reenviado exitosamente")

    } catch (error: any) {
      console.error("[RESEND-PAGE] Error capturado:", error)
      console.error("[RESEND-PAGE] Tipo de error:", error.constructor.name)
      console.error("[RESEND-PAGE] Mensaje:", error.message)
      
      if (error.message.includes("JSON")) {
        setSubmitError("Error de comunicación con el servidor. Inténtalo más tarde.")
      } else {
        setSubmitError(error.message || "Error de conexión. Inténtalo más tarde.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="pt-20 pb-16 relative overflow-visible min-h-screen">
      {/* Fondo con imagen */}
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
                  className="p-3 bg-gold-500/20 rounded-full"
                >
                  <Mail className="h-8 w-8 text-gold-500" />
                </motion.div>
              </div>
              <CardTitle className="text-2xl font-bold text-gold-300 font-trade-winds">
                {t.title}
              </CardTitle>
              <p className="text-gold-200/80 mt-2">
                {t.subtitle}
              </p>
            </CardHeader>
            
            <CardContent>
              {!submitSuccess ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Campo de email */}
                  <div className="space-y-1">
                    <Label htmlFor="email" className="text-gold-300">
                      {t.email}
                    </Label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold-500/70">
                        <Mail className="h-5 w-5" />
                      </div>
                      <Input
                        id="email"
                        type="email"
                        placeholder={t.emailPlaceholder}
                        {...register("email")}
                        className={`bg-bunker-900/80 border-gold-700/30 text-gold-100 placeholder:text-gold-500/50 focus:border-gold-500 pl-10 ${
                          errors.email ? "border-red-500" : ""
                        }`}
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Mensaje de error */}
                  {submitError && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-900/30 border border-red-500/30 text-red-300 p-3 rounded-md flex items-center"
                    >
                      <AlertCircle className="h-5 w-5 mr-2" />
                      {submitError}
                    </motion.div>
                  )}

                  {/* Botón de reenvío */}
                  <div className="pt-2">
                    <button 
                      type="submit" 
                      disabled={isSubmitting} 
                      className="golden-button w-full"
                    >
                      {isSubmitting ? (
                        <>
                          <Send className="h-4 w-4 mr-2 animate-pulse" />
                          {t.resending}
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          {t.resend}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                /* Mensaje de éxito */
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-4"
                >
                  <div className="flex justify-center">
                    <CheckCircle className="h-16 w-16 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-green-400 mb-2">
                      {t.success}
                    </h3>
                    <p className="text-gold-200">
                      {t.successDescription}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Enlaces de navegación */}
              <div className="flex flex-col space-y-2 mt-6 pt-4 border-t border-gold-700/30">
                <Link
                  href={`/${lang}/registro`}
                  className="flex items-center justify-center text-gold-400 hover:text-gold-300 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t.backToRegister}
                </Link>
                <Link
                  href={`/${lang}/inicio-sesion`}
                  className="text-center text-gold-500 hover:text-gold-400 transition-colors"
                >
                  {t.backToLogin}
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
} 