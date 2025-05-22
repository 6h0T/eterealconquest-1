import { Suspense } from "react"
import ResetPasswordForm from "@/components/reset-password-form"
import type { Locale } from "@/i18n/config"
import { VimeoBackground } from "@/components/vimeo-background"

export default function ResetPasswordPage() {
  return (
    <div className="pt-32 pb-8 relative overflow-hidden">
      {/* Fondo con video de Vimeo */}
      <VimeoBackground videoId="1074465089" />
      
      <div className="container mx-auto px-4 relative z-20">
        <div className="max-w-md mx-auto relative z-30">
          <h1 className="text-2xl font-bold text-center mb-6 gold-gradient-text">Restablecer Contraseña</h1>
          <Suspense fallback={<div>Cargando...</div>}>
            <div className="relative z-40">
              <ResetPasswordForm />
            </div>
          </Suspense>
        </div>
      </div>
    </div>
  )
}
