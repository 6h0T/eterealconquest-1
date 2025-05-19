"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/admin/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, UserSearch, AlertCircle, CheckCircle2, Users, Clock, Globe, Server } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Definir tipos para los personajes
interface Character {
  Name: string
  cLevel: number
  Class: number
  PkCount: number
  Resets: number
}

// Definir tipos para las conexiones
interface Connection {
  IP: string
  ConnectTM: string
  DisConnectTM: string
  ServerName?: string
}

// Mapeo de clases
const classNames: Record<number, string> = {
  0: "Dark Wizard",
  1: "Soul Master",
  16: "Dark Knight",
  17: "Blade Knight",
  32: "Fairy Elf",
  33: "Muse Elf",
  48: "Magic Gladiator",
  64: "Dark Lord",
  80: "Summoner",
  96: "Rage Fighter",
  // Añadir más clases según sea necesario
}

export default function AccountInfoPage() {
  const [searchValue, setSearchValue] = useState("")
  const [accountData, setAccountData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [characterList, setCharacterList] = useState<Character[]>([])
  const [isCharactersDialogOpen, setIsCharactersDialogOpen] = useState(false)
  const [loadingCharacters, setLoadingCharacters] = useState(false)
  const [characterError, setCharacterError] = useState<string | null>(null)
  const [banActionLoading, setBanActionLoading] = useState(false)
  const [connectionHistory, setConnectionHistory] = useState<Connection[]>([])
  const [connectionStats, setConnectionStats] = useState<any>(null)
  const [loadingConnections, setLoadingConnections] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  async function handleSearchSubmit(searchValue: string) {
    setLoading(true)
    setError(null)
    setConnectionHistory([])
    setConnectionStats(null)

    try {
      const response = await fetch("/api/admin/accountinfo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ search: searchValue }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || "Error al buscar la cuenta")
        setAccountData(null)
        return
      }

      const result = await response.json()

      // Asegurarse de que bloc_code sea un número
      if (result.data && result.data.bloc_code !== undefined) {
        result.data.bloc_code = Number(result.data.bloc_code)
      }

      console.log("Datos recibidos:", {
        id: result.data?.memb___id,
        bloc_code: result.data?.bloc_code,
        type: typeof result.data?.bloc_code,
      })

      setAccountData(result.data)

      // Actualizar historial de búsqueda
      if (searchValue && !searchHistory.includes(searchValue)) {
        setSearchHistory((prev) => [searchValue, ...prev].slice(0, 5))
      }
    } catch (error) {
      console.error("Fallo en la solicitud:", error)
      setError("Error de conexión al servidor")
      setAccountData(null)
    } finally {
      setLoading(false)
    }
  }

  // Cargar historial de conexiones cuando se carga la información de la cuenta
  useEffect(() => {
    if (accountData?.memb___id) {
      fetchConnectionHistory(accountData.memb___id)
    }
  }, [accountData])

  const fetchConnectionHistory = async (accountId: string) => {
    setLoadingConnections(true)
    setConnectionError(null)

    try {
      const response = await fetch("/api/admin/connection-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accountId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setConnectionError(errorData.error || "Error al obtener historial de conexiones")
        return
      }

      const result = await response.json()
      if (result.success) {
        setConnectionHistory(result.data.connections)
        setConnectionStats(result.data.stats)
      } else {
        setConnectionError(result.error || "Error al obtener historial de conexiones")
      }
    } catch (error) {
      console.error("Error al obtener historial de conexiones:", error)
      setConnectionError("Error de conexión al servidor")
    } finally {
      setLoadingConnections(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchValue.trim()) {
      handleSearchSubmit(searchValue.trim())
    } else {
      setError("Por favor ingresa un término de búsqueda")
    }
  }

  const fetchCharacters = async () => {
    if (!accountData?.memb___id) return

    setLoadingCharacters(true)
    setCharacterError(null)

    try {
      const response = await fetch("/api/user/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId: accountData.memb___id }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setCharacterError(errorData.error || "Error al obtener personajes")
        return
      }

      const data = await response.json()
      if (data.success) {
        setCharacterList(data.characters)
        setIsCharactersDialogOpen(true)
      } else {
        setCharacterError(data.error || "Error al obtener personajes")
      }
    } catch (error) {
      console.error("Error al obtener personajes:", error)
      setCharacterError("Error de conexión al servidor")
    } finally {
      setLoadingCharacters(false)
    }
  }

  const toggleBan = async () => {
    if (!accountData?.memb___id) return

    setBanActionLoading(true)
    // Asegurarse de que bloc_code sea un número para la comparación
    const blocCode = Number(accountData.bloc_code)
    const action = blocCode === 0 ? "ban" : "unban"

    try {
      const response = await fetch("/api/admin/ban-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: accountData.memb___id,
          action,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Actualizar el estado local de la cuenta
        setAccountData({
          ...accountData,
          bloc_code: action === "ban" ? 1 : 0,
        })

        // Mostrar mensaje de éxito
        setError(null)
      } else {
        setError(data.error || `Error al ${action === "ban" ? "bloquear" : "desbloquear"} la cuenta`)
      }
    } catch (error) {
      console.error("Error al cambiar estado de la cuenta:", error)
      setError("Error de conexión al servidor")
    } finally {
      setBanActionLoading(false)
    }
  }

  // Función para obtener el nombre de la clase
  const getClassName = (classCode: number): string => {
    return classNames[classCode] || `Clase ${classCode}`
  }

  // Función para formatear fechas
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "No disponible"
    try {
      return new Date(dateString).toLocaleString()
    } catch (e) {
      return dateString || "No disponible"
    }
  }

  // Función para calcular la duración de la sesión
  const calculateSessionDuration = (connectTime: string, disconnectTime: string): string => {
    if (!connectTime || !disconnectTime) return "N/A"

    try {
      const start = new Date(connectTime).getTime()
      const end = new Date(disconnectTime).getTime()

      if (isNaN(start) || isNaN(end) || end < start) return "N/A"

      const durationMs = end - start
      const hours = Math.floor(durationMs / (1000 * 60 * 60))
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((durationMs % (1000 * 60)) / 1000)

      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    } catch (e) {
      return "Error"
    }
  }

  // Función para determinar si una cuenta está bloqueada
  const isAccountBlocked = (): boolean => {
    // Asegurarse de que bloc_code sea un número para la comparación
    const blocCode = Number(accountData?.bloc_code)
    return blocCode === 1
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-medium text-gray-100">Información de Cuenta</h1>
          <p className="text-sm text-gray-400 mt-1">Consulta información detallada de las cuentas de usuario</p>
        </div>

        <Card className="bg-bunker-800 border-bunker-700">
          <CardHeader>
            <CardTitle className="text-xl text-gray-100">Buscar Cuenta</CardTitle>
            <CardDescription className="text-gray-400">
              Ingresa el nombre de usuario, email o nombre de personaje
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar usuario, email o personaje..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full bg-bunker-700 border border-bunker-600 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
              <Button type="submit" className="bg-gold-500 hover:bg-gold-600 text-bunker-950" disabled={loading}>
                {loading ? "Buscando..." : "Buscar"}
              </Button>
            </form>

            {searchHistory.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-400 mb-2">Búsquedas recientes:</p>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((historyItem, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="bg-bunker-700 hover:bg-bunker-600 text-gray-300"
                      onClick={() => {
                        setSearchValue(historyItem)
                        handleSearchSubmit(historyItem)
                      }}
                    >
                      {historyItem}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {error && (
          <Card className="bg-red-900/30 border-red-800">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <p className="text-red-300">{error}</p>
            </CardContent>
          </Card>
        )}

        {accountData && (
          <Card className="bg-bunker-800 border-bunker-700">
            <CardHeader>
              <CardTitle className="text-xl text-gray-100 flex items-center gap-2">
                {accountData.memb___id}
                <Badge className={isAccountBlocked() ? "bg-red-600" : "bg-green-600"}>
                  {isAccountBlocked() ? "Bloqueada" : "Activa"}
                </Badge>
              </CardTitle>
              <CardDescription className="text-gray-400">{accountData.mail_addr}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Estado de Conexión</h3>
                    <div className="flex items-center mt-1">
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${accountData.ConnectStat === 1 ? "bg-green-500" : "bg-gray-500"}`}
                      ></div>
                      <p className="text-gray-200">{accountData.ConnectStat === 1 ? "En línea" : "Desconectado"}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Última IP</h3>
                    <p className="text-gray-200">{accountData.last_ip || accountData.IP || "No disponible"}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Última Conexión</h3>
                    <p className="text-gray-200">{formatDate(accountData.last_connect || accountData.ConnectTM)}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Última Desconexión</h3>
                    <p className="text-gray-200">
                      {formatDate(accountData.last_disconnect || accountData.DisConnectTM)}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Fecha de Registro</h3>
                    <p className="text-gray-200">
                      {accountData.memb_regdate ? new Date(accountData.memb_regdate).toLocaleString() : "No disponible"}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Tipo de Cuenta</h3>
                    <p className="text-gray-200">
                      {accountData.sno === 0 ? "Usuario" : accountData.sno === 1 ? "Administrador" : "Desconocido"}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Estado</h3>
                    <div className="flex items-center mt-1">
                      {!isAccountBlocked() ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                          <p className="text-green-400">Cuenta activa</p>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                          <p className="text-red-400">Cuenta bloqueada</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Fecha de Expiración</h3>
                    <p className="text-gray-200">
                      {accountData.AccountExpireDate
                        ? new Date(accountData.AccountExpireDate).toLocaleString()
                        : "No establecida"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sección de historial de conexiones */}
              <div className="mt-6 pt-4 border-t border-bunker-700">
                <h3 className="text-sm font-medium text-gold-500 mb-3 flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Historial de Conexiones
                </h3>

                {loadingConnections ? (
                  <div className="flex justify-center p-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold-500"></div>
                  </div>
                ) : connectionError ? (
                  <div className="bg-red-900/30 border border-red-800 rounded-md p-3">
                    <p className="text-red-300 text-sm">{connectionError}</p>
                  </div>
                ) : (
                  <Tabs defaultValue="list" className="w-full">
                    <TabsList className="bg-bunker-900 border border-bunker-700">
                      <TabsTrigger
                        value="list"
                        className="data-[state=active]:bg-gold-500 data-[state=active]:text-bunker-950"
                      >
                        Lista de Conexiones
                      </TabsTrigger>
                      <TabsTrigger
                        value="stats"
                        className="data-[state=active]:bg-gold-500 data-[state=active]:text-bunker-950"
                      >
                        Estadísticas
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="list" className="mt-4">
                      {connectionHistory.length > 0 ? (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader className="bg-bunker-900">
                              <TableRow>
                                <TableHead className="text-gold-400">IP</TableHead>
                                <TableHead className="text-gold-400">Conexión</TableHead>
                                <TableHead className="text-gold-400">Desconexión</TableHead>
                                <TableHead className="text-gold-400">Duración</TableHead>
                                <TableHead className="text-gold-400">Servidor</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {connectionHistory.map((connection, index) => (
                                <TableRow key={index} className="border-b border-bunker-700 hover:bg-bunker-700/50">
                                  <TableCell className="font-mono text-white">{connection.IP || "N/A"}</TableCell>
                                  <TableCell>{formatDate(connection.ConnectTM)}</TableCell>
                                  <TableCell>{formatDate(connection.DisConnectTM)}</TableCell>
                                  <TableCell>
                                    {calculateSessionDuration(connection.ConnectTM, connection.DisConnectTM)}
                                  </TableCell>
                                  <TableCell>
                                    {connection.ServerName ? (
                                      <div className="flex items-center">
                                        <Server className="h-3 w-3 mr-1 text-gold-400" />
                                        <span>{connection.ServerName}</span>
                                      </div>
                                    ) : (
                                      "N/A"
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="bg-bunker-900 rounded-md p-4 text-center text-gray-400">
                          No hay historial de conexiones disponible
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="stats" className="mt-4">
                      {connectionStats ? (
                        <div className="bg-bunker-900 rounded-md p-4 border border-bunker-700">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-bunker-800 p-3 rounded-md border border-bunker-700">
                              <h4 className="text-xs text-gray-400 mb-1">Total de Conexiones</h4>
                              <p className="text-2xl font-bold text-gold-500">{connectionStats.totalConnections}</p>
                            </div>

                            <div className="bg-bunker-800 p-3 rounded-md border border-bunker-700">
                              <h4 className="text-xs text-gray-400 mb-1">IPs Únicas</h4>
                              <p className="text-2xl font-bold text-gold-500">{connectionStats.uniqueIPCount}</p>
                            </div>

                            <div className="bg-bunker-800 p-3 rounded-md border border-bunker-700">
                              <h4 className="text-xs text-gray-400 mb-1">Última Conexión</h4>
                              <p className="text-sm text-gray-200">
                                {connectionHistory.length > 0 ? formatDate(connectionHistory[0].ConnectTM) : "N/A"}
                              </p>
                            </div>
                          </div>

                          {connectionStats.uniqueIPCount > 0 && (
                            <div className="mt-4">
                              <h4 className="text-xs text-gray-400 mb-2 flex items-center">
                                <Globe className="h-3 w-3 mr-1" />
                                Lista de IPs Únicas
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {connectionStats.uniqueIPs.map((ip: string, index: number) => (
                                  <Badge key={index} className="bg-bunker-700 text-gray-300 hover:bg-bunker-600">
                                    {ip}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-bunker-900 rounded-md p-4 text-center text-gray-400">
                          No hay estadísticas disponibles
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-bunker-700">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Acciones de Administración</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gold-600 text-gold-500 hover:bg-gold-500 hover:text-bunker-950"
                    onClick={fetchCharacters}
                    disabled={loadingCharacters}
                  >
                    {loadingCharacters ? "Cargando..." : "Ver Personajes"}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className={
                      !isAccountBlocked()
                        ? "border-red-600 text-red-500 hover:bg-red-500 hover:text-white"
                        : "border-green-600 text-green-500 hover:bg-green-500 hover:text-white"
                    }
                    onClick={toggleBan}
                    disabled={banActionLoading}
                  >
                    {banActionLoading
                      ? !isAccountBlocked()
                        ? "Bloqueando..."
                        : "Desbloqueando..."
                      : !isAccountBlocked()
                        ? "Bloquear Cuenta"
                        : "Desbloquear Cuenta"}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-600 text-blue-500 hover:bg-blue-500 hover:text-white"
                  >
                    Resetear Contraseña
                  </Button>
                </div>
              </div>

              {characterError && (
                <div className="mt-4 p-3 bg-red-900/30 border border-red-800 rounded-md">
                  <p className="text-red-300 text-sm">{characterError}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {!accountData && !error && !loading && (
          <div className="flex flex-col items-center justify-center p-8 bg-bunker-800 border border-bunker-700 rounded-xl text-gray-400">
            <UserSearch className="h-12 w-12 mb-4 text-gold-500" />
            <p className="text-center">
              Ingresa un nombre de usuario, email o personaje para ver la información de la cuenta
            </p>
          </div>
        )}

        {/* Modal para mostrar los personajes */}
        <Dialog open={isCharactersDialogOpen} onOpenChange={setIsCharactersDialogOpen}>
          <DialogContent className="bg-bunker-800 border-bunker-700 text-gray-100 max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-gold-500">
                <Users className="h-5 w-5" />
                Personajes de {accountData?.memb___id}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Lista de personajes asociados a esta cuenta
              </DialogDescription>
            </DialogHeader>

            {characterList.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-bunker-900">
                    <TableRow>
                      <TableHead className="text-gold-400">Nombre</TableHead>
                      <TableHead className="text-gold-400">Nivel</TableHead>
                      <TableHead className="text-gold-400">Clase</TableHead>
                      <TableHead className="text-gold-400">PK</TableHead>
                      <TableHead className="text-gold-400">Resets</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {characterList.map((character) => (
                      <TableRow key={character.Name} className="border-b border-bunker-700 hover:bg-bunker-700/50">
                        <TableCell className="font-medium text-white">{character.Name}</TableCell>
                        <TableCell>{character.cLevel}</TableCell>
                        <TableCell>{getClassName(character.Class)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={character.PkCount > 0 ? "destructive" : "outline"}
                            className={character.PkCount > 0 ? "" : "text-gray-400"}
                          >
                            {character.PkCount}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="default" className="bg-gold-600 text-bunker-950">
                            {character.Resets}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-gray-400">
                <p>No se encontraron personajes para esta cuenta</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
