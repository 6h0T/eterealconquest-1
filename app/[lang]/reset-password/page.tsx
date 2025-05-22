"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function ResetPasswordRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  useEffect(() => {
    // Redirigir a la página de restablecer con el token
    if (token) {
      console.log("Redirigiendo a /restablecer con token:", token.substring(0, 10) + "...")
      router.push(`/restablecer?token=${token}`)
    } else {
      console.log("No hay token, redirigiendo a /restablecer sin token")
      router.push("/restablecer")
    }
  }, [token, router])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-2xl font-bold mb-6 text-gold-500">Redirigiendo...</h1>
        <p className="text-gray-300">Por favor espere mientras lo redirigimos...</p>
      </div>
    </div>
  )
}
