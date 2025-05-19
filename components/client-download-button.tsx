"use client"

import { useState, useEffect } from "react"
import { DownloadModal } from "@/components/download-modal"
import type { Locale } from "@/i18n/config"

export function ClientDownloadButton({ lang }: { lang: Locale }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    // Agregar event listener para los botones de descarga con clase download-trigger
    const downloadButtons = document.querySelectorAll(".download-trigger")

    const handleDownloadClick = () => {
      setIsModalOpen(true)
    }

    downloadButtons.forEach((button) => {
      button.addEventListener("click", handleDownloadClick)
    })

    // Limpiar event listeners
    return () => {
      downloadButtons.forEach((button) => {
        button.removeEventListener("click", handleDownloadClick)
      })
    }
  }, [])

  return <DownloadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} lang={lang} />
}
