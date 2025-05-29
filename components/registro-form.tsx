"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Eye, EyeOff, Check, AlertCircle, User, Mail, Lock } from "lucide-react"
import { motion } from "framer-motion"
import { getDictionary } from "@/i18n/config"
import type { Locale } from "@/i18n/config"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { getRecaptchaConfig } from "@/lib/actions"
import { TermsModal } from "@/components/terms-modal"
import { RulesModal } from "@/components/rules-modal"

interface RegistroFormProps {
  lang: Locale
}

export function RegistroForm({ lang }: RegistroFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [requiresVerification, setRequiresVerification] = useState(false)
  const [dictionary, setDictionary] = useState<any>({})
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false)
  const [recaptchaConfig, setRecaptchaConfig] = useState<{ enabled: boolean; siteKey: string }>({
    enabled: false,
    siteKey: "",
  })
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [rulesAccepted, setRulesAccepted] = useState(false)
  const [showRulesModal, setShowRulesModal] = useState(false)
  const router = useRouter()

  // Cargar diccionario y la configuración de reCAPTCHA
  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar diccionario
        const dict = await getDictionary(lang)
        setDictionary(dict)

        // Cargar configuración de reCAPTCHA
        const config = await getRecaptchaConfig()
        setRecaptchaConfig(config)
      } catch (error) {
        console.error("Error loading data:", error)
      }
    }
    loadData()
  }, [lang])

  // Inicializar reCAPTCHA cuando se carga el script
  useEffect(() => {
    if (!recaptchaLoaded || !window.grecaptcha || !recaptchaConfig.siteKey) return

    // Renderizar el widget de reCAPTCHA
    try {
      window.grecaptcha.ready(() => {
        console.log("reCAPTCHA está listo")
      })
    } catch (error) {
      console.error("Error al inicializar reCAPTCHA:", error)
    }
  }, [recaptchaLoaded, recaptchaConfig.siteKey])

  // Función para ejecutar reCAPTCHA
  const executeRecaptcha = async (): Promise<string> => {
    if (!recaptchaLoaded || !window.grecaptcha || !recaptchaConfig.siteKey) {
      console.warn("reCAPTCHA no está cargado o no hay clave del sitio")
      return ""
    }

    try {
      const token = await window.grecaptcha.execute(recaptchaConfig.siteKey, { action: "register" })
      return token
    } catch (error) {
      console.error("Error al ejecutar reCAPTCHA:", error)
      return ""
    }
  }

  // Traducciones específicas para el formulario
  const translations = {
    es: {
      username: "Nombre de usuario",
      usernamePlaceholder: "Ingresa tu nombre de usuario",
      email: "Correo electrónico",
      emailPlaceholder: "Ingresa tu correo electrónico",
      password: "Contraseña",
      passwordPlaceholder: "Ingresa tu contraseña",
      confirmPassword: "Confirmar contraseña",
      confirmPasswordPlaceholder: "Confirma tu contraseña",
      register: "Registrarse",
      registering: "Registrando...",
      success: "¡Registro exitoso! Redirigiendo...",
      error: "Error al registrar. Por favor, intenta nuevamente.",
      usernameRequired: "El nombre de usuario es requerido",
      usernameLength: "El nombre de usuario debe tener entre 4 y 10 caracteres",
      emailRequired: "El correo electrónico es requerido",
      emailInvalid: "El correo electrónico no es válido",
      passwordRequired: "La contraseña es requerida",
      passwordLength: "La contraseña debe tener al menos 6 caracteres",
      passwordMismatch: "Las contraseñas no coinciden",
      showPassword: "Mostrar contraseña",
      hidePassword: "Ocultar contraseña",
      alreadyHaveAccount: "¿Ya tienes una cuenta?",
      login: "Iniciar sesión",
      userExists: "El usuario ya existe",
      serverError: "Error en el servidor. Inténtalo más tarde.",
      recaptchaError: "Error de verificación reCAPTCHA. Por favor, inténtalo de nuevo.",
      validationError: "Error de validación. Por favor, verifica los datos ingresados.",
      verificationSent: "¡Registro iniciado! Revisa tu correo electrónico para verificar tu cuenta.",
      checkEmail: "Revisa tu bandeja de entrada y haz clic en el enlace de verificación para completar tu registro.",
      termsAcceptance: "Acepto los",
      termsAndConditions: "Términos y Condiciones",
      termsRequired: "Debes aceptar los términos y condiciones para continuar",
      rulesAcceptance: "Acepto el",
      gameRules: "Reglamento de Juego",
      rulesRequired: "Debes aceptar el reglamento de juego para continuar",
    },
    en: {
      username: "Username",
      usernamePlaceholder: "Enter your username",
      email: "Email address",
      emailPlaceholder: "Enter your email address",
      password: "Password",
      passwordPlaceholder: "Enter your password",
      confirmPassword: "Confirm password",
      confirmPasswordPlaceholder: "Confirm your password",
      register: "Register",
      registering: "Registering...",
      success: "Registration successful! Redirecting...",
      error: "Registration error. Please try again.",
      usernameRequired: "Username is required",
      usernameLength: "Username must be between 4 and 10 characters",
      emailRequired: "Email is required",
      emailInvalid: "Email is invalid",
      passwordRequired: "Password is required",
      passwordLength: "Password must be at least 6 characters",
      passwordMismatch: "Passwords do not match",
      showPassword: "Show password",
      hidePassword: "Hide password",
      alreadyHaveAccount: "Already have an account?",
      login: "Login",
      userExists: "Username already exists",
      serverError: "Server error. Please try again later.",
      recaptchaError: "reCAPTCHA verification failed. Please try again.",
      validationError: "Validation error. Please check your input data.",
      verificationSent: "Registration started! Check your email to verify your account.",
      checkEmail: "Check your inbox and click the verification link to complete your registration.",
      termsAcceptance: "I accept the",
      termsAndConditions: "Terms and Conditions",
      termsRequired: "You must accept the terms and conditions to continue",
      rulesAcceptance: "I accept the",
      gameRules: "Game Rules",
      rulesRequired: "You must accept the game rules to continue",
    },
    pt: {
      username: "Nome de usuário",
      usernamePlaceholder: "Digite seu nome de usuário",
      email: "Endereço de email",
      emailPlaceholder: "Digite seu endereço de email",
      password: "Senha",
      passwordPlaceholder: "Digite sua senha",
      confirmPassword: "Confirmar senha",
      confirmPasswordPlaceholder: "Confirme sua senha",
      register: "Registrar",
      registering: "Registrando...",
      success: "Registro bem-sucedido! Redirecionando...",
      error: "Erro no registro. Por favor, tente novamente.",
      usernameRequired: "Nome de usuário é obrigatório",
      usernameLength: "Nome de usuário deve ter entre 4 e 10 caracteres",
      emailRequired: "Email é obrigatório",
      emailInvalid: "Email é inválido",
      passwordRequired: "Senha é obrigatória",
      passwordLength: "Senha deve ter pelo menos 6 caracteres",
      passwordMismatch: "As senhas não coincidem",
      showPassword: "Mostrar senha",
      hidePassword: "Ocultar senha",
      alreadyHaveAccount: "Já tem uma conta?",
      login: "Entrar",
      userExists: "Nome de usuário já existe",
      serverError: "Erro no servidor. Tente novamente mais tarde.",
      recaptchaError: "Verificação reCAPTCHA falhou. Por favor, tente novamente.",
      validationError: "Erro de validação. Por favor, verifique os dados inseridos.",
      verificationSent: "Registro iniciado! Verifique seu email para verificar sua conta.",
      checkEmail: "Verifique sua caixa de entrada e clique no link de verificação para completar seu registro.",
      termsAcceptance: "Aceito os",
      termsAndConditions: "Termos e Condições",
      termsRequired: "Você deve aceitar os termos e condições para continuar",
      rulesAcceptance: "Aceito o",
      gameRules: "Regulamento do Jogo",
      rulesRequired: "Você deve aceitar o regulamento do jogo para continuar",
    },
  }

  const t = translations[lang as keyof typeof translations]

  // Esquema de validación con Zod
  const formSchema = z
    .object({
      username: z.string().min(4, t.usernameLength).max(10, t.usernameLength),
      email: z.string().email(t.emailInvalid),
      password: z.string().min(6, t.passwordLength),
      passwordConfirm: z.string().min(1, t.passwordRequired),
      termsAccepted: z.boolean().refine((val) => val === true, {
        message: t.termsRequired,
      }),
      rulesAccepted: z.boolean().refine((val) => val === true, {
        message: t.rulesRequired,
      }),
    })
    .refine((data) => data.password === data.passwordConfirm, {
      message: t.passwordMismatch,
      path: ["passwordConfirm"],
    })

  // Configurar React Hook Form con Zod
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      passwordConfirm: "",
      termsAccepted: false,
      rulesAccepted: false,
    },
  })

  // Observar el valor de termsAccepted y rulesAccepted
  const watchedTermsAccepted = watch("termsAccepted")
  const watchedRulesAccepted = watch("rulesAccepted")

  // Manejar envío del formulario
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    setSubmitError("")

    // Verificar si los términos han sido aceptados
    if (!data.termsAccepted) {
      setSubmitError(t.termsRequired)
      setIsSubmitting(false)
      return
    }

    // Verificar si el reglamento ha sido aceptado
    if (!data.rulesAccepted) {
      setSubmitError(t.rulesRequired)
      setIsSubmitting(false)
      return
    }

    try {
      // Eliminar la ejecución de reCAPTCHA
      // Preparar los datos para enviar al servidor sin token de reCAPTCHA
      const formData = {
        username: data.username,
        password: data.password,
        passwordConfirm: data.passwordConfirm,
        email: data.email,
      }

      console.log("Enviando datos:", formData) // Log para depuración

      // Usar una ruta absoluta para la API
      const response = await fetch("/api/register", {
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
        // Manejar diferentes tipos de errores
        if (result.error === "Datos inválidos") {
          console.error("Error de validación:", result.details)
          setSubmitError(t.validationError)
        } else if (result.error === "El usuario ya existe") {
          setSubmitError(t.userExists)
        } else if (result.error === "Error en la base de datos") {
          console.error("Error de base de datos:", result.details)
          setSubmitError(`${t.serverError} (${result.details})`)
        } else {
          setSubmitError(result.error || t.error)
        }
        return
      }

      // Registro exitoso
      if (result.requiresVerification) {
        setRequiresVerification(true)
        console.log("Registro iniciado, requiere verificación:", result.message)
      } else {
        setSubmitSuccess(true)
        console.log("Registro exitoso:", result.message)
        // Redirigir después de un breve retraso
        setTimeout(() => {
          router.push(`/${lang}/inicio-sesion`)
        }, 2000)
      }
    } catch (error: any) {
      console.error("Error al registrar:", error)
      setSubmitError(error.message || t.serverError)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Eliminar el Script de reCAPTCHA */}

      <Card className="bg-bunker-800/90 backdrop-blur-sm border border-gold-700/30">
        <CardContent className="p-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Nombre de usuario */}
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

            {/* Correo electrónico */}
            <div className="space-y-1">
              <Label htmlFor="email" className="text-gold-300">
                {t.email}
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold-500/70">
                  <Mail className="h-5 w-5" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder={t.emailPlaceholder}
                  {...register("email")}
                  className={`bg-bunker-900/80 border-gold-700/30 text-gold-100 placeholder:text-gold-500/50 focus:border-gold-500 pl-10 ${
                    errors.email ? "border-red-500" : ""
                  }`}
                  disabled={isSubmitting}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Contraseña */}
            <div className="space-y-1">
              <Label htmlFor="password" className="text-gold-300">
                {t.password}
              </Label>
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

            {/* Confirmar contraseña */}
            <div className="space-y-1">
              <Label htmlFor="passwordConfirm" className="text-gold-300">
                {t.confirmPassword}
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold-500/70">
                  <Lock className="h-5 w-5" />
                </div>
                <Input
                  id="passwordConfirm"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={t.confirmPasswordPlaceholder}
                  {...register("passwordConfirm")}
                  className={`bg-bunker-900/80 border-gold-700/30 text-gold-100 placeholder:text-gold-500/50 focus:border-gold-500 pl-10 pr-10 ${
                    errors.passwordConfirm ? "border-red-500" : ""
                  }`}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gold-500/70 hover:text-gold-400"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? t.hidePassword : t.showPassword}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.passwordConfirm && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.passwordConfirm.message}
                </p>
              )}
            </div>

            {/* Términos y Condiciones */}
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="termsAccepted"
                  checked={watchedTermsAccepted}
                  onCheckedChange={(checked) => {
                    setValue("termsAccepted", !!checked)
                    setTermsAccepted(!!checked)
                  }}
                  className="data-[state=checked]:bg-gold-600 data-[state=checked]:border-gold-600 border-gold-700/30"
                  disabled={isSubmitting}
                />
                <Label htmlFor="termsAccepted" className="text-gold-300 text-sm cursor-pointer">
                  {t.termsAcceptance}{" "}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-gold-500 hover:text-gold-400 underline font-medium"
                  >
                    {t.termsAndConditions}
                  </button>
                </Label>
              </div>
              {errors.termsAccepted && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.termsAccepted.message}
                </p>
              )}
            </div>

            {/* Reglamento de Juego */}
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rulesAccepted"
                  checked={watchedRulesAccepted}
                  onCheckedChange={(checked) => {
                    setValue("rulesAccepted", !!checked)
                    setRulesAccepted(!!checked)
                  }}
                  className="data-[state=checked]:bg-gold-600 data-[state=checked]:border-gold-600 border-gold-700/30"
                  disabled={isSubmitting}
                />
                <Label htmlFor="rulesAccepted" className="text-gold-300 text-sm cursor-pointer">
                  {t.rulesAcceptance}{" "}
                  <button
                    type="button"
                    onClick={() => setShowRulesModal(true)}
                    className="text-gold-500 hover:text-gold-400 underline font-medium"
                  >
                    {t.gameRules}
                  </button>
                </Label>
              </div>
              {errors.rulesAccepted && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.rulesAccepted.message}
                </p>
              )}
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

            {requiresVerification && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-900/30 border border-blue-500/30 text-blue-300 p-4 rounded-md space-y-2"
              >
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  <span className="font-medium">{t.verificationSent}</span>
                </div>
                <p className="text-sm text-blue-200">{t.checkEmail}</p>
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

            {/* Botón de registro */}
            <div className="pt-2">
              <button type="submit" disabled={isSubmitting} className="golden-button w-full">
                {isSubmitting ? t.registering : t.register}
              </button>
            </div>

            {/* Enlace para iniciar sesión */}
            <div className="text-center text-gold-300 mt-4">
              <p>
                {t.alreadyHaveAccount}{" "}
                <Link
                  href={`/${lang}/inicio-sesion`}
                  className="text-gold-500 hover:text-gold-400 font-medium underline"
                >
                  {t.login}
                </Link>
              </p>
            </div>

            {/* Eliminar el Badge de reCAPTCHA */}
          </form>
        </CardContent>
      </Card>
      
      {/* Modal de Términos y Condiciones */}
      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        lang={lang}
        termsContent={dictionary?.registro?.termsContent || ""}
        termsTitle={dictionary?.registro?.termsModalTitle || "Términos y Condiciones"}
      />

      {/* Modal de Reglamento de Juego */}
      <RulesModal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
        lang={lang}
        rulesContent={dictionary?.registro?.rulesContent || ""}
        rulesTitle={dictionary?.registro?.rulesModalTitle || "Reglamento de Juego"}
      />
    </>
  )
}
