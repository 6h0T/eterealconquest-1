"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Lock, Mail, AlertTriangle, Check, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Locale } from "@/i18n/config"

interface UserSettingsProps {
  username: string
  lang: Locale
}

export function UserSettings({ username, lang }: UserSettingsProps) {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [currentPassword, setCurrentPassword] = useState("") // Para cambio de contraseña
  const [newEmail, setNewEmail] = useState("")
  const [emailCurrentPassword, setEmailCurrentPassword] = useState("") // Para cambio de email
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [emailSuccess, setEmailSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)

  // Traducciones específicas para la configuración
  const translations = {
    es: {
      settings: "Configuración de la Cuenta",
      changePassword: "Cambiar Contraseña",
      newPassword: "Nueva contraseña",
      confirmPassword: "Confirmar contraseña",
      currentPassword: "Contraseña actual",
      changeEmail: "Cambiar Correo Electrónico",
      newEmail: "Nuevo correo electrónico",
      emailCurrentPassword: "Contraseña actual",
      save: "Guardar",
      saving: "Guardando...",
      passwordSuccess: "Contraseña cambiada con éxito",
      emailSuccess: "Correo electrónico cambiado con éxito",
      passwordError: "Error al cambiar la contraseña",
      emailError: "Error al cambiar el correo electrónico",
      emailInUse: "El correo electrónico ya está en uso",
      passwordMismatch: "Las contraseñas no coinciden",
      passwordRequired: "La contraseña es requerida",
      passwordLength: "La contraseña debe tener al menos 6 caracteres",
      emailRequired: "El correo electrónico es requerido",
      emailInvalid: "El correo electrónico no es válido",
      currentPasswordRequired: "La contraseña actual es requerida",
      signOut: "Cerrar Sesión",
      signOutConfirm: "¿Estás seguro de que deseas cerrar sesión de tu cuenta?",
      serverError: "Error del servidor",
      unknownError: "Error desconocido",
    },
    en: {
      settings: "Account Settings",
      changePassword: "Change Password",
      newPassword: "New password",
      confirmPassword: "Confirm password",
      currentPassword: "Current password",
      changeEmail: "Change Email Address",
      newEmail: "New email address",
      emailCurrentPassword: "Current password",
      save: "Save",
      saving: "Saving...",
      passwordSuccess: "Password changed successfully",
      emailSuccess: "Email address changed successfully",
      passwordError: "Error changing password",
      emailError: "Error changing email address",
      emailInUse: "Email is already in use",
      passwordMismatch: "Passwords do not match",
      passwordRequired: "Password is required",
      passwordLength: "Password must be at least 6 characters",
      emailRequired: "Email is required",
      emailInvalid: "Email is invalid",
      currentPasswordRequired: "Current password is required",
      signOut: "Sign Out",
      signOutConfirm: "Are you sure you want to sign out of your account?",
      serverError: "Server error",
      unknownError: "Unknown error",
    },
    pt: {
      settings: "Configurações da Conta",
      changePassword: "Alterar Senha",
      newPassword: "Nova senha",
      confirmPassword: "Confirmar senha",
      currentPassword: "Senha atual",
      changeEmail: "Alterar Endereço de Email",
      newEmail: "Novo endereço de email",
      emailCurrentPassword: "Senha atual",
      save: "Salvar",
      saving: "Salvando...",
      passwordSuccess: "Senha alterada com sucesso",
      emailSuccess: "Endereço de email alterado com sucesso",
      passwordError: "Erro ao alterar senha",
      emailError: "Erro ao alterar endereço de email",
      emailInUse: "O email já está em uso",
      passwordMismatch: "As senhas não coincidem",
      passwordRequired: "A senha é obrigatória",
      passwordLength: "A senha deve ter pelo menos 6 caracteres",
      emailRequired: "O email é obrigatório",
      emailInvalid: "O email é inválido",
      currentPasswordRequired: "A senha atual é obrigatória",
      signOut: "Sair",
      signOutConfirm: "Tem certeza que deseja sair da sua conta?",
      serverError: "Erro do servidor",
      unknownError: "Erro desconhecido",
    },
  }

  const t = translations[lang as keyof typeof translations]

  // Función para cambiar la contraseña con manejo de errores mejorado
  const handleChangePassword = async () => {
    // Validación básica
    if (!currentPassword) {
      setPasswordError(t.currentPasswordRequired)
      return
    }

    if (!newPassword) {
      setPasswordError(t.passwordRequired)
      return
    }

    if (newPassword.length < 6) {
      setPasswordError(t.passwordLength)
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(t.passwordMismatch)
      return
    }

    setPasswordLoading(true)
    setPasswordError(null)

    try {
      const response = await fetch("/api/user/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          newPassword,
          currentPassword,
        }),
      })

      if (!response.ok) {
        throw new Error(t.serverError)
      }

      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        console.error("Error parsing JSON response:", jsonError)
        throw new Error(t.serverError)
      }

      if (!data?.success) {
        throw new Error(data?.error || t.unknownError)
      }

      // Éxito
      setPasswordSuccess(true)
      setNewPassword("")
      setConfirmPassword("")
      setCurrentPassword("")

      // Mostrar una alerta de éxito
      alert(t.passwordSuccess)

      // Ocultar el mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setPasswordSuccess(false)
      }, 3000)
    } catch (err: any) {
      console.error("Error changing password:", err)
      setPasswordError(err.message || t.passwordError)
    } finally {
      setPasswordLoading(false)
    }
  }

  // Función para cambiar el correo electrónico con manejo de errores mejorado
  const handleChangeEmail = async () => {
    // Validación básica
    if (!newEmail) {
      setEmailError(t.emailRequired)
      return
    }

    // Validación simple de email
    if (!/\S+@\S+\.\S+/.test(newEmail)) {
      setEmailError(t.emailInvalid)
      return
    }

    // Validar que se haya ingresado la contraseña actual
    if (!emailCurrentPassword) {
      setEmailError(t.currentPasswordRequired)
      return
    }

    setEmailLoading(true)
    setEmailError(null)

    try {
      const response = await fetch("/api/user/myemail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password: emailCurrentPassword,
          newEmail,
        }),
      })

      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        console.error("Error parsing JSON response:", jsonError)
        throw new Error(t.serverError)
      }

      if (!data?.success) {
        // Manejar otros errores de manera genérica
        throw new Error(data?.error || t.unknownError)
      }

      // Éxito
      setEmailSuccess(true)
      setNewEmail("")
      setEmailCurrentPassword("")

      // Mostrar una alerta de éxito
      alert(t.emailSuccess)

      // Actualizar el email en localStorage si se usa para mostrar información
      localStorage.setItem("userEmail", newEmail)

      // Ocultar el mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setEmailSuccess(false)
      }, 3000)
    } catch (err: any) {
      console.error("Error changing email:", err)
      setEmailError(err.message || t.emailError)
    } finally {
      setEmailLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-6">
        {/* Cambiar contraseña */}
        <Card className="bg-bunker-800/90 backdrop-blur-sm border border-gold-700/30 overflow-hidden shadow-lg">
          <CardHeader className="bg-bunker-950/30 border-b border-gold-700/20 pb-3">
            <CardTitle className="text-gold-400 flex items-center text-xl">
              <Lock className="h-5 w-5 mr-2" />
              {t.changePassword}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {passwordSuccess && (
              <div className="mb-4 p-3 bg-green-900/30 border border-green-500/30 text-green-300 rounded-md flex items-center">
                <Check className="h-5 w-5 mr-2" />
                {t.passwordSuccess}
              </div>
            )}
            {passwordError && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-500/30 text-red-300 rounded-md flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                {passwordError}
              </div>
            )}

            <div className="space-y-4">
              {/* Campo para la contraseña actual */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-gold-300 flex items-center">
                  <Lock className="h-4 w-4 mr-2 opacity-70" />
                  {t.currentPassword}
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-bunker-900 border-gold-700/30 text-gold-100 focus:border-gold-500 focus:ring-gold-500/20 transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-gold-300 flex items-center">
                  <Lock className="h-4 w-4 mr-2 opacity-70" />
                  {t.newPassword}
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-bunker-900 border-gold-700/30 text-gold-100 focus:border-gold-500 focus:ring-gold-500/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gold-300 flex items-center">
                  <Lock className="h-4 w-4 mr-2 opacity-70" />
                  {t.confirmPassword}
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-bunker-900 border-gold-700/30 text-gold-100 focus:border-gold-500 focus:ring-gold-500/20 transition-all"
                />
              </div>
              <Button
                onClick={handleChangePassword}
                disabled={passwordLoading}
                className="bg-gold-600 text-bunker-950 hover:bg-gold-500 shadow-md shadow-gold-700/20 border border-gold-500/50 mt-2"
              >
                {passwordLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin h-4 w-4 border-2 border-bunker-950 rounded-full border-t-transparent mr-2" />
                    {t.saving}
                  </div>
                ) : (
                  <span className="flex items-center">
                    <Lock className="h-4 w-4 mr-2" />
                    {t.save}
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Cambiar correo electrónico */}
        <Card className="bg-bunker-800/90 backdrop-blur-sm border border-gold-700/30 overflow-hidden shadow-lg">
          <CardHeader className="bg-bunker-950/30 border-b border-gold-700/20 pb-3">
            <CardTitle className="text-gold-400 flex items-center text-xl">
              <Mail className="h-5 w-5 mr-2" />
              {t.changeEmail}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {emailSuccess && (
              <div className="mb-4 p-3 bg-green-900/30 border border-green-500/30 text-green-300 rounded-md flex items-center">
                <Check className="h-5 w-5 mr-2" />
                {t.emailSuccess}
              </div>
            )}
            {emailError && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-500/30 text-red-300 rounded-md flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                {emailError}
              </div>
            )}

            <div className="space-y-4">
              {/* Campo para la contraseña actual */}
              <div className="space-y-2">
                <Label htmlFor="emailCurrentPassword" className="text-gold-300 flex items-center">
                  <Lock className="h-4 w-4 mr-2 opacity-70" />
                  {t.emailCurrentPassword}
                </Label>
                <Input
                  id="emailCurrentPassword"
                  type="password"
                  value={emailCurrentPassword}
                  onChange={(e) => setEmailCurrentPassword(e.target.value)}
                  className="bg-bunker-900 border-gold-700/30 text-gold-100 focus:border-gold-500 focus:ring-gold-500/20 transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newEmail" className="text-gold-300 flex items-center">
                  <Mail className="h-4 w-4 mr-2 opacity-70" />
                  {t.newEmail}
                </Label>
                <Input
                  id="newEmail"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="bg-bunker-900 border-gold-700/30 text-gold-100 focus:border-gold-500 focus:ring-gold-500/20 transition-all"
                />
              </div>
              <Button
                onClick={handleChangeEmail}
                disabled={emailLoading}
                className="bg-gold-600 text-bunker-950 hover:bg-gold-500 shadow-md shadow-gold-700/20 border border-gold-500/50 mt-2"
              >
                {emailLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin h-4 w-4 border-2 border-bunker-950 rounded-full border-t-transparent mr-2" />
                    {t.saving}
                  </div>
                ) : (
                  <span className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    {t.save}
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Botón de cierre de sesión */}
        <Card className="bg-bunker-800/90 backdrop-blur-sm border-red-700/30 border mt-6 overflow-hidden shadow-lg">
          <CardHeader className="bg-red-900/20 border-b border-red-700/20 pb-3">
            <CardTitle className="text-red-400 flex items-center text-xl">
              <LogOut className="h-5 w-5 mr-2" />
              {t.signOut}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-gold-100 mb-4">{t.signOutConfirm}</p>
            <Button
              onClick={() => {
                // Limpiar localStorage
                localStorage.removeItem("username")
                localStorage.removeItem("isAuthenticated")
                localStorage.removeItem("userEmail")
                localStorage.removeItem("lastLogin")

                // Redirigir a la página de inicio
                window.location.href = `/${lang}`
              }}
              className="bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-900/30 border border-red-500/50 flex items-center"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {t.signOut}
            </Button>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
