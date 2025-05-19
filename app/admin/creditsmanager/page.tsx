"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CreditCard, DollarSign, Users, AlertCircle, CheckCircle, RefreshCw } from "lucide-react"

export default function CreditsManagerPage() {
  const [username, setUsername] = useState("")
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [recentTransactions, setRecentTransactions] = useState([
    { id: 1, user: "usuario1", amount: 500, creditType: "WCoinC", date: "2023-05-01T10:30:00" },
    { id: 2, user: "usuario2", amount: 1000, creditType: "WCoinP", date: "2023-05-01T11:45:00" },
    { id: 3, user: "usuario3", amount: 250, creditType: "GoblinPoints", date: "2023-05-01T14:20:00" },
  ])
  const [refreshing, setRefreshing] = useState(false)

  const handleAmountPreset = (preset) => {
    setAmount(preset.toString())
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!username || !amount) {
      setError("Todos los campos son requeridos")
      return
    }

    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("La cantidad debe ser un número positivo")
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
        body: JSON.stringify({
          user: username,
          coins: Number(amount),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(data.message)
        setUsername("")
        setAmount("")

        // Añadir la transacción al historial
        const newTransaction = {
          id: Date.now(),
          user: username,
          amount: Number(amount),
          creditType: "WCoinC",
          date: new Date().toISOString(),
        }
        setRecentTransactions([newTransaction, ...recentTransactions].slice(0, 10))
      } else {
        setError(data.error || "Error al procesar la solicitud")
      }
    } catch (err) {
      setError("Error de conexión")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
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
    <div className="p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold text-white">Gestor de Créditos</h1>
        <p className="text-gray-400">Administra los créditos del juego</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-bunker-900 border-bunker-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center">
              <CreditCard className="mr-2 h-5 w-5 text-gold-500" />
              Tipo de Crédito
            </CardTitle>
            <CardDescription>Configuración activa</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">WCoinC</div>
            <p className="text-gray-400 text-sm">Créditos de la tienda</p>
          </CardContent>
        </Card>

        <Card className="bg-bunker-900 border-bunker-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center">
              <DollarSign className="mr-2 h-5 w-5 text-gold-500" />
              Créditos Añadidos
            </CardTitle>
            <CardDescription>Últimas 24 horas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {recentTransactions.reduce((sum, t) => sum + t.amount, 0)}
            </div>
            <p className="text-gray-400 text-sm">En {recentTransactions.length} transacciones</p>
          </CardContent>
        </Card>

        <Card className="bg-bunker-900 border-bunker-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center">
              <Users className="mr-2 h-5 w-5 text-gold-500" />
              Usuarios Beneficiados
            </CardTitle>
            <CardDescription>Últimas 24 horas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{new Set(recentTransactions.map((t) => t.user)).size}</div>
            <p className="text-gray-400 text-sm">Usuarios únicos</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="add" className="w-full">
        <TabsList className="bg-bunker-800">
          <TabsTrigger value="add" className="data-[state=active]:bg-bunker-700">
            Añadir Créditos
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-bunker-700">
            Historial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="add" className="mt-4">
          <Card className="bg-bunker-900 border-bunker-800">
            <CardHeader>
              <CardTitle className="text-white">Añadir Créditos</CardTitle>
              <CardDescription>Añade WCoinC a la cuenta del usuario</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Usuario</label>
                  <Input
                    type="text"
                    placeholder="Nombre de usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-bunker-800 border-bunker-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Cantidad</label>
                  <Input
                    type="number"
                    placeholder="Cantidad de créditos"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-bunker-800 border-bunker-700 text-white"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {[100, 500, 1000, 5000, 10000].map((preset) => (
                      <Button
                        key={preset}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAmountPreset(preset)}
                        className="bg-bunker-800 border-bunker-700 text-white hover:bg-bunker-700"
                      >
                        {preset.toLocaleString()}
                      </Button>
                    ))}
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive" className="bg-red-900/20 border-red-900 text-red-300">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="bg-green-900/20 border-green-900 text-green-300">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Éxito</AlertTitle>
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setRefreshing(true)}
                    disabled={refreshing}
                    className="bg-bunker-800 border-bunker-700 text-white hover:bg-bunker-700"
                  >
                    {refreshing ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Actualizando...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Actualizar
                      </>
                    )}
                  </Button>
                  <Button type="submit" disabled={loading} className="bg-gold-600 hover:bg-gold-700 text-bunker-950">
                    {loading ? "Procesando..." : "Añadir Créditos"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card className="bg-bunker-900 border-bunker-800">
            <CardHeader>
              <CardTitle className="text-white">Historial de Transacciones</CardTitle>
              <CardDescription>Últimas transacciones realizadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-bunker-800">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-bunker-800 text-gray-300">
                        <th className="py-3 px-4 text-left">Usuario</th>
                        <th className="py-3 px-4 text-left">Tipo</th>
                        <th className="py-3 px-4 text-right">Cantidad</th>
                        <th className="py-3 px-4 text-right">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTransactions.map((transaction) => (
                        <tr key={transaction.id} className="border-t border-bunker-800 hover:bg-bunker-800/50">
                          <td className="py-3 px-4 text-white">{transaction.user}</td>
                          <td className="py-3 px-4 text-gray-300">{transaction.creditType}</td>
                          <td className="py-3 px-4 text-right text-gold-500">+{transaction.amount.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right text-gray-400">{formatDate(transaction.date)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
