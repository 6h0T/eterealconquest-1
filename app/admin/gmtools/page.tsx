"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/admin/dashboard-layout"
import { Shield, RefreshCw } from "lucide-react"

export default function AdminGMsPage() {
  const [gms, setGMs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchGMs()
  }, [])

  const fetchGMs = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/admin/gms")
      const data = await response.json()

      if (data.success) {
        setGMs(data.gms || [])
      } else {
        setError(data.error || "Error al cargar GMs")
      }
    } catch (error) {
      console.error("Error:", error)
      setError("Error al conectar con el servidor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div
        className="p-6 bg-bunker-900 rounded-lg shadow-lg"
        style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
      >
        <div className="flex justify-between items-center mb-6">
          <h1
            className="text-2xl font-bold text-white flex items-center gap-2"
            style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
          >
            <Shield className="h-6 w-6 text-gold-500" />
            Game Masters
          </h1>
          <button
            onClick={fetchGMs}
            className="flex items-center gap-2 px-4 py-2 bg-bunker-800 hover:bg-bunker-700 text-white rounded-lg transition-colors"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-400">
            <p>{error}</p>
            <button
              onClick={fetchGMs}
              className="mt-4 px-4 py-2 bg-bunker-800 hover:bg-bunker-700 text-white rounded-lg transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : gms.length === 0 ? (
          <div className="text-center py-20 text-bunker-400">No hay Game Masters registrados</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gms.map((gm, i) => (
              <div key={i} className="bg-bunker-800 p-4 rounded-lg border border-bunker-700 flex items-center gap-3">
                <div className="bg-bunker-700 p-2 rounded-full">
                  <Shield className="h-6 w-6 text-gold-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-medium">{gm.name || gm.Name}</span>
                  <span className="text-bunker-400 text-xs">{gm.memb___id}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
