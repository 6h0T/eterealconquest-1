"use client"

import { useState, use } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Mail, AlertCircle, CheckCircle, ArrowLeft, Send, User } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageBackground } from "@/components/image-background"

// Esquema de validación actualizado
const formSchema = z.object({
  identifier: z.string().min(1, "Email o nombre de usuario requerido").max(50, "Muy largo"),
})

type FormData = z.infer<typeof formSchema>

// Función para detectar si es email o username
function isEmailFormat(input: string): boolean {
  return input.includes('@')
}

interface ResendTexts {
  title: string
  subtitle: string
  identifier: string
  identifierPlaceholder: string
  identifierHelper: string
  resend: string
  resending: string
  success: string
  successDescription: string
  error: string
  backToRegister: string
  backToLogin: string
  identifierRequired: string
  cooldownMessage: string
  notFoundMessage: string
  alreadyVerifiedMessage: string
}

const texts: Record<string, ResendTexts> = {
  es: {
    title: "Reenviar Verificación",
    subtitle: "Ingresa tu email o nombre de usuario para recibir un nuevo enlace de verificación",
    identifier: "Email o Usuario",
    identifierPlaceholder: "Ingresa tu correo electrónico o nombre de usuario",
    identifierHelper: "Puedes usar tu correo electrónico o tu nombre de usuario (ID de cuenta)",
    resend: "Reenviar Verificación",
    resending: "Reenviando...",
    success: "¡Email Reenviado!",
    successDescription: "Revisa tu bandeja de entrada para el nuevo enlace de verificación.",
    error: "Error al reenviar",
    backToRegister: "Volver al Registro",
    backToLogin: "Ir al Inicio de Sesión",
    identifierRequired: "El email o nombre de usuario es requerido",
    cooldownMessage: "Debes esperar antes de reenviar nuevamente",
    notFoundMessage: "No se encontró registro pendiente",
    alreadyVerifiedMessage: "Esta cuenta ya ha sido verificada"
  },
  en: {
    title: "Resend Verification",
    subtitle: "Enter your email or username to receive a new verification link",
    identifier: "Email or Username",
    identifierPlaceholder: "Enter your email address or username",
    identifierHelper: "You can use your email address or your username (account ID)",
    resend: "Resend Verification",
    resending: "Resending...",
    success: "Email Resent!",
    successDescription: "Check your inbox for the new verification link.",
    error: "Error resending",
    backToRegister: "Back to Registration",
    backToLogin: "Go to Login",
    identifierRequired: "Email or username is required",
    cooldownMessage: "You must wait before resending again",
    notFoundMessage: "No pending registration found",
    alreadyVerifiedMessage: "This account has already been verified"
  }
}

export default function ReenviarVerificacionPage({ params }: { params: Promise<{ lang: string }> }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const router = useRouter()
  
  const { lang } = use(params)
  const t = texts[lang] || texts.es

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  const identifier = watch("identifier", "")
  const isEmail = isEmailFormat(identifier)

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    setSubmitError("")

    try {
      console.log("[RESEND-PAGE] Enviando solicitud para:", data.identifier, "Es email:", isEmail)

      const response = await fetch("/api/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({ 
          identifier: data.identifier,
          isEmail: isEmail
        }),
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
      setSuccessMessage(result.message || t.successDescription)
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <ImageBackground imagePath="https://i.imgur.com/MrDWSAr.jpeg" overlayOpacity={0.3} />
      
      <div className="w-full max-w-md space-y-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-gold-200 mb-2">
            {t.title}
          </h1>
          <p className="text-gold-100/70">
            {t.subtitle}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="bg-bunker-900/90 backdrop-blur-sm border-gold-500/20">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-gold-200">
                {t.title}
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              {!submitSuccess ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Campo de identificador */}
                  <div className="space-y-1">
                    <Label htmlFor="identifier" className="text-gold-300">
                      {t.identifier}
                    </Label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold-500/70">
                        {isEmail ? <Mail className="h-5 w-5" /> : <User className="h-5 w-5" />}
                      </div>
                      <Input
                        id="identifier"
                        type="text"
                        placeholder={t.identifierPlaceholder}
                        {...register("identifier")}
                        className={`bg-bunker-900/80 border-gold-700/30 text-gold-100 placeholder:text-gold-500/50 focus:border-gold-500 pl-10 ${
                          errors.identifier ? "border-red-500" : ""
                        }`}
                        disabled={isSubmitting}
                      />
                    </div>
                    <p className="text-xs text-gold-400/70">
                      {t.identifierHelper}
                    </p>
                    {errors.identifier && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.identifier.message}
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
                      {successMessage}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Enlaces de navegación */}
              <div className="mt-6 pt-4 border-t border-gold-700/30 space-y-2">
                <div className="flex flex-col sm:flex-row justify-center gap-2 text-sm">
                  <Link
                    href={`/${lang}/registro`}
                    className="inline-flex items-center justify-center text-gold-400 hover:text-gold-300 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    {t.backToRegister}
                  </Link>
                  <span className="text-gold-600 hidden sm:inline">|</span>
                  <Link
                    href={`/${lang}/inicio-sesion`}
                    className="text-gold-400 hover:text-gold-300 transition-colors"
                  >
                    {t.backToLogin}
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
} 