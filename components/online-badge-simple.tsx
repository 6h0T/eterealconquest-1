"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Users } from "lucide-react"

export default function OnlineBadgeSimple() {
  const [online, setOnline] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchOnline = async () => {
    try {
      setLoading(true)
      // Añadir un parámetro de timestamp para evitar caché
      const res = await fetch(`/api/online-count?t=${Date.now()}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      })

      if (!res.ok) {
        throw new Error(`Error HTTP: ${res.status}`)
      }

      const data = await res.json()

      if (data.success) {
        setOnline(data.count)
      } else {
        console.error("Error en respuesta:", data.error)
      }
    } catch (err) {
      console.error("Error fetching online count:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Cargar datos inmediatamente al montar el componente
    fetchOnline()

    // Actualizar cada 4 minutos (240000 ms) en lugar de 15 segundos
    const interval = setInterval(fetchOnline, 240000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Badge
      className="bg-green-600 hover:bg-green-700 text-white border-none flex items-center gap-1 px-3 py-1 transition-colors duration-200 cursor-pointer"
      onClick={fetchOnline} // Permitir actualización manual al hacer clic
    >
      <Users className="h-3.5 w-3.5 mr-1" />
      <span className="font-medium">Online:</span>
      {loading ? (
        <span className="animate-pulse ml-1">...</span>
      ) : (
        <span className="ml-1">{online !== null ? online : "0"}</span>
      )}
    </Badge>
  )
}
