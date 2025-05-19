"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { AnimatePresence } from "framer-motion"
import { Preloader } from "./preloader"

interface PreloaderWrapperProps {
  children: React.ReactNode
}

export function PreloaderWrapper({ children }: PreloaderWrapperProps) {
  const [showPreloader, setShowPreloader] = useState(false)

  useEffect(() => {
    // Verificar si es la primera visita
    const hasVisited = localStorage.getItem("hasVisitedSite")

    if (!hasVisited) {
      // Primera visita: mostrar preloader
      setShowPreloader(true)
      document.body.style.overflow = "hidden"

      // Marcar que ya ha visitado el sitio
      localStorage.setItem("hasVisitedSite", "true")
    } else {
      // Ya ha visitado: no mostrar preloader
      setShowPreloader(false)
      document.body.style.overflow = "auto"
    }
  }, [])

  // Función para manejar cuando el preloader ha completado
  const handleLoadingComplete = () => {
    setShowPreloader(false)
    document.body.style.overflow = "auto"
  }

  return (
    <>
      <AnimatePresence>{showPreloader && <Preloader onLoadingComplete={handleLoadingComplete} />}</AnimatePresence>

      <div style={{ visibility: showPreloader ? "hidden" : "visible" }}>{children}</div>
    </>
  )
}
