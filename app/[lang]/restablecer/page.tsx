"use client"

import type React from "react"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useTranslations } from "@/i18n/context"

export default function RestablecerPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")
  const t = useTranslations()
  const [lang, setLang] = useState("es")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const [countdown, setCountdown] = useState(5)

  // Obtener el idioma actual
  useEffect(() => {
    // Extraer el idioma de la URL o usar el valor predeterminado
    const pathSegments = window.location.pathname.split("/")
    const langFromUrl = pathSegments.length > 1 ? pathSegments[1] : "es"
    setLang(langFromUrl)
  }, [])

  // Manejar la redirección después del éxito
  useEffect(() => {
    let timer: NodeJS.Timeout

    if (isSuccess) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            router.push(`/${lang}/inicio-sesion`)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isSuccess, router, lang])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return setMessage(t.resetPassword?.invalidToken || "Token no válido.")
    if (password !== confirmPassword)
      return setMessage(t.resetPassword?.passwordsDoNotMatch || "Las contraseñas no coinciden.")

    setLoading(true)
    setMessage("")

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()
      setLoading(false)

      if (res.ok) {
        setIsSuccess(true)
        setMessage(
          "✅ " +
            (t.resetPassword?.success || "Contraseña restablecida correctamente. Redirigiendo al inicio de sesión..."),
        )

        // Mostrar alerta
        alert(
          t.resetPassword?.successAlert ||
            "¡Contraseña actualizada correctamente! Serás redirigido al inicio de sesión.",
        )
      } else {
        setMessage(`❌ ${data.error || t.resetPassword?.error || "Error al restablecer la contraseña."}`)
      }
    } catch (error) {
      setLoading(false)
      setMessage(`❌ ${t.resetPassword?.serverError || "Error de conexión. Intente nuevamente."}`)
    }
  }

  return (
    <main className="max-w-md mx-auto mt-20 p-6 bg-[#111] text-white rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-4">{t.resetPassword?.title || "Restablecer contraseña"}</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="password"
          placeholder={t.resetPassword?.newPassword || "Nueva contraseña"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="p-2 rounded bg-black border border-gray-700"
          disabled={isSuccess}
        />
        <input
          type="password"
          placeholder={t.resetPassword?.confirmPassword || "Confirmar contraseña"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="p-2 rounded bg-black border border-gray-700"
          disabled={isSuccess}
        />
        <button
          type="submit"
          disabled={loading || isSuccess}
          className="bg-green-600 hover:bg-green-700 py-2 rounded font-bold disabled:opacity-50"
        >
          {loading
            ? t.resetPassword?.processing || "Procesando..."
            : t.resetPassword?.changePassword || "Cambiar contraseña"}
        </button>
      </form>
      {message && (
        <div className={`mt-4 text-sm ${isSuccess ? "text-green-500" : ""}`}>
          {message}
          {isSuccess && (
            <p className="mt-2">{t.resetPassword?.redirecting || `Redirigiendo en ${countdown} segundos...`}</p>
          )}
        </div>
      )}
    </main>
  )
}
