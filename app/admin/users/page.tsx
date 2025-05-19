"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/admin/dashboard-layout"
import { Search, RefreshCw, Wifi, WifiOff } from "lucide-react"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [refreshing, setRefreshing] = useState(false)

  async function fetchData() {
    try {
      setRefreshing(true)
      const response = await fetch("/api/admin/users")
      if (!response.ok) throw new Error("Error al cargar usuarios")
      const data = await response.json()
      if (data.success) {
        setUsers(data.users)
      } else {
        console.error("Error:", data.error)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredUsers = users.filter(
    (user) =>
      user.memb___id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.ServerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.IP?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      return dateString || "N/A"
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
            className="text-2xl font-bold text-white"
            style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
          >
            Estado de Usuarios
          </h1>
          <button
            onClick={fetchData}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gold-600 hover:bg-gold-700 text-bunker-950 rounded-md transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Actualizar
          </button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-5 w-5 text-bunker-400" />
          </div>
          <input
            type="text"
            className="bg-bunker-800 border border-bunker-700 text-white text-sm rounded-lg focus:ring-gold-500 focus:border-gold-500 block w-full pl-10 p-2.5"
            placeholder="Buscar por usuario, servidor o IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-20 text-bunker-400">
            {searchTerm ? "No se encontraron usuarios que coincidan con la búsqueda" : "No hay usuarios registrados"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-bunker-300">
              <thead className="text-xs uppercase bg-bunker-800 text-bunker-300 border-b border-bunker-700">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Usuario
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Servidor
                  </th>
                  <th scope="col" className="px-6 py-3">
                    IP
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Última Conexión
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, i) => (
                  <tr key={i} className="border-b border-bunker-700 hover:bg-bunker-800">
                    <td className="px-6 py-4">
                      {user.ConnectStat === 1 ? (
                        <div className="flex items-center">
                          <Wifi className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-green-500">Online</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <WifiOff className="h-4 w-4 text-red-500 mr-2" />
                          <span className="text-red-500">Offline</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium">{user.memb___id}</td>
                    <td className="px-6 py-4">{user.ServerName || "N/A"}</td>
                    <td className="px-6 py-4">{user.IP || "N/A"}</td>
                    <td className="px-6 py-4">{formatDate(user.ConnectTM)}</td>
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
