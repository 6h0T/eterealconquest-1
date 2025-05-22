"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle } from "lucide-react"

export default function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null)

  useEffect(() => {
    if (!token) {
      setError("Token no proporcionado. Por favor, solicite un nuevo enlace de recuperación.")
      setIsValidToken(false)
      return
    }

    setIsValidToken(true)
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    if (password.length < 4 || password.length > 10) {
      setError("La contraseña debe tener entre 4 y 10 caracteres")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Error al restablecer la contraseña")
      } else {
        setSuccess(data.message || "Contraseña restablecida correctamente")
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          router.push("/inicio-sesion")
        }, 3000)
      }
    } catch (err) {
      console.error("Error:", err)
      setError("Error al restablecer la contraseña. Por favor, inténtelo de nuevo más tarde.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isValidToken === false) {
    return (
      <Card className="border-red-500">
        <CardHeader>
          <CardTitle className="text-center text-red-500 flex items-center justify-center">
            <AlertCircle className="mr-2" />
            Error de validación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center">{error}</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => router.push("/recuperacion")}>Solicitar nuevo enlace</Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="border-gold-500/50">
      <CardHeader>
        <CardTitle className="text-gold-500">Crear nueva contraseña</CardTitle>
        <CardDescription>Ingrese su nueva contraseña para restablecer su cuenta</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative flex items-center">
              <CheckCircle className="mr-2" />
              <span className="block sm:inline">{success}</span>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="password">Nueva contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading || !!success}
              className="border-bunker-300"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmar contraseña</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading || !!success}
              className="border-bunker-300"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full bg-gold-500 hover:bg-gold-600 text-black"
            disabled={isLoading || !!success}
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                Procesando...
              </>
            ) : (
              "Restablecer contraseña"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
