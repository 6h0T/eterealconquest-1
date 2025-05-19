"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/admin/dashboard-layout"
import { TotalUsers } from "@/components/admin/total-users"
import { NewsManager } from "@/components/admin/news-manager"
import { Activity, ChevronRight, RefreshCw, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const [bannedUsers, setBannedUsers] = useState([])
  const [users, setUsers] = useState([])
  const [activeUsers, setActiveUsers] = useState(0)
  const [activeUsersTrend, setActiveUsersTrend] = useState(0)
  const [loading, setLoading] = useState({
    banned: false,
    users: false,
    activeUsers: false,
  })
  const [searchTerm, setSearchTerm] = useState("")

  // Cargar usuarios baneados
  const fetchBannedUsers = async () => {
    setLoading((prev) => ({ ...prev, banned: true }))
    try {
      const response = await fetch("/api/admin/banned")
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setBannedUsers(data.bans || [])
        }
      }
    } catch (error) {
      console.error("Error al cargar usuarios baneados:", error)
    } finally {
      setLoading((prev) => ({ ...prev, banned: false }))
    }
  }

  // Cargar usuarios
  const fetchUsers = async () => {
    setLoading((prev) => ({ ...prev, users: true }))
    try {
      const response = await fetch("/api/admin/users")
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUsers(data.users || [])
        }
      }
    } catch (error) {
      console.error("Error al cargar usuarios:", error)
    } finally {
      setLoading((prev) => ({ ...prev, users: false }))
    }
  }

  // Cargar usuarios activos
  const fetchActiveUsers = async () => {
    setLoading((prev) => ({ ...prev, activeUsers: true }))
    try {
      const response = await fetch("/api/admin/active-users")
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setActiveUsers(data.activeUsers || 0)
          setActiveUsersTrend(data.trend || 0)
        }
      }
    } catch (error) {
      console.error("Error al cargar usuarios activos:", error)
    } finally {
      setLoading((prev) => ({ ...prev, activeUsers: false }))
    }
  }

  useEffect(() => {
    fetchBannedUsers()
    fetchUsers()
    fetchActiveUsers()
  }, [])

  // Filtrar usuarios
  const filteredUsers = users
    .filter(
      (user) =>
        user.memb___id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.memb_name?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .slice(0, 5) // Mostrar solo los primeros 5

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch (error) {
      return dateString || "N/A"
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Encabezado y Estadísticas */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          {/* Título del Dashboard */}
          <div className="md:w-1/3">
            <h1 className="text-2xl font-medium text-gray-100">Dashboard</h1>
            <p className="text-sm text-gray-400 mt-1">Bienvenido al panel de administración unificado</p>
          </div>

          {/* Sección de Estadísticas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:w-2/3">
            <TotalUsers />

            <Card className="bg-bunker-800 border-bunker-700">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-sm font-medium text-gray-400">Usuarios Activos</CardTitle>
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 mr-1 text-gray-400 hover:text-gray-100"
                      onClick={fetchActiveUsers}
                      disabled={loading.activeUsers}
                    >
                      <RefreshCw className={`h-4 w-4 ${loading.activeUsers ? "animate-spin" : ""}`} />
                    </Button>
                    <Activity className="h-5 w-5 text-gold-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading.activeUsers ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gold-500"></div>
                    <span className="text-gray-400 text-sm">Cargando...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-semibold text-gray-100">{activeUsers}</div>
                    <div
                      className={`flex items-center text-xs ${activeUsersTrend >= 0 ? "text-green-400" : "text-red-400"} mt-2`}
                    >
                      <Activity className="h-3 w-3 mr-1" />
                      <span>
                        {activeUsersTrend >= 0 ? "+" : ""}
                        {activeUsersTrend}% desde la semana pasada
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Gestor de Noticias (Versión Resumida) */}
        <Card className="bg-bunker-800 border-bunker-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl text-gray-100">Gestor de Noticias</CardTitle>
              <CardDescription className="text-gray-400">Crea y administra noticias para el sitio</CardDescription>
            </div>
            <Link href="/admin/dashboard/news">
              <Button variant="outline" className="bg-bunker-700 hover:bg-bunker-600 text-gray-200">
                Ver Completo <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] overflow-y-auto">
              <NewsManager compact={true} />
            </div>
          </CardContent>
        </Card>

        {/* Usuarios Baneados (Versión Resumida) */}
        <Card className="bg-bunker-800 border-bunker-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl text-gray-100">Usuarios Baneados</CardTitle>
              <CardDescription className="text-gray-400">Listado de cuentas suspendidas</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="bg-bunker-700 hover:bg-bunker-600"
                onClick={fetchBannedUsers}
                disabled={loading.banned}
              >
                <RefreshCw className={`h-4 w-4 ${loading.banned ? "animate-spin" : ""}`} />
              </Button>
              <Link href="/admin/ban">
                <Button variant="outline" className="bg-bunker-700 hover:bg-bunker-600 text-gray-200">
                  Ver Completo <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loading.banned ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold-500"></div>
              </div>
            ) : bannedUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No hay usuarios baneados actualmente</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-bunker-300">
                  <thead className="text-xs uppercase bg-bunker-700 text-bunker-300">
                    <tr>
                      <th scope="col" className="px-6 py-3">
                        Usuario
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Código de Bloqueo
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bannedUsers.slice(0, 5).map((user, index) => (
                      <tr key={index} className="border-b border-bunker-700 hover:bg-bunker-700">
                        <td className="px-6 py-3 font-medium">{user.memb___id}</td>
                        <td className="px-6 py-3">{user.bloc_code}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {bannedUsers.length > 5 && (
                  <div className="text-center mt-4 text-sm text-gray-400">
                    Mostrando 5 de {bannedUsers.length} usuarios baneados
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lista de Usuarios (Versión Resumida) */}
        <Card className="bg-bunker-800 border-bunker-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl text-gray-100">Usuarios Registrados</CardTitle>
              <CardDescription className="text-gray-400">Listado de cuentas en el servidor</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-48">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar usuario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full bg-bunker-700 border border-bunker-600 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                className="bg-bunker-700 hover:bg-bunker-600"
                onClick={fetchUsers}
                disabled={loading.users}
              >
                <RefreshCw className={`h-4 w-4 ${loading.users ? "animate-spin" : ""}`} />
              </Button>
              <Link href="/admin/users">
                <Button variant="outline" className="bg-bunker-700 hover:bg-bunker-600 text-gray-200">
                  Ver Completo <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loading.users ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold-500"></div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                {searchTerm
                  ? "No se encontraron usuarios que coincidan con la búsqueda"
                  : "No hay usuarios registrados"}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-bunker-300">
                  <thead className="text-xs uppercase bg-bunker-700 text-bunker-300">
                    <tr>
                      <th scope="col" className="px-6 py-3">
                        Login
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Nombre
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Fecha de Registro
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user, index) => (
                      <tr key={index} className="border-b border-bunker-700 hover:bg-bunker-700">
                        <td className="px-6 py-3 font-medium">{user.memb___id}</td>
                        <td className="px-6 py-3">{user.memb_name}</td>
                        <td className="px-6 py-3">{formatDate(user.memb_reg_date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length > 5 && (
                  <div className="text-center mt-4 text-sm text-gray-400">
                    Mostrando {Math.min(5, filteredUsers.length)} de {users.length} usuarios registrados
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
