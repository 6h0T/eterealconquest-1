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
  multipleAccountsTitle: string
  multipleAccountsMessage: string
  selectAccount: string
  accountExpired: string
  accountValid: string
  sendToAccount: string
  backToForm: string
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
    alreadyVerifiedMessage: "Esta cuenta ya ha sido verificada",
    multipleAccountsTitle: "Múltiples Cuentas Encontradas",
    multipleAccountsMessage: "Se encontraron múltiples cuentas pendientes con este email. Selecciona cuál deseas verificar:",
    selectAccount: "Seleccionar Cuenta",
    accountExpired: "Token Expirado",
    accountValid: "Token Válido",
    sendToAccount: "Enviar a esta cuenta",
    backToForm: "Volver al formulario"
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
    alreadyVerifiedMessage: "This account has already been verified",
    multipleAccountsTitle: "Multiple Accounts Found",
    multipleAccountsMessage: "Multiple pending accounts found with this email. Select which one you want to verify:",
    selectAccount: "Select Account",
    accountExpired: "Token Expired",
    accountValid: "Token Valid",
    sendToAccount: "Send to this account",
    backToForm: "Back to form"
  }
}

export default function ReenviarVerificacionPage({ params }: { params: Promise<{ lang: string }> }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [multipleAccounts, setMultipleAccounts] = useState<Array<{
    username: string
    createdAt: string
    isExpired: boolean
  }> | null>(null)
  const [selectedEmail, setSelectedEmail] = useState("")
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

  const resetToForm = () => {
    setMultipleAccounts(null)
    setSelectedEmail("")
    setSubmitError("")
    setSubmitSuccess(false)
  }

  const handleAccountSelection = async (username: string) => {
    setIsSubmitting(true)
    setSubmitError("")

    try {
      console.log("[RESEND-PAGE] Enviando solicitud para cuenta específica:", username, "Email:", selectedEmail)

      const response = await fetch("/api/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({ 
          identifier: selectedEmail,
          isEmail: true,
          specificUsername: username
        }),
      })

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        console.error("[RESEND-PAGE] Respuesta no es JSON:", text.substring(0, 200))
        throw new Error("Respuesta del servidor no válida")
      }

      const result = await response.json()
      console.log("[RESEND-PAGE] JSON parseado:", result)

      if (!response.ok) {
        setSubmitError(result.error || t.error)
        return
      }

      // Éxito
      setSubmitSuccess(true)
      setSuccessMessage(result.message || t.successDescription)
      setMultipleAccounts(null)
      console.log("[RESEND-PAGE] Email reenviado exitosamente para:", username)

    } catch (error: any) {
      console.error("[RESEND-PAGE] Error capturado:", error)
      
      if (error.message.includes("JSON")) {
        setSubmitError("Error de comunicación con el servidor. Inténtalo más tarde.")
      } else {
        setSubmitError(error.message || "Error de conexión. Inténtalo más tarde.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    setSubmitError("")
    setMultipleAccounts(null)

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
        // Manejar caso especial de múltiples cuentas
        if (response.status === 409 && result.error === "MULTIPLE_ACCOUNTS") {
          console.log("[RESEND-PAGE] Múltiples cuentas encontradas:", result.accounts)
          setMultipleAccounts(result.accounts)
          setSelectedEmail(result.email)
          return
        }
        
        // Manejar otros errores
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(lang === 'es' ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
            {multipleAccounts ? t.multipleAccountsTitle : t.title}
          </h1>
          <p className="text-gold-100/70">
            {multipleAccounts ? t.multipleAccountsMessage : t.subtitle}
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
                {multipleAccounts ? t.selectAccount : t.title}
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              {multipleAccounts ? (
                /* Lista de múltiples cuentas */
                <div className="space-y-4">
                  {multipleAccounts.map((account, index) => (
                    <motion.div
                      key={account.username}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border transition-all hover:border-gold-500/50 cursor-pointer ${
                        account.isExpired 
                          ? "bg-red-900/20 border-red-500/30" 
                          : "bg-green-900/20 border-green-500/30"
                      }`}
                      onClick={() => !isSubmitting && handleAccountSelection(account.username)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-bold text-gold-200">{account.username}</h3>
                          <p className="text-sm text-gold-400">
                            Creada: {formatDate(account.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            account.isExpired 
                              ? "bg-red-500/20 text-red-300" 
                              : "bg-green-500/20 text-green-300"
                          }`}>
                            {account.isExpired ? t.accountExpired : t.accountValid}
                          </span>
                          <div className="mt-1">
                            <button
                              disabled={isSubmitting}
                              className="text-xs px-3 py-1 bg-gold-600 hover:bg-gold-700 text-black rounded transition-colors disabled:opacity-50"
                            >
                              {isSubmitting ? t.resending : t.sendToAccount}
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  <button
                    onClick={resetToForm}
                    className="w-full mt-4 px-4 py-2 text-gold-300 border border-gold-500/30 rounded hover:bg-gold-500/10 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2 inline" />
                    {t.backToForm}
                  </button>
                </div>
              ) : !submitSuccess ? (
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
                    <p className="text-gold-100/80 mb-4">
                      {successMessage}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link 
                      href={`/${lang}/registro`}
                      className="flex-1 px-4 py-2 text-center bg-transparent border border-gold-500/30 text-gold-300 rounded hover:bg-gold-500/10 transition-colors"
                    >
                      {t.backToRegister}
                    </Link>
                    <Link 
                      href={`/${lang}/inicio-sesion`}
                      className="flex-1 px-4 py-2 text-center bg-gold-600 hover:bg-gold-700 text-black rounded transition-colors font-medium"
                    >
                      {t.backToLogin}
                    </Link>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
} 