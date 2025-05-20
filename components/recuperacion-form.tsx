"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import type { Locale } from "@/i18n/config"

interface RecuperacionFormProps {
  lang: Locale
}

export function RecuperacionForm({ lang }: RecuperacionFormProps) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Translations for messages
  const translations = {
    es: {
      emailPlaceholder: "Correo electrónico",
      submitButton: "Enviar enlace",
      loadingText: "Enviando...",
      successMessage: "Revisa tu correo para restablecer la contraseña.",
      errorDefault: "Ocurrió un error inesperado",
    },
    en: {
      emailPlaceholder: "Email address",
      submitButton: "Send recovery link",
      loadingText: "Sending...",
      successMessage: "Check your email to reset your password.",
      errorDefault: "An unexpected error occurred",
    },
    pt: {
      emailPlaceholder: "Endereço de email",
      submitButton: "Enviar link",
      loadingText: "Enviando...",
      successMessage: "Verifique seu email para redefinir sua senha.",
      errorDefault: "Ocorreu um erro inesperado",
    },
  }

  const t = translations[lang as keyof typeof translations]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)

    try {
      console.log("Enviando solicitud de recuperación para:", email)
      
      const res = await fetch("/api/recover-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      // Verificar si la respuesta es exitosa
      if (!res.ok) {
        let errorMessage = t.errorDefault
        
        try {
          // Intentar parsear la respuesta como JSON
          const data = await res.json()
          errorMessage = data.error || errorMessage
        } catch (jsonError) {
          // Si no se puede parsear como JSON, usar el texto directo
          try {
            const textError = await res.text()
            errorMessage = textError || errorMessage
          } catch (textError) {
            console.error("No se pudo procesar la respuesta del servidor:", textError)
          }
          console.error("Error al parsear respuesta JSON:", jsonError)
        }
        
        throw new Error(errorMessage)
      }

      // Si la respuesta es OK, intentar parsear el JSON
      let data
      try {
        data = await res.json()
      } catch (parseError) {
        console.error("Error al parsear la respuesta exitosa:", parseError)
        // Si no hay respuesta JSON, al menos sabemos que fue exitoso
        data = { success: true, message: t.successMessage }
      }

      console.log("Respuesta del servidor:", data)
      setMessage(t.successMessage)
      setEmail("")
    } catch (err: any) {
      console.error("Error en recuperación:", err)
      setError(err.message || t.errorDefault)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="bg-bunker-900/80 backdrop-blur-sm rounded-lg shadow-xl p-6 border border-gold-500/20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.emailPlaceholder}
            required
            className="bg-bunker-800 border-gold-500/30 focus:border-gold-400 text-gold-100 placeholder:text-gold-100/50"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-bunker-950 font-medium"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t.loadingText}
            </>
          ) : (
            t.submitButton
          )}
        </Button>
      </form>

      {message && (
        <motion.p className="mt-4 text-green-400 text-sm text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {message}
        </motion.p>
      )}

      {error && (
        <motion.p className="mt-4 text-red-400 text-sm text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {error}
        </motion.p>
      )}
    </motion.div>
  )
}
