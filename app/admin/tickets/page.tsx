"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/admin/dashboard-layout"
import { TicketIcon, RefreshCw } from "lucide-react"

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/admin/tickets")
      const data = await response.json()

      if (data.success) {
        setTickets(data.tickets || [])
      } else {
        setError(data.error || "Error al cargar tickets")
      }
    } catch (error) {
      console.error("Error:", error)
      setError("Error al conectar con el servidor")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "abierto":
        return "bg-green-500"
      case "en proceso":
        return "bg-yellow-500"
      case "cerrado":
        return "bg-red-500"
      default:
        return "bg-gray-500"
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
            <TicketIcon className="h-6 w-6 text-gold-500" />
            Tickets de Soporte
          </h1>
          <button
            onClick={fetchTickets}
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
              onClick={fetchTickets}
              className="mt-4 px-4 py-2 bg-bunker-800 hover:bg-bunker-700 text-white rounded-lg transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-20 text-bunker-400">No hay tickets de soporte disponibles</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-bunker-300">
              <thead className="text-xs uppercase bg-bunker-800 text-bunker-300 border-b border-bunker-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-center">
                    #
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Usuario
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Título
                  </th>
                  <th scope="col" className="px-6 py-3 text-center">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket, i) => (
                  <tr key={i} className="border-b border-bunker-700 hover:bg-bunker-800">
                    <td className="px-6 py-4 text-center font-medium">{ticket.ID || i + 1}</td>
                    <td className="px-6 py-4">{ticket.AccountID || ticket.memb___id}</td>
                    <td className="px-6 py-4">{ticket.Title || ticket.Subject}</td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-2 py-1 text-xs font-medium text-white rounded-full ${getStatusColor(ticket.Status)}`}
                      >
                        {ticket.Status || "Abierto"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {ticket.DateCreated ? new Date(ticket.DateCreated).toLocaleString("es-ES") : "N/A"}
                    </td>
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
