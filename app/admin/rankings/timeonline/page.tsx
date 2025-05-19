"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/admin/dashboard-layout"
import { Clock } from "lucide-react"

export default function AdminOnlineTimePage() {
  const [ranking, setRanking] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/admin/online-time")
        if (!response.ok) throw new Error("Error al cargar ranking")
        const data = await response.json()
        setRanking(data)
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const formatTime = (minutes) => {
    if (!minutes && minutes !== 0) return "N/A"

    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    return `${hours}h ${mins}m`
  }

  const getMaxMinutes = () => {
    if (!ranking.length) return 1
    return Math.max(...ranking.map((user) => user.MinOnline || 0))
  }

  const getTotalHours = () => {
    if (!ranking.length) return 0
    const totalMinutes = ranking.reduce((sum, user) => sum + (user.MinOnline || 0), 0)
    return (totalMinutes / 60).toFixed(1)
  }

  return (
    <DashboardLayout>
      <div
        className="p-6 bg-bunker-900 rounded-lg shadow-lg"
        style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1
            className="text-2xl font-bold text-white flex items-center gap-2"
            style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
          >
            <Clock className="h-6 w-6 text-gold-500" />
            Ranking por Tiempo de Juego
          </h1>

          {!loading && ranking.length > 0 && (
            <div className="bg-bunker-800 px-4 py-2 rounded-lg">
              <span className="text-bunker-400 text-sm">Total de horas jugadas:</span>
              <span className="ml-2 text-white font-bold">{getTotalHours()}h</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
          </div>
        ) : ranking.length === 0 ? (
          <div className="text-center py-20 text-bunker-400">No hay datos de tiempo online disponibles</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-bunker-300">
              <thead className="text-xs uppercase bg-bunker-800 text-bunker-300 border-b border-bunker-700">
                <tr>
                  <th scope="col" className="px-6 py-3 w-16 text-center">
                    Pos
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Cuenta
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Tiempo Online
                  </th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((user, i) => {
                  const maxMinutes = getMaxMinutes()
                  const percentage = ((user.MinOnline || 0) / maxMinutes) * 100

                  let positionClass = "bg-bunker-700 text-white"
                  if (i === 0) positionClass = "bg-gold-500 text-black"
                  if (i === 1) positionClass = "bg-gray-400 text-black"
                  if (i === 2) positionClass = "bg-amber-700 text-white"

                  return (
                    <tr key={i} className="border-b border-bunker-700 hover:bg-bunker-800">
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${positionClass}`}
                        >
                          {i + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium">{user.memb___id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="min-w-[80px]">{formatTime(user.MinOnline)}</span>
                          <div className="w-full bg-bunker-700 rounded-full h-2.5">
                            <div className="bg-gold-500 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
