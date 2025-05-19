"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CreditCard, AlertCircle, CheckCircle2, RefreshCw, Plus } from "lucide-react"

export function CreditsManagerCompact() {
  const [user, setUser] = useState("")
  const [coins, setCoins] = useState<number | "">("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [recentTransactions, setRecentTransactions] = useState([])
  const [loadingTransactions, setLoadingTransactions] = useState(false)

  const presetAmounts = [100, 500, 1000, 5000]

  // Función para obtener las transacciones recientes
  const fetchRecentTransactions = async () => {
    setLoadingTransactions(true)
    try {
      const response = await fetch("/api/admin/recent-transactions")
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setRecentTransactions(data.transactions.slice(0, 3) || [])
        }
      }
    } catch (error) {
      console.error("Error al cargar transacciones recientes:", error)
    } finally {
      setLoadingTransactions(false)
    }
  }

  // Cargar transacciones al montar el componente
  useEffect(() => {
    fetchRecentTransactions()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !coins) {
      setError("Usuario y cantidad son requeridos")
      setTimeout(() => setError(null), 3000)
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/admin/donation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user, coins: Number(coins) }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(data.message)
        // Limpiar el formulario
        setUser("")
        setCoins("")
        // Actualizar las transacciones recientes
        fetchRecentTransactions()
      } else {
        setError(data.error || "Error al añadir créditos")
      }
    } catch (err) {
      setError("Error de conexión")
      console.error(err)
    } finally {
      setLoading(false)
      // Limpiar mensajes después de un tiempo
      setTimeout(() => {
        setSuccess(null)
        setError(null)
      }, 5000)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-bunker-700 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-gray-200 mb-4 flex items-center">
          <CreditCard className="mr-2 h-5 w-5 text-gold-500" />
          Añadir Créditos Rápido
        </h3>

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-md flex items-center text-red-400">
            <AlertCircle className="h-4 w-4 mr-2" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-900/30 border border-green-800 rounded-md flex items-center text-green-400">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Usuario</label>
            <input
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="Nombre de usuario"
              className="w-full px-3 py-2 bg-bunker-800 border border-bunker-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Cantidad</label>
            <input
              type="number"
              value={coins}
              onChange={(e) => setCoins(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="Cantidad de créditos"
              min="1"
              className="w-full px-3 py-2 bg-bunker-800 border border-bunker-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {presetAmounts.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setCoins(amount)}
                className="px-3 py-1 bg-bunker-600 hover:bg-bunker-500 text-gray-300 rounded-md text-sm transition-colors"
              >
                {amount}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="bg-gold-600 hover:bg-gold-500 text-white">
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Procesando...
                </>
              ) : (
                "Añadir"
              )}
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-bunker-700 p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-200">Últimas Transacciones</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchRecentTransactions}
            disabled={loadingTransactions}
            className="h-8 w-8 text-gray-400 hover:text-gray-200"
          >
            <RefreshCw className={`h-4 w-4 ${loadingTransactions ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {loadingTransactions ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold-500"></div>
          </div>
        ) : recentTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No hay transacciones recientes</div>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((transaction, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-bunker-800 rounded-md">
                <div>
                  <p className="font-medium text-gray-200">{transaction.username}</p>
                  <p className="text-sm text-gray-400">{transaction.timeAgo}</p>
                </div>
                <div
                  className={`flex items-center font-medium ${transaction.credit_type === "add" ? "text-green-400" : "text-red-400"}`}
                >
                  {transaction.credit_type === "add" && <Plus className="h-3 w-3 mr-1" />}
                  {transaction.credit_type === "add" ? "+" : "-"}
                  {transaction.amount} WCoins
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
