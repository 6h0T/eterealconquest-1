"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Eye, EyeOff, Check, AlertCircle, Lock, User } from "lucide-react"
import { motion } from "framer-motion"
import { getDictionary } from "@/i18n/config"
import type { Locale } from "@/i18n/config"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

interface LoginFormProps {
  lang: Locale
}

export function LoginForm({ lang }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [dictionary, setDictionary] = useState<any>({})
  const router = useRouter()

  // Cargar diccionario
  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar diccionario
        const dict = await getDictionary(lang)
        setDictionary(dict)
      } catch (error) {
        console.error("Error loading data:", error)
      }
    }
    loadData()
  }, [lang])

  // Traducciones específicas para el formulario
  const translations = {
    es: {
      title: "Iniciar Sesión",
      username: "Usuario",
      usernamePlaceholder: "Ingresa tu usuario",
      password: "Contraseña",
      passwordPlaceholder: "Ingresa tu contraseña",
      login: "Iniciar Sesión",
      loggingIn: "Iniciando sesión...",
      success: "¡Inicio de sesión exitoso! Redirigiendo...",
      error: "Usuario o contraseña incorrectos. Por favor, intenta nuevamente.",
      usernameRequired: "Usuario es requerido",
      passwordRequired: "La contraseña es requerida",
      forgotPassword: "¿Olvidaste tu contraseña?",
      noAccount: "¿No tienes una cuenta?",
      register: "Regístrate",
      showPassword: "Mostrar contraseña",
      hidePassword: "Ocultar contraseña",
      rememberMe: "Recordarme",
      serverError: "Error en el servidor. Inténtalo más tarde.",
      validationError: "Error de validación. Por favor, verifica los datos ingresados.",
    },
    en: {
      title: "Sign In",
      username: "Username",
      usernamePlaceholder: "Enter your username",
      password: "Password",
      passwordPlaceholder: "Enter your password",
      login: "Sign In",
      loggingIn: "Signing in...",
      success: "Sign in successful! Redirecting...",
      error: "Incorrect username or password. Please try again.",
      usernameRequired: "Username is required",
      passwordRequired: "Password is required",
      forgotPassword: "Forgot your password?",
      noAccount: "Don't have an account?",
      register: "Register",
      showPassword: "Show password",
      hidePassword: "Hide password",
      rememberMe: "Remember me",
      serverError: "Server error. Please try again later.",
      validationError: "Validation error. Please check your input data.",
    },
    pt: {
      title: "Entrar",
      username: "Usuário",
      usernamePlaceholder: "Digite seu usuário",
      password: "Senha",
      passwordPlaceholder: "Digite sua senha",
      login: "Entrar",
      loggingIn: "Entrando...",
      success: "Login bem-sucedido! Redirecionando...",
      error: "Usuário ou senha incorretos. Por favor, tente novamente.",
      usernameRequired: "Usuário é obrigatório",
      passwordRequired: "Senha é obrigatória",
      forgotPassword: "Esqueceu sua senha?",
      noAccount: "Não tem uma conta?",
      register: "Registre-se",
      showPassword: "Mostrar senha",
      hidePassword: "Ocultar senha",
      rememberMe: "Lembrar-me",
      serverError: "Erro no servidor. Tente novamente mais tarde.",
      validationError: "Erro de validação. Por favor, verifique os dados inseridos.",
    },
  }

  const t = translations[lang as keyof typeof translations]

  // Esquema de validación con Zod
  const formSchema = z.object({
    username: z.string().min(1, t.usernameRequired),
    password: z.string().min(1, t.passwordRequired),
    rememberMe: z.boolean().optional(),
  })

  // Configurar React Hook Form con Zod
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  })

  // Manejar envío del formulario
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    setSubmitError("")

    try {
      // Preparar los datos para enviar al servidor
      const formData = {
        username: data.username,
        password: data.password,
      }

      console.log("Enviando datos:", formData) // Log para depuración

      // Usar una ruta absoluta para la API
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      // Verificar si la respuesta es JSON
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Respuesta no válida del servidor: ${await response.text()}`)
      }

      const result = await response.json()

      if (!response.ok) {
        if (result.error === "Datos inválidos") {
          console.error("Error de validación:", result.details)
          setSubmitError(t.validationError)
        } else if (result.error === "Credenciales incorrectas") {
          setSubmitError(t.error)
        } else if (result.error === "Error en la base de datos" || result.error.includes("base de datos")) {
          console.error("Error de base de datos:", result.details)
          setSubmitError(`${t.serverError} (${result.details || result.error})`)
        } else {
          setSubmitError(result.error || t.error)
        }
        return
      }

      // Login exitoso
      setSubmitSuccess(true)
      console.log("Login exitoso:", result.user)

      // Guardar información de sesión
      localStorage.setItem("username", data.username)
      localStorage.setItem("isAuthenticated", "true")
      localStorage.setItem("userEmail", result.user.email)

      // Guardar fecha y hora del último inicio de sesión
      localStorage.setItem("lastLogin", new Date().toISOString())

      // Mostrar mensaje de éxito brevemente y luego redirigir
      setTimeout(() => {
        console.log("Redirigiendo a panel de usuario...")
        // Usar window.location.href para una redirección completa y evitar problemas con rutas relativas
        window.location.href = `/${lang}/panel`
      }, 1500) // Reducir a 1.5 segundos para una mejor experiencia de usuario
    } catch (error: any) {
      console.error("Error al iniciar sesión:", error)
      setSubmitError(error.message || t.serverError)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Card className="bg-bunker-800/90 backdrop-blur-sm border border-gold-700/30">
        <CardContent className="p-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Usuario */}
            <div className="space-y-1">
              <Label htmlFor="username" className="text-gold-300">
                {t.username}
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold-500/70">
                  <User className="h-5 w-5" />
                </div>
                <Input
                  id="username"
                  placeholder={t.usernamePlaceholder}
                  {...register("username")}
                  className={`bg-bunker-900/80 border-gold-700/30 text-gold-100 placeholder:text-gold-500/50 focus:border-gold-500 pl-10 ${
                    errors.username ? "border-red-500" : ""
                  }`}
                  disabled={isSubmitting}
                />
              </div>
              {errors.username && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Contraseña */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-gold-300">
                  {t.password}
                </Label>
              </div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold-500/70">
                  <Lock className="h-5 w-5" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t.passwordPlaceholder}
                  {...register("password")}
                  className={`bg-bunker-900/80 border-gold-700/30 text-gold-100 placeholder:text-gold-500/50 focus:border-gold-500 pl-10 pr-10 ${
                    errors.password ? "border-red-500" : ""
                  }`}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gold-500/70 hover:text-gold-400"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? t.hidePassword : t.showPassword}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Recordarme */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                {...register("rememberMe")}
                className="h-4 w-4 rounded border-gold-700/30 bg-bunker-900/80 text-gold-500 focus:ring-gold-500"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gold-300">
                {t.rememberMe}
              </label>
            </div>

            {/* Mensajes de éxito o error */}
            {submitSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-900/30 border border-green-500/30 text-green-300 p-3 rounded-md flex items-center"
              >
                <Check className="h-5 w-5 mr-2" />
                {t.success}
              </motion.div>
            )}

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

            {/* Botones de acción */}
            <div className="pt-2 flex flex-col space-y-2">
              <button type="submit" disabled={isSubmitting} className="golden-button w-full">
                {isSubmitting ? t.loggingIn : t.login}
              </button>
            </div>

            {/* Enlace para recuperar contraseña */}
            <div className="text-center">
              <Link
                href={`/${lang}/recuperacion`}
                className="text-gold-500 hover:text-gold-400 transition-colors underline font-bold italic"
              >
                {t.forgotPassword}
              </Link>
            </div>

            {/* Enlace para registrarse */}
            <div className="text-center text-gold-300 mt-4">
              <p>
                {t.noAccount}{" "}
                <Link href={`/${lang}/registro`} className="text-gold-500 hover:text-gold-400 font-medium underline">
                  {t.register}
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  )
}
