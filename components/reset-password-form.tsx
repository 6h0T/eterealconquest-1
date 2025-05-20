"use client"

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
    console.log("Token recibido:", token ? token.substring(0, 10) + "..." : "no token")
    
    if (!token) {
      setError("Token no proporcionado. Por favor, solicite un nuevo enlace de recuperación.")
      setIsValidToken(false)
      return
    }

    if (token.length < 10) {
      setError("Token inválido. Por favor, solicite un nuevo enlace de recuperación.")
      setIsValidToken(false)
      return
    }

    setIsValidToken(true)
    setSuccess(null)
    setError(null)
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
      console.log("Enviando solicitud para restablecer contraseña con token:", token?.substring(0, 10) + "...")
      
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      })

      if (!response.ok) {
        let errorMessage = "Error al restablecer la contraseña"
        
        try {
          const data = await response.json()
          errorMessage = data.error || errorMessage
        } catch (jsonError) {
          console.error("Error al parsear respuesta JSON:", jsonError)
        }
        
        throw new Error(errorMessage)
      }

      let data
      try {
        data = await response.json()
      } catch (parseError) {
        console.error("Error al parsear la respuesta exitosa:", parseError)
        data = { success: true, message: "Contraseña restablecida correctamente" }
      }

      console.log("Respuesta del servidor:", data)

      setSuccess(data.message || "Contraseña restablecida correctamente")
      
      setTimeout(() => {
        router.push("/inicio-sesion")
      }, 3000)
    } catch (err: any) {
      console.error("Error:", err)
      setError(err.message || "Error al restablecer la contraseña. Por favor, inténtelo de nuevo más tarde.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isValidToken === false) {
    return (
      <div className="bg-bunker-900 border border-red-500 rounded-md p-6 text-center">
        <div className="flex items-center justify-center text-red-500 mb-4">
          <AlertCircle className="mr-2" size={24} />
          <h2 className="text-xl font-semibold">Error de validación</h2>
        </div>
        <p className="mb-6 text-gray-300">{error}</p>
        <Button 
          onClick={() => router.push("/recuperacion")}
          className="bg-gold-500 hover:bg-gold-600 text-black font-medium">
          Solicitar nuevo enlace
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-bunker-900 border border-gold-500/20 rounded-md p-6">
      <h2 className="text-xl font-semibold text-gold-500 mb-2">Crear nueva contraseña</h2>
      <p className="text-gold-100/70 mb-6">Ingrese su nueva contraseña para restablecer su cuenta</p>
      
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded mb-4 flex items-center">
            <CheckCircle className="mr-2" />
            <span>{success}</span>
          </div>
        )}
        
        <div className="mb-4">
          <Label htmlFor="password" className="text-gold-300 block mb-2">Nueva contraseña</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-bunker-800 border-gold-500/30 focus:border-gold-400 text-gold-100"
          />
        </div>
        
        <div className="mb-6">
          <Label htmlFor="confirm-password" className="text-gold-300 block mb-2">Confirmar contraseña</Label>
          <Input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full bg-bunker-800 border-gold-500/30 focus:border-gold-400 text-gold-100"
          />
        </div>
        
        <Button
          type="submit"
          className="w-full bg-gold-500 hover:bg-gold-600 text-black font-medium h-12"
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
      </form>
    </div>
  )
}
