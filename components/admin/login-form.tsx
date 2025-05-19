"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Eye, EyeOff, AlertCircle, Lock, Mail } from "lucide-react"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"

// Esquema de validación para el formulario
const formSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
})

type FormData = z.infer<typeof formSchema>

export function AdminLoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Usar la autenticación por correo electrónico de Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (authError) {
        throw new Error(authError.message || "Error al iniciar sesión")
      }

      if (authData.user) {
        console.log("Autenticación exitosa, redirigiendo al dashboard...")

        // Establecer una cookie para indicar que el usuario está autenticado
        document.cookie = "adminAuthenticated=true; path=/"

        // Redirigir al dashboard
        window.location.href = "/admin/dashboard"
      }
    } catch (err: any) {
      console.error("Error de autenticación:", err)
      setError(err.message || "Error al iniciar sesión")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md" style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-medium text-gray-100">Iniciar Sesión</h1>
        <p className="mt-2 text-sm text-gray-400">Ingresa tus credenciales para acceder al panel</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-300">
            Correo Electrónico
          </Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Mail className="h-4 w-4" />
            </div>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              {...register("email")}
              className={`pl-10 h-10 bg-bunker-800 border text-gray-100 placeholder:text-gray-500 ${
                errors.email ? "border-red-500" : "border-bunker-700 focus:border-gold-500"
              } rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gold-500`}
              disabled={isSubmitting}
            />
          </div>
          {errors.email && (
            <p className="text-red-400 text-xs mt-1 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Contraseña */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-gray-300">
            Contraseña
          </Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Lock className="h-4 w-4" />
            </div>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register("password")}
              className={`pl-10 pr-10 h-10 bg-bunker-800 border text-gray-100 placeholder:text-gray-500 ${
                errors.password ? "border-red-500" : "border-bunker-700 focus:border-gold-500"
              } rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gold-500`}
              disabled={isSubmitting}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-400 text-xs mt-1 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-900/30 border border-red-500/30 text-red-300 p-3 rounded-md text-sm flex items-center"
          >
            <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gold-600 hover:bg-gold-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Iniciando sesión..." : "Iniciar Sesión"}
        </button>
      </form>
    </div>
  )
}
