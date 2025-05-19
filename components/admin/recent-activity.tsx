"use client"

import { useEffect, useState } from "react"
import { UserIcon, Clock } from "lucide-react"

interface User {
  username: string
  email: string
  registeredAt: string
}

export function RecentActivity() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch("/api/admin/recent-activity")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUsers(data.data)
        } else {
          setError(data.error || "Error al cargar los datos")
        }
      })
      .catch((err) => {
        console.error("Error cargando actividad reciente:", err)
        setError("No se pudo cargar la actividad reciente")
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <div className="bg-bunker-800 rounded-lg border border-bunker-700 shadow-sm p-6">
      <h2
        className="text-lg font-medium text-gray-100 mb-4"
        style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
      >
        Actividad Reciente
      </h2>

      {loading && (
        <div className="py-8 flex justify-center items-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
        </div>
      )}

      {error && !loading && (
        <div className="py-4 text-center">
          <p className="text-red-400 text-sm" style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}>
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-xs text-blue-400 hover:text-blue-300"
            style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
          >
            Intentar nuevamente
          </button>
        </div>
      )}

      {!loading && !error && users.length === 0 && (
        <div
          className="py-8 text-center text-gray-500"
          style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
        >
          No hay actividad reciente para mostrar
        </div>
      )}

      {!loading && !error && users.length > 0 && (
        <ul className="divide-y divide-bunker-700">
          {users.map((user, idx) => (
            <li key={idx} className="py-3">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-blue-900/30 flex items-center justify-center">
                    <UserIcon className="h-4 w-4 text-blue-400" />
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <p
                      className="text-sm font-medium text-gray-200"
                      style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
                    >
                      {user.username}
                    </p>
                    <p
                      className="text-xs text-gray-500 flex items-center"
                      style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDate(user.registeredAt)}
                    </p>
                  </div>
                  <p
                    className="text-xs text-gray-400 mt-1"
                    style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
                  >
                    {user.email}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
