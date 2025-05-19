"use client"

import type { ReactNode } from "react"
import { Inter } from "next/font/google"
import "../globals.css" // Aseguramos que se carguen los estilos globales

// Configuración de la fuente Inter
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
})

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  // Aplicamos solo la fuente Inter y sobrescribimos cualquier herencia de fuente
  return (
    <div
      className={`min-h-screen bg-bunker-950 ${inter.variable}`}
      style={{
        fontFamily: "var(--font-inter), system-ui, sans-serif",
      }}
    >
      <style jsx global>{`
        h1, h2, h3, h4, h5, h6, p, span, div, button, a {
          font-family: var(--font-inter), system-ui, sans-serif !important;
        }
      `}</style>
      {children}
    </div>
  )
}
