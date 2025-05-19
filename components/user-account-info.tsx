"use client"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"

export default function UserAccountInfo({ email }: { email: string }) {
  const [info, setInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInfo = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/user/accountinfo", {
          method: "POST",
          body: JSON.stringify({ email }),
          headers: {
            "Content-Type": "application/json",
          },
        })

        const data = await res.json()
        if (data.success) {
          setInfo(data.data)
        } else {
          setError(data.error || "Error al cargar los datos")
        }
      } catch (err) {
        setError("Error de conexión")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (email) {
      fetchInfo()
    }
  }, [email])

  if (loading)
    return (
      <div className="p-4 bg-bunker-800 border border-bunker-700 rounded-xl">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold-500"></div>
        </div>
      </div>
    )

  if (error)
    return (
      <div className="p-4 bg-bunker-800 border border-bunker-700 rounded-xl">
        <p className="text-red-400">{error}</p>
      </div>
    )

  if (!info)
    return (
      <div className="p-4 bg-bunker-800 border border-bunker-700 rounded-xl">
        <p className="text-gray-400">No hay información disponible</p>
      </div>
    )

  return (
    <div className="p-4 bg-bunker-800 border border-bunker-700 rounded-xl">
      <h2 className="text-xl font-bold mb-4 text-gray-100">Información de la cuenta</h2>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center border-b border-bunker-700 pb-2">
          <span className="font-medium text-gray-400">Usuario:</span>
          <span className="text-gray-100">{info.username}</span>
        </div>
        <div className="flex justify-between items-center border-b border-bunker-700 pb-2">
          <span className="font-medium text-gray-400">Email:</span>
          <span className="text-gray-100">{info.email}</span>
        </div>
        <div className="flex justify-between items-center border-b border-bunker-700 pb-2">
          <span className="font-medium text-gray-400">Estado:</span>
          <Badge
            variant={info.isOnline === 1 ? "default" : "outline"}
            className={info.isOnline === 1 ? "bg-green-600" : ""}
          >
            {info.isOnline === 1 ? "Online" : "Offline"}
          </Badge>
        </div>
        <div className="flex justify-between items-center border-b border-bunker-700 pb-2">
          <span className="font-medium text-gray-400">IP:</span>
          <span className="text-gray-100">{info.lastIP || "Desconocida"}</span>
        </div>
        <div className="flex justify-between items-center border-b border-bunker-700 pb-2">
          <span className="font-medium text-gray-400">Último login:</span>
          <span className="text-gray-100">{info.lastLogin || "Nunca"}</span>
        </div>
        <div className="flex justify-between items-center border-b border-bunker-700 pb-2">
          <span className="font-medium text-gray-400">Registro:</span>
          <span className="text-gray-100">{info.registerDate}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-400">Estado de cuenta:</span>
          {info.blocked === 1 ? (
            <Badge variant="destructive">Bloqueado</Badge>
          ) : (
            <Badge variant="default" className="bg-green-600">
              Activo
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}
