"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/admin/dashboard-layout"
import { Ban, RefreshCw } from "lucide-react"

export default function AdminBanPage() {
  const [banned, setBanned] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBanned()
  }, [])

  const fetchBanned = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/admin/banlist")
      const data = await response.json()

      if (data.success) {
        setBanned(data.bans || [])
      } else {
        setError(data.error || "Error al cargar usuarios baneados")
      }
    } catch (error) {
      console.error("Error:", error)
      setError("Error al conectar con el servidor")
    } finally {
      setLoading(false)
    }
  }

  const getBanReason = (blocCode: number) => {
    switch (blocCode) {
      case 1:
        return "Violación de reglas"
      case 2:
        return "Uso de hacks"
      case 3:
        return "Comportamiento inapropiado"
      default:
        return "Razón desconocida"
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
            <Ban className="h-6 w-6 text-red-500" />
            Cuentas Baneadas
          </h1>
          <button
            onClick={fetchBanned}
            className="flex items-center gap-2 px-4 py-2 bg-bunker-800 hover:bg-bunker-700 text-white rounded-lg transition-colors"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-400">
            <p>{error}</p>
            <button
              onClick={fetchBanned}
              className="mt-4 px-4 py-2 bg-bunker-800 hover:bg-bunker-700 text-white rounded-lg transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : banned.length === 0 ? (
          <div className="text-center py-20 text-bunker-400">No hay cuentas baneadas actualmente</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-bunker-300">
              <thead className="text-xs uppercase bg-bunker-800 text-bunker-300 border-b border-bunker-700">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Cuenta
                  </th>
                  <th scope="col" className="px-6 py-3 text-center">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Razón
                  </th>
                </tr>
              </thead>
              <tbody>
                {banned.map((user, i) => (
                  <tr key={i} className="border-b border-bunker-700 hover:bg-bunker-800">
                    <td className="px-6 py-4 font-medium">{user.memb___id}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-1 text-xs font-medium text-white rounded-full bg-red-500">Baneado</span>
                    </td>
                    <td className="px-6 py-4">{getBanReason(user.bloc_code)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
