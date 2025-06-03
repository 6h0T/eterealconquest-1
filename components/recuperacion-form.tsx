"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Mail, User } from "lucide-react"
import { motion } from "framer-motion"
import type { Locale } from "@/i18n/config"

interface RecuperacionFormProps {
  lang: Locale
}

export function RecuperacionForm({ lang }: RecuperacionFormProps) {
  const [identifier, setIdentifier] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [emailHint, setEmailHint] = useState<string | null>(null)

  // Translations for messages
  const translations = {
    es: {
      identifierPlaceholder: "Correo electrónico o nombre de usuario",
      submitButton: "Enviar enlace",
      loadingText: "Enviando...",
      successMessage: "Revisa tu correo para restablecer la contraseña.",
      successWithHint: "Se ha enviado un enlace de recuperación a",
      errorDefault: "Ocurrió un error inesperado",
      identifierLabel: "Email o Usuario",
      identifierHelper: "Puedes usar tu correo electrónico o tu nombre de usuario (ID de cuenta)",
    },
    en: {
      identifierPlaceholder: "Email address or username",
      submitButton: "Send recovery link",
      loadingText: "Sending...",
      successMessage: "Check your email to reset your password.",
      successWithHint: "A recovery link has been sent to",
      errorDefault: "An unexpected error occurred",
      identifierLabel: "Email or Username",
      identifierHelper: "You can use your email address or your username (account ID)",
    },
    pt: {
      identifierPlaceholder: "Endereço de email ou nome de usuário",
      submitButton: "Enviar link",
      loadingText: "Enviando...",
      successMessage: "Verifique seu email para redefinir sua senha.",
      successWithHint: "Um link de recuperação foi enviado para",
      errorDefault: "Ocorreu um erro inesperado",
      identifierLabel: "Email ou Usuário",
      identifierHelper: "Você pode usar seu endereço de email ou seu nome de usuário (ID da conta)",
    },
  }

  const t = translations[lang as keyof typeof translations]

  // Función para detectar si es email o username
  const isEmail = (input: string) => {
    return input.includes('@')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)
    setEmailHint(null)

    try {
      const res = await fetch("/api/recover-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          identifier,
          isEmail: isEmail(identifier)
        }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || t.errorDefault)

      if (data.emailHint) {
        setEmailHint(data.emailHint)
        setMessage(`${t.successWithHint} ${data.emailHint}`)
      } else {
        setMessage(t.successMessage)
      }
      
      setIdentifier("")
    } catch (err: any) {
      setError(err.message)
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
        <div className="space-y-2">
          <label htmlFor="identifier" className="block text-sm font-medium text-gold-300">
            {t.identifierLabel}
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold-500/70">
              {isEmail(identifier) ? <Mail className="h-5 w-5" /> : <User className="h-5 w-5" />}
            </div>
            <Input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={t.identifierPlaceholder}
              required
              className="bg-bunker-800 border-gold-500/30 focus:border-gold-400 text-gold-100 placeholder:text-gold-100/50 pl-10"
            />
          </div>
          <p className="text-xs text-gold-400/70">
            {t.identifierHelper}
          </p>
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
        <motion.div
          className="mt-4 p-3 bg-green-900/30 border border-green-500/30 rounded-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-green-400 text-sm text-center">{message}</p>
        </motion.div>
      )}

      {error && (
        <motion.p className="mt-4 text-red-400 text-sm text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {error}
        </motion.p>
      )}
    </motion.div>
  )
}
