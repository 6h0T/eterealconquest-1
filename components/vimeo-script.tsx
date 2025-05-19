"use client"

import Script from "next/script"
import { useEffect } from "react"

export function VimeoScript() {
  useEffect(() => {
    // Verificar si el script ya está cargado
    const isScriptLoaded = document.querySelector('script[src="https://player.vimeo.com/api/player.js"]')

    if (!isScriptLoaded && typeof window !== "undefined") {
      // Crear y cargar el script manualmente si no está cargado
      const script = document.createElement("script")
      script.src = "https://player.vimeo.com/api/player.js"
      script.async = true
      script.onload = () => {
        console.log("Script de Vimeo cargado manualmente")
        window.dispatchEvent(new Event("vimeoApiReady"))
      }
      document.body.appendChild(script)
    }
  }, [])

  return (
    <Script
      src="https://player.vimeo.com/api/player.js"
      strategy="beforeInteractive"
      onLoad={() => {
        console.log("Script de Vimeo cargado correctamente")
        // Disparar un evento personalizado cuando el script se cargue
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("vimeoApiReady"))
        }
      }}
    />
  )
}
