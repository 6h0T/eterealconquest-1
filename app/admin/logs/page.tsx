"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/admin/dashboard-layout"
import { FileText, RefreshCw } from "lucide-react"

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/admin/logs")
      const data = await response.json()

      if (data.success) {
        setLogs(data.logs || [])
      } else {
        setError(data.error || "Error al cargar logs")
      }
    } catch (error) {
      console.error("Error:", error)
      setError("Error al conectar con el servidor")
    } finally {
      setLoading(false)
    }
  }

  const getActionColor = (action: string) => {
    const actionLower = action?.toLowerCase() || ""
    if (actionLower.includes("login") || actionLower.includes("ingreso")) return "bg-green-500"
    if (actionLower.includes("logout") || actionLower.includes("salida")) return "bg-yellow-500"
    if (actionLower.includes("error") || actionLower.includes("fail")) return "bg-red-500"
    if (actionLower.includes("update") || actionLower.includes("actualiza")) return "bg-blue-500"
    if (actionLower.includes("create") || actionLower.includes("crea")) return "bg-purple-500"
    return "bg-gray-500"
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
            <FileText className="h-6 w-6 text-gold-500" />
            Logs de Actividad
          </h1>
          <button
            onClick={fetchLogs}
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
              onClick={fetchLogs}
              className="mt-4 px-4 py-2 bg-bunker-800 hover:bg-bunker-700 text-white rounded-lg transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-20 text-bunker-400">No hay logs de actividad disponibles</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-bunker-300">
              <thead className="text-xs uppercase bg-bunker-800 text-bunker-300 border-b border-bunker-700">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Usuario
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Acción
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Detalles
                  </th>
                  <th scope="col" className="px-6 py-3">
                    IP
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={i} className="border-b border-bunker-700 hover:bg-bunker-800">
                    <td className="px-6 py-4 font-medium">{log.AccountID || log.UserID || "Sistema"}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium text-white rounded-full ${getActionColor(log.Action)}`}
                      >
                        {log.Action || "Desconocido"}
                      </span>
                    </td>
                    <td className="px-6 py-4">{log.Details || log.Description || "-"}</td>
                    <td className="px-6 py-4">{log.IP || "-"}</td>
                    <td className="px-6 py-4">{log.Date ? new Date(log.Date).toLocaleString("es-ES") : "N/A"}</td>
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
