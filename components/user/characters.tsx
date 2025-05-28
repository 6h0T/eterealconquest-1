"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Shield, AlertTriangle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import type { Locale } from "@/i18n/config"

interface UserCharactersProps {
  username: string
  lang: Locale
}

interface Character {
  Name: string
  Class: number
  cLevel: number
  Resets?: number
  Strength: number
  Dexterity: number
  Vitality: number
  Energy: number
  LevelUpPoint: number // Nota: La base de datos usa LevelUpPoint, no LevelUpPoints
}

export function UserCharacters({ username, lang }: UserCharactersProps) {
  const [characters, setCharacters] = useState<Character[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [statsToAdd, setStatsToAdd] = useState({ str: 0, agi: 0, vit: 0, ene: 0 })

  // Traducciones específicas para los personajes
  const translations = {
    es: {
      characters: "Tus Personajes",
      loading: "Cargando personajes...",
      error: "Error al cargar los personajes",
      retry: "Reintentar",
      noCharacters: "No tienes personajes en esta cuenta",
      name: "Nombre",
      class: "Clase",
      level: "Nivel",
      resets: "Resets",
      actions: "Acciones",
      stats: "Estadísticas",
      strength: "Fuerza",
      dexterity: "Agilidad",
      vitality: "Vitalidad",
      energy: "Energía",
      points: "Puntos disponibles",
      reset: "Reset",
      resetStats: "Reset Stats",
      addStats: "Añadir Stats",
      clearPk: "Limpiar PK",
      unstick: "Desatascar",
      clearSkills: "Limpiar Skills",
      confirmReset: "¿Estás seguro de que quieres resetear este personaje? Volverá al nivel 1.",
      confirmResetStats: "¿Estás seguro de que quieres resetear las estadísticas de este personaje?",
      confirmClearPk: "¿Estás seguro de que quieres limpiar el estado PK de este personaje?",
      confirmUnstick: "¿Estás seguro de que quieres desatascar este personaje? Será movido a Lorencia.",
      confirmClearSkills: "¿Estás seguro de que quieres limpiar el árbol de habilidades de este personaje?",
      yes: "Sí, confirmar",
      no: "No, cancelar",
      success: "Acción completada con éxito",
      actionError: "Error al realizar la acción",
      addStatsTitle: "Añadir Estadísticas",
      save: "Guardar",
      cancel: "Cancelar",
      pointsLeft: "Puntos restantes",
      darkWizard: "Dark Wizard",
      soulMaster: "Soul Master",
      darkKnight: "Dark Knight",
      bladeKnight: "Blade Knight",
      fairyElf: "Fairy Elf",
      museElf: "Muse Elf",
      magicGladiator: "Magic Gladiator",
      darkLord: "Dark Lord",
      summoner: "Summoner",
      bloodySummoner: "Bloody Summoner",
      rageFighter: "Rage Fighter",
      duelMaster: "Duel Master",
      dimensionMaster: "Dimension Master",
      lordEmperor: "Lord Emperor",
      fistMaster: "Fist Master",
      accountDisconnected: "Para interactuar con estas opciones, la cuenta debe estar desconectada del juego.",
    },
    en: {
      characters: "Your Characters",
      loading: "Loading characters...",
      error: "Error loading characters",
      retry: "Retry",
      noCharacters: "You don't have any characters on this account",
      name: "Name",
      class: "Class",
      level: "Level",
      resets: "Resets",
      actions: "Actions",
      stats: "Statistics",
      strength: "Strength",
      dexterity: "Dexterity",
      vitality: "Vitality",
      energy: "Energy",
      points: "Available points",
      reset: "Reset",
      resetStats: "Reset Stats",
      addStats: "Add Stats",
      clearPk: "Clear PK",
      unstick: "Unstick",
      clearSkills: "Clear Skills",
      confirmReset: "Are you sure you want to reset this character? It will return to level 1.",
      confirmResetStats: "Are you sure you want to reset the statistics of this character?",
      confirmClearPk: "Are you sure you want to clear the PK status of this character?",
      confirmUnstick: "Are you sure you want to unstick this character? It will be moved to Lorencia.",
      confirmClearSkills: "Are you sure you want to clear the skill tree of this character?",
      yes: "Yes, confirm",
      no: "No, cancel",
      success: "Action completed successfully",
      actionError: "Error performing action",
      addStatsTitle: "Add Statistics",
      save: "Save",
      cancel: "Cancel",
      pointsLeft: "Points left",
      darkWizard: "Dark Wizard",
      soulMaster: "Soul Master",
      darkKnight: "Dark Knight",
      bladeKnight: "Blade Knight",
      fairyElf: "Fairy Elf",
      museElf: "Muse Elf",
      magicGladiator: "Magic Gladiator",
      darkLord: "Dark Lord",
      summoner: "Summoner",
      bloodySummoner: "Bloody Summoner",
      rageFighter: "Rage Fighter",
      duelMaster: "Duel Master",
      dimensionMaster: "Dimension Master",
      lordEmperor: "Lord Emperor",
      fistMaster: "Fist Master",
      accountDisconnected: "To interact with these options, the account must be disconnected from the game.",
    },
    pt: {
      characters: "Seus Personagens",
      loading: "Carregando personagens...",
      error: "Erro ao carregar personagens",
      retry: "Tentar novamente",
      noCharacters: "Você não tem personagens nesta conta",
      name: "Nome",
      class: "Classe",
      level: "Nível",
      resets: "Resets",
      actions: "Ações",
      stats: "Estatísticas",
      strength: "Força",
      dexterity: "Agilidade",
      vitality: "Vitalidade",
      energy: "Energia",
      points: "Pontos disponíveis",
      reset: "Reset",
      resetStats: "Reset Stats",
      addStats: "Adicionar Stats",
      clearPk: "Limpar PK",
      unstick: "Desatascar",
      clearSkills: "Limpar Skills",
      confirmReset: "Tem certeza que deseja resetar este personagem? Ele voltará ao nível 1.",
      confirmResetStats: "Tem certeza que deseja resetar as estatísticas deste personagem?",
      confirmClearPk: "Tem certeza que deseja limpar o status PK deste personagem?",
      confirmUnstick: "Tem certeza que deseja desatascar este personagem? Ele será movido para Lorencia.",
      confirmClearSkills: "Tem certeza que deseja limpar a árvore de habilidades deste personagem?",
      yes: "Sim, confirmar",
      no: "Não, cancelar",
      success: "Ação concluída com sucesso",
      actionError: "Erro ao realizar a ação",
      addStatsTitle: "Adicionar Estatísticas",
      save: "Salvar",
      cancel: "Cancelar",
      pointsLeft: "Pontos restantes",
      darkWizard: "Dark Wizard",
      soulMaster: "Soul Master",
      darkKnight: "Dark Knight",
      bladeKnight: "Blade Knight",
      fairyElf: "Fairy Elf",
      museElf: "Muse Elf",
      magicGladiator: "Magic Gladiator",
      darkLord: "Dark Lord",
      summoner: "Summoner",
      bloodySummoner: "Bloody Summoner",
      rageFighter: "Rage Fighter",
      duelMaster: "Duel Master",
      dimensionMaster: "Dimension Master",
      lordEmperor: "Lord Emperor",
      fistMaster: "Fist Master",
      accountDisconnected: "Para interagir com estas opções, la cuenta debe estar desconectada del juego.",
    },
  }

  const t = translations[lang as keyof typeof translations]

  // Mapeo de clases para mostrar nombres legibles
  const classNames: Record<number, string> = {
    0: t.darkWizard,
    1: t.soulMaster,
    16: t.darkKnight,
    17: t.bladeKnight,
    32: t.fairyElf,
    33: t.museElf,
    48: t.magicGladiator,
    49: t.magicGladiator,
    50: t.duelMaster,
    64: t.darkLord,
    65: t.lordEmperor, // Lord Emperor (evolución de Dark Lord)
    80: t.summoner,
    81: t.bloodySummoner, // Bloody Summoner (evolución de Summoner)
    82: t.dimensionMaster, // Dimension Master (evolución de Summoner)
    96: t.rageFighter,
    97: t.fistMaster, // Fist Master (evolución de Rage Fighter)
  }

  // Mapeo de clases a imágenes de avatar
  const classAvatars: Record<number, string> = {
    0: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dw.jpg-94Odgh6EIlTQNgk97eSpvwGbJcOaq8.jpeg", // Dark Wizard
    1: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dw.jpg-94Odgh6EIlTQNgk97eSpvwGbJcOaq8.jpeg", // Soul Master (misma imagen que Dark Wizard)
    16: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dk.jpg-FRluIYUfFlAeNMRosIL4uvzAw2BW5u.jpeg", // Dark Knight
    17: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dk.jpg-FRluIYUfFlAeNMRosIL4uvzAw2BW5u.jpeg", // Blade Knight (misma imagen que Dark Knight)
    32: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/elf.jpg-yn25xRDcio5xJR3L6EwjFKp8r8VqUK.jpeg", // Fairy Elf
    33: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/elf.jpg-yn25xRDcio5xJR3L6EwjFKp8r8VqUK.jpeg", // Muse Elf (misma imagen que Fairy Elf)
    48: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mg.jpg-DElqcuXpSD73S72zpKWhpx77TSia2N.jpeg", // Magic Gladiator
    49: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mg.jpg-DElqcuXpSD73S72zpKWhpx77TSia2N.jpeg", // Duel Master
    50: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mg.jpg-DElqcuXpSD73S72zpKWhpx77TSia2N.jpeg", // Magic Gladiator alternativo
    64: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dl.jpg-dPtAXSjZyBKQm2yrVVIYKXV3Bkqmt0.jpeg", // Dark Lord
    65: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dl.jpg-dPtAXSjZyBKQm2yrVVIYKXV3Bkqmt0.jpeg", // Lord Emperor
    80: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sum.jpg-5rFMeWrNA4MzzqpjJSZ2Zmco4uPUcz.jpeg", // Summoner
    81: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sum.jpg-5rFMeWrNA4MzzqpjJSZ2Zmco4uPUcz.jpeg", // Bloody Summoner
    82: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sum.jpg-5rFMeWrNA4MzzqpjJSZ2Zmco4uPUcz.jpeg", // Dimension Master
    96: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/rf.jpg-bv9A64BaE5LBBUm2XLZeycXfUD9vBs.jpeg", // Rage Fighter
    97: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/rf.jpg-bv9A64BaE5LBBUm2XLZeycXfUD9vBs.jpeg", // Fist Master
  }

  // Cargar personajes del usuario
  useEffect(() => {
    const fetchCharacters = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Obtener el accountId del localStorage (asumiendo que se guarda al iniciar sesión)
        const accountId = localStorage.getItem("accountId") || username

        // Hacer la petición al nuevo endpoint
        const response = await fetch("/api/user/characters", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ accountId }),
        })

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()

        if (data.success && data.characters) {
          // Añadir Resets si no viene de la base de datos (opcional)
          const charactersWithResets = data.characters.map((char: Character) => ({
            ...char,
            Resets: char.Resets || 0, // Si no viene de la BD, asignar 0
          }))

          setCharacters(charactersWithResets)
        } else {
          // Si no hay personajes o hay un error
          setCharacters([])
          if (data.error) {
            throw new Error(data.error)
          }
        }
      } catch (err: any) {
        console.error("Error fetching characters:", err)
        setError(err.message || "Error desconocido")

        // Fallback a datos de prueba si estamos en desarrollo
        if (process.env.NODE_ENV === "development") {
          console.log("Usando datos de prueba en desarrollo")
          const userPrefix = username.substring(0, 3)
          const mockCharacters: Character[] = [
            {
              Name: `${userPrefix}_Knight`,
              Class: 16,
              cLevel: 400,
              Resets: 10,
              Strength: 1000,
              Dexterity: 500,
              Vitality: 800,
              Energy: 300,
              LevelUpPoint: 200,
            },
            {
              Name: `${userPrefix}_Wizard`,
              Class: 0,
              cLevel: 350,
              Resets: 8,
              Strength: 300,
              Dexterity: 400,
              Vitality: 500,
              Energy: 1500,
              LevelUpPoint: 150,
            },
            {
              Name: `${userPrefix}_Elf`,
              Class: 32,
              cLevel: 380,
              Resets: 9,
              Strength: 600,
              Dexterity: 1200,
              Vitality: 700,
              Energy: 500,
              LevelUpPoint: 180,
            },
          ]
          setCharacters(mockCharacters)
          setError(null)
        }
      } finally {
        setIsLoading(false)
      }
    }

    if (username) {
      fetchCharacters()
    }
  }, [username])

  // Función para resetear un personaje
  const resetCharacter = async (characterName: string) => {
    setActionLoading(true)
    setActionSuccess(null)
    setActionError(null)

    try {
      const response = await fetch("/api/user/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ characterName }),
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      setActionSuccess(t.success)
      // Actualizar la lista de personajes
      // En un caso real, recargaríamos los datos
    } catch (err: any) {
      console.error("Error resetting character:", err)
      setActionError(err.message || t.actionError)
    } finally {
      setActionLoading(false)
    }
  }

  // Función para resetear estadísticas
  const resetStats = async (characterName: string) => {
    setActionLoading(true)
    setActionSuccess(null)
    setActionError(null)

    try {
      const response = await fetch("/api/user/resetstats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ characterName }),
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      setActionSuccess(t.success)
      // Actualizar la lista de personajes
    } catch (err: any) {
      console.error("Error resetting stats:", err)
      setActionError(err.message || t.actionError)
    } finally {
      setActionLoading(false)
    }
  }

  // Función para añadir estadísticas
  const addStats = async (characterName: string, stats: { str: number; agi: number; vit: number; ene: number }) => {
    setActionLoading(true)
    setActionSuccess(null)
    setActionError(null)

    try {
      const response = await fetch("/api/user/addstats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ characterName, stats }),
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      setActionSuccess(t.success)
      // Actualizar la lista de personajes
    } catch (err: any) {
      console.error("Error adding stats:", err)
      setActionError(err.message || t.actionError)
    } finally {
      setActionLoading(false)
    }
  }

  // Función para añadir una estadística específica (nuevo endpoint)
  const addStat = async (characterName: string, type: "str" | "agi" | "vit" | "ene", amount: number) => {
    setActionLoading(true)
    setActionSuccess(null)
    setActionError(null)

    try {
      const response = await fetch("/api/user/addstat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ characterName, type, amount }),
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      setActionSuccess(t.success)
      // Actualizar la lista de personajes
    } catch (err: any) {
      console.error("Error adding stat:", err)
      setActionError(err.message || t.actionError)
    } finally {
      setActionLoading(false)
    }
  }

  // Función para limpiar PK
  const clearPk = async (characterName: string) => {
    setActionLoading(true)
    setActionSuccess(null)
    setActionError(null)

    try {
      const response = await fetch("/api/user/clearpk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ characterName }),
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      setActionSuccess(t.success)
      // Actualizar la lista de personajes
    } catch (err: any) {
      console.error("Error clearing PK:", err)
      setActionError(err.message || t.actionError)
    } finally {
      setActionLoading(false)
    }
  }

  // Función para desatascar personaje
  const unstickCharacter = async (characterName: string) => {
    setActionLoading(true)
    setActionSuccess(null)
    setActionError(null)

    try {
      const response = await fetch("/api/user/unstick", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ characterName }),
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      setActionSuccess(t.success)
      // Actualizar la lista de personajes
    } catch (err: any) {
      console.error("Error unsticking character:", err)
      setActionError(err.message || t.actionError)
    } finally {
      setActionLoading(false)
    }
  }

  // Función para limpiar árbol de habilidades
  const clearSkillTree = async (characterName: string) => {
    setActionLoading(true)
    setActionSuccess(null)
    setActionError(null)

    try {
      const response = await fetch("/api/user/clearskilltree", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ characterName }),
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      setActionSuccess(t.success)
      // Actualizar la lista de personajes
    } catch (err: any) {
      console.error("Error clearing skill tree:", err)
      setActionError(err.message || t.actionError)
    } finally {
      setActionLoading(false)
    }
  }

  // Función para validar y actualizar los valores de estadísticas
  const handleStatChange = (stat: "str" | "agi" | "vit" | "ene", value: string, character: Character) => {
    if (!character) return

    // Convertir a número y validar
    let numValue = Number.parseInt(value)

    // Si no es un número válido, usar 0
    if (isNaN(numValue)) numValue = 0

    // No permitir valores negativos
    if (numValue < 0) numValue = 0

    // Calcular puntos actuales usados
    const currentUsedPoints = statsToAdd.str + statsToAdd.agi + statsToAdd.vit + statsToAdd.ene

    // Calcular cuántos puntos se usarían con el nuevo valor
    const newUsedPoints = currentUsedPoints - statsToAdd[stat] + numValue

    // Verificar si hay suficientes puntos disponibles
    if (newUsedPoints > character.LevelUpPoint) {
      // Si no hay suficientes puntos, ajustar al máximo posible
      numValue = statsToAdd[stat] + (character.LevelUpPoint - currentUsedPoints)
    }

    // Actualizar el estado
    setStatsToAdd({
      ...statsToAdd,
      [stat]: numValue,
    })
  }

  // Renderizar estado de carga
  if (isLoading) {
    return (
      <Card className="bg-bunker-800/90 backdrop-blur-sm border border-gold-700/30">
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-400 mb-4"></div>
            <p className="text-gold-300">{t.loading}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Renderizar estado de error
  if (error) {
    return (
      <Card className="bg-bunker-800/90 backdrop-blur-sm border border-gold-700/30">
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-red-500 mb-4">
              <AlertTriangle className="h-12 w-12" />
            </div>
            <p className="text-red-400 mb-4">{t.error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-bunker-700 text-gold-400 rounded-md hover:bg-bunker-600 transition-colors"
            >
              {t.retry}
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Renderizar lista vacía
  if (!characters || characters.length === 0) {
    return (
      <Card className="bg-bunker-800/90 backdrop-blur-sm border border-gold-700/30">
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-gold-300">{t.noCharacters}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full h-full flex flex-col flex-1"
    >
      <Card className="bg-bunker-800/90 backdrop-blur-sm border border-gold-700/30 w-full max-w-none h-full min-h-full flex-1">
        <CardHeader>
          <CardTitle className="text-gold-400 flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            {t.characters}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 md:p-8 flex-1">
          <div className="mb-4 p-3 bg-bunker-700/50 border border-gold-700/30 text-gold-300 rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-gold-400" />
            {t.accountDisconnected}
          </div>

          {/* Mensaje de éxito o error */}
          {actionSuccess && (
            <div className="mb-4 p-3 bg-green-900/30 border border-green-500/30 text-green-300 rounded-md">
              {actionSuccess}
            </div>
          )}
          {actionError && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-500/30 text-red-300 rounded-md">{actionError}</div>
          )}

          {/* Lista de personajes */}
          <div className="space-y-6">
            {characters.map((character) => (
              <div
                key={character.Name}
                className="bg-bunker-900/80 rounded-lg p-4 md:p-6 border border-gold-500/30 hover:border-gold-500/50 transition-colors shadow-lg hover:shadow-gold-500/10"
              >
                <div className="flex flex-row items-center gap-4 mb-4">
                  {/* Avatar del personaje */}
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gold-500/50 shadow-lg shadow-gold-500/20">
                    <img
                      src={classAvatars[character.Class] || "/placeholder.svg?height=64&width=64&text=Avatar"}
                      alt={classNames[character.Class] || `Class ${character.Class}`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Nombre del personaje */}
                  <div>
                    <h3 className="text-2xl font-bold text-gold-300">{character.Name}</h3>
                    <p className="text-gold-400 text-sm">{classNames[character.Class] || `Class ${character.Class}`}</p>
                  </div>
                </div>

                {/* Información básica y estadísticas en formato horizontal */}
                <div className="flex flex-col space-y-4">
                  {/* Fila 1: Clase, Nivel, Resets, Puntos */}
                  <div className="flex flex-row justify-between gap-4">
                    <div className="w-1/4 pr-4">
                      <p className="text-gold-400 text-sm font-semibold">{t.class}</p>
                      <p className="text-gold-100 font-medium text-lg">
                        {classNames[character.Class] || `Class ${character.Class}`}
                      </p>
                    </div>
                    <div className="w-1/4 px-2">
                      <p className="text-gold-400 text-sm font-semibold">{t.level}</p>
                      <p className="text-gold-100 font-medium text-lg">{character.cLevel}</p>
                    </div>
                    <div className="w-1/4 px-2">
                      <p className="text-gold-400 text-sm font-semibold">{t.resets}</p>
                      <p className="text-gold-100 font-medium text-lg">{character.Resets}</p>
                    </div>
                    <div className="w-1/4 pl-2">
                      <p className="text-gold-400 text-sm font-semibold">{t.points}</p>
                      <p className="text-gold-100 font-medium text-lg">{character.LevelUpPoint}</p>
                    </div>
                  </div>

                  {/* Fila 2: Estadísticas */}
                  <div>
                    <p className="text-gold-400 text-sm font-semibold mb-2">{t.stats}</p>
                    <div className="flex flex-row justify-between gap-4">
                      <div className="w-1/4 pr-4">
                        <p className="text-gold-300 text-sm font-semibold">{t.strength}</p>
                        <p className="text-gold-100 font-medium text-lg">{character.Strength}</p>
                      </div>
                      <div className="w-1/4 px-2">
                        <p className="text-gold-300 text-sm font-semibold">{t.dexterity}</p>
                        <p className="text-gold-100 font-medium text-lg">{character.Dexterity}</p>
                      </div>
                      <div className="w-1/4 px-2">
                        <p className="text-gold-300 text-sm font-semibold">{t.vitality}</p>
                        <p className="text-gold-100 font-medium text-lg">{character.Vitality}</p>
                      </div>
                      <div className="w-1/4 pl-2">
                        <p className="text-gold-300 text-sm font-semibold">{t.energy}</p>
                        <p className="text-gold-100 font-medium text-lg">{character.Energy}</p>
                      </div>
                    </div>
                  </div>

                  {/* Fila 3: Botones de acción */}
                  <div className="flex flex-wrap gap-3 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-bunker-800 border-gold-700/30 text-gold-400 hover:bg-bunker-700 hover:text-gold-300"
                      onClick={() => {
                        setSelectedCharacter(character)
                        document.getElementById(`unstick-dialog-${character.Name}`)?.click()
                      }}
                    >
                      {t.unstick}
                    </Button>
                  </div>
                </div>

                {/* Diálogos para cada acción */}
                <Dialog>
                  <DialogTrigger asChild>
                    <button id={`unstick-dialog-${character.Name}`} className="hidden" />
                  </DialogTrigger>
                  <DialogContent className="bg-bunker-900 border border-gold-500/30">
                    <DialogTitle className="text-gold-400">{t.unstick}</DialogTitle>
                    <DialogDescription className="text-gold-200">{t.confirmUnstick}</DialogDescription>
                    <div className="flex justify-end gap-3 mt-4">
                      <Button
                        variant="outline"
                        className="bg-bunker-800 border-gold-700/30 text-gold-400 hover:bg-bunker-700 hover:text-gold-300"
                        onClick={() => unstickCharacter(character.Name)}
                        disabled={actionLoading}
                      >
                        {actionLoading ? "..." : t.yes}
                      </Button>
                      <Button variant="ghost" className="text-bunker-300 hover:text-bunker-100 hover:bg-bunker-800">
                        {t.no}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
