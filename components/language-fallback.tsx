"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface LanguageFallbackProps {
  onRetry: () => void
}

export function LanguageFallback({ onRetry }: LanguageFallbackProps) {
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      onRetry()
    }
  }, [countdown, onRetry])

  return (
    <div className="fixed inset-0 bg-bunker-950 flex items-center justify-center z-50 p-4">
      <div className="bg-bunker-800 p-6 rounded-lg border border-gold-700/30 max-w-md text-center">
        <AlertTriangle className="h-12 w-12 text-gold-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gold-300 mb-2">Error de carga</h2>
        <p className="text-gold-100 mb-4">
          No se pudo cargar el diccionario de idiomas. Esto puede deberse a problemas de conexión.
        </p>
        <p className="text-gold-400 mb-6">Reintentando automáticamente en {countdown} segundos...</p>
        <Button onClick={onRetry} className="bg-gold-600 text-bunker-950 hover:bg-gold-500">
          Reintentar ahora
        </Button>
      </div>
    </div>
  )
}
