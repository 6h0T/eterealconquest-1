"use client"

import { useState, useEffect } from "react"
import { Search, RefreshCw, AlertCircle, CheckCircle2, XCircle, Clock, User, Mail, Calendar, Eye } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

interface PendingAccount {
  id: number
  username: string
  email: string
  created_at: string
  expires_at: string
  ip_address?: string
  user_agent?: string
  verification_token: string
}

export function PendingAccountsManager() {
  const [accounts, setAccounts] = useState<PendingAccount[]>([])
  const [filteredAccounts, setFilteredAccounts] = useState<PendingAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAccount, setSelectedAccount] = useState<PendingAccount | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [validatingAccount, setValidatingAccount] = useState<number | null>(null)
  const [deletingAccount, setDeletingAccount] = useState<number | null>(null)

  // Cargar cuentas pendientes
  const fetchPendingAccounts = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/admin/pending-accounts")
      const data = await response.json()

      if (data.success) {
        setAccounts(data.accounts || [])
      } else {
        setError(data.error || "Error al cargar cuentas pendientes")
      }
    } catch (error) {
      console.error("Error:", error)
      setError("Error al conectar con el servidor")
    } finally {
      setLoading(false)
    }
  }

  // Validar cuenta manualmente
  const validateAccount = async (accountId: number) => {
    setValidatingAccount(accountId)
    try {
      const response = await fetch("/api/admin/validate-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accountId }),
      })

      const data = await response.json()

      if (data.success) {
        // Remover la cuenta de la lista
        setAccounts(prev => prev.filter(acc => acc.id !== accountId))
        // Mostrar mensaje de éxito
        alert(`✅ Cuenta validada exitosamente: ${data.username}`)
      } else {
        alert(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      console.error("Error validating account:", error)
      alert("❌ Error al validar la cuenta")
    } finally {
      setValidatingAccount(null)
    }
  }

  // Eliminar cuenta pendiente
  const deleteAccount = async (accountId: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta cuenta pendiente?")) {
      return
    }

    setDeletingAccount(accountId)
    try {
      const response = await fetch("/api/admin/delete-pending-account", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accountId }),
      })

      const data = await response.json()

      if (data.success) {
        // Remover la cuenta de la lista
        setAccounts(prev => prev.filter(acc => acc.id !== accountId))
        alert("🗑️ Cuenta pendiente eliminada")
      } else {
        alert(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      console.error("Error deleting account:", error)
      alert("❌ Error al eliminar la cuenta")
    } finally {
      setDeletingAccount(null)
    }
  }

  // Filtrar cuentas por término de búsqueda
  useEffect(() => {
    if (!searchTerm) {
      setFilteredAccounts(accounts)
    } else {
      const term = searchTerm.toLowerCase()
      setFilteredAccounts(
        accounts.filter(
          account =>
            account.username.toLowerCase().includes(term) ||
            account.email.toLowerCase().includes(term)
        )
      )
    }
  }, [accounts, searchTerm])

  useEffect(() => {
    fetchPendingAccounts()
  }, [])

  // Verificar si una cuenta ha expirado
  const isExpired = (expiresAt: string) => {
    return new Date() > new Date(expiresAt)
  }

  // Formatear fecha
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateString
    }
  }

  // Tiempo restante hasta expiración
  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date()
    const expiry = new Date(expiresAt)
    const diff = expiry.getTime() - now.getTime()

    if (diff <= 0) return "Expirado"

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return `${hours}h ${minutes}m restantes`
    } else {
      return `${minutes}m restantes`
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Cargando cuentas pendientes...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Mostrar error si existe */}
      {error && (
        <div className="p-4 bg-red-900/20 border border-red-700/50 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-300 text-sm">Error: {error}</span>
          </div>
          <Button
            onClick={fetchPendingAccounts}
            className="flex items-center px-3 py-1 bg-red-700 hover:bg-red-600 text-white rounded text-sm"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Reintentar
          </Button>
        </div>
      )}

      {/* Estadísticas y controles */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-bunker-800 border-bunker-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Pendientes</p>
                <p className="text-2xl font-semibold text-gray-100">{accounts.length}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-bunker-800 border-bunker-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Válidas</p>
                <p className="text-2xl font-semibold text-green-400">
                  {accounts.filter(acc => !isExpired(acc.expires_at)).length}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-bunker-800 border-bunker-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Expiradas</p>
                <p className="text-2xl font-semibold text-red-400">
                  {accounts.filter(acc => isExpired(acc.expires_at)).length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-bunker-800 border-bunker-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-center">
              <Button
                onClick={fetchPendingAccounts}
                disabled={loading}
                className="flex items-center gap-2 bg-gold-600 hover:bg-gold-700 text-black"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Actualizar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de búsqueda */}
      <div className="flex gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por username o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-bunker-800 border border-bunker-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 text-gray-100"
            style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
          />
        </div>
      </div>

      {/* Lista de cuentas pendientes */}
      <div className="space-y-4">
        {filteredAccounts.length === 0 ? (
          <Card className="bg-bunker-800 border-bunker-700">
            <CardContent className="p-8 text-center">
              <div className="text-gray-400">
                {searchTerm ? "No se encontraron cuentas que coincidan con tu búsqueda" : "No hay cuentas pendientes de verificación"}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredAccounts.map((account) => (
            <Card key={account.id} className="bg-bunker-800 border-bunker-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-gold-500" />
                        <span className="font-medium text-gray-100">{account.username}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Mail className="h-3 w-3" />
                        <span>{account.email}</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-400 mb-1">Registrado</div>
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(account.created_at)}</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-400 mb-1">Estado</div>
                      <Badge
                        variant={isExpired(account.expires_at) ? "destructive" : "default"}
                        className={
                          isExpired(account.expires_at) ? "bg-red-900 text-red-100" : "bg-green-900 text-green-100"
                        }
                      >
                        {isExpired(account.expires_at) ? "Expirado" : "Válido"}
                      </Badge>
                      <div className="text-xs text-gray-500 mt-1">
                        {getTimeRemaining(account.expires_at)}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <Button
                        onClick={() => {
                          setSelectedAccount(account)
                          setShowDetailsModal(true)
                        }}
                        variant="outline"
                        size="sm"
                        className="bg-bunker-700 hover:bg-bunker-600 text-gray-200 border-bunker-600"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>

                      <Button
                        onClick={() => validateAccount(account.id)}
                        disabled={validatingAccount === account.id}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {validatingAccount === account.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                        )}
                        Validar
                      </Button>

                      <Button
                        onClick={() => deleteAccount(account.id)}
                        disabled={deletingAccount === account.id}
                        variant="destructive"
                        size="sm"
                      >
                        {deletingAccount === account.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-1" />
                        )}
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal de detalles */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="bg-bunker-800 border-bunker-700 text-gray-100 max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles de la Cuenta Pendiente</DialogTitle>
            <DialogDescription className="text-gray-400">
              Información completa de la cuenta esperando verificación
            </DialogDescription>
          </DialogHeader>

          {selectedAccount && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-400">Username</label>
                  <p className="text-gray-100 font-mono bg-bunker-900 p-2 rounded">{selectedAccount.username}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Email</label>
                  <p className="text-gray-100 font-mono bg-bunker-900 p-2 rounded">{selectedAccount.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-400">Fecha de Registro</label>
                  <p className="text-gray-100 bg-bunker-900 p-2 rounded">{formatDate(selectedAccount.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Fecha de Expiración</label>
                  <p className="text-gray-100 bg-bunker-900 p-2 rounded">{formatDate(selectedAccount.expires_at)}</p>
                </div>
              </div>

              {selectedAccount.ip_address && (
                <div>
                  <label className="text-sm font-medium text-gray-400">Dirección IP</label>
                  <p className="text-gray-100 font-mono bg-bunker-900 p-2 rounded">{selectedAccount.ip_address}</p>
                </div>
              )}

              {selectedAccount.user_agent && (
                <div>
                  <label className="text-sm font-medium text-gray-400">User Agent</label>
                  <p className="text-gray-100 text-xs bg-bunker-900 p-2 rounded break-all">{selectedAccount.user_agent}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-400">Token de Verificación</label>
                <p className="text-gray-100 font-mono text-xs bg-bunker-900 p-2 rounded break-all">{selectedAccount.verification_token}</p>
              </div>

              <div className="pt-4 border-t border-bunker-600">
                <div className="flex items-center justify-between">
                  <Badge
                    variant={isExpired(selectedAccount.expires_at) ? "destructive" : "default"}
                    className={
                      isExpired(selectedAccount.expires_at) ? "bg-red-900 text-red-100" : "bg-green-900 text-green-100"
                    }
                  >
                    {isExpired(selectedAccount.expires_at) ? "⏰ Expirado" : "✅ Válido"}
                  </Badge>
                  <span className="text-sm text-gray-400">
                    {getTimeRemaining(selectedAccount.expires_at)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={() => setShowDetailsModal(false)}
              variant="outline"
              className="bg-bunker-700 hover:bg-bunker-600 text-gray-200 border-bunker-600"
            >
              Cerrar
            </Button>
            {selectedAccount && (
              <Button
                onClick={() => {
                  validateAccount(selectedAccount.id)
                  setShowDetailsModal(false)
                }}
                disabled={validatingAccount === selectedAccount.id}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {validatingAccount === selectedAccount.id ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                Validar Cuenta
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 