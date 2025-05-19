"use client"

import { useState, useEffect } from "react"
import { Users } from "lucide-react"

export function TotalUsers() {
  const [total, setTotal] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch("/api/admin/total-users")
      .then(async (res) => {
        // Verificar si la respuesta es exitosa
        if (!res.ok) {
          const errorText = await res.text()
          throw new Error(`Error ${res.status}: ${errorText}`)
        }
        return res.json()
      })
      .then((data) => {
        if (data.success) {
          setTotal(data.total)
        } else {
          setError(data.error || "Error al cargar el total de usuarios")
        }
      })
      .catch((err) => {
        console.error("Error cargando total de usuarios:", err)
        setError("No se pudo cargar el total de usuarios")
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return (
    <div
      className="bg-bunker-800 rounded-lg border border-bunker-700 shadow-sm p-6"
      style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
    >
      <div className="flex justify-between items-start">
        <h3
          className="text-sm font-medium text-gray-400"
          style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
        >
          Total de Usuarios
        </h3>
        <Users className="h-5 w-5 text-gold-500" />
      </div>
      <div className="mt-2">
        {loading ? (
          <div className="animate-pulse h-6 bg-bunker-700 rounded-full w-24"></div>
        ) : error ? (
          <p className="text-red-400 text-sm" style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}>
            {error}
          </p>
        ) : (
          <div
            className="text-2xl font-semibold text-gray-100"
            style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
          >
            {total}
          </div>
        )}
      </div>
    </div>
  )
}
