"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"

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
    <Card className="border-gold-500/20 bg-bunker-950/60 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <CardTitle className="text-gold-500 text-2xl">Crear nueva contraseña</CardTitle>
        <CardDescription className="text-gray-300">Ingrese su nueva contraseña para restablecer su cuenta</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-900/40 border border-red-500/50 text-red-200 px-4 py-3 rounded">
              <span>{error}</span>
            </div>
          )}
          
          {success && (
            <div className="bg-green-900/40 border border-green-500/50 text-green-200 px-4 py-3 rounded flex items-center">
              <CheckCircle className="mr-2" />
              <span>{success}</span>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-300">Nueva contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="bg-bunker-900/80 border-gold-500/20 focus:border-gold-400 text-white"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-gray-300">Confirmar contraseña</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
              className="bg-bunker-900/80 border-gold-500/20 focus:border-gold-400 text-white"
            />
          </div>
        </CardContent>
        
        <CardFooter>
          <Button
            type="submit"
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium h-12"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
