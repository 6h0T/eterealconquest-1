"use client"

import { useState, useEffect } from "react"
import { Trophy, Award, Crown, Star, Heart, Users, Swords, AlertTriangle } from "lucide-react"
import type { Locale } from "@/i18n/config"
import { ClassAvatar } from "./class-avatar"
import { fetchFromApi } from "@/lib/api-utils"
import "@/app/medal-glow.css"

interface RankingsTableProps {
  type: string
  lang?: Locale
}

interface RankingData {
  ranking: any[]
  success: boolean
  isDemo?: boolean
  message?: string
}

// URLs de las medallas para los tres primeros puestos
const MEDAL_IMAGES = {
  first: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/top%201-6DjGqpIPDrU9YNWeYbjeAlG6Y338Dm.png",
  second: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/top2-OJEmiPszC4EfERmrfPLgdXk8xkEwHB.png",
  third: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/top3-fLLATFbqhx4T4GczDlIj4PKmhy5OVZ.png",
}

const rankingTypes = [
  { id: "level", label: "Level" },
  { id: "resets", label: "Resets" },
  { id: "grandresets", label: "Grand Resets" },
  { id: "killers", label: "Killers" },
  { id: "guilds", label: "Guilds" },
  { id: "votes", label: "Votes" },
  { id: "online", label: "Online" },
  { id: "gens", label: "Gens" },
  { id: "master", label: "Master Level" },
]

export function RankingsTable({ type = "resets", lang = "es" }: RankingsTableProps) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>("")
  const [isDemo, setIsDemo] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  // Traducciones específicas para la tabla de rankings
  const translations = {
    es: {
      loading: "Cargando rankings...",
      error: "Error al cargar los rankings",
      retry: "Reintentar",
      position: "Posición",
      name: "Nombre",
      level: "Nivel",
      resets: "Resets",
      grandresets: "Grand Resets",
      kills: "Asesinatos",
      guild: "Guild",
      master: "Líder",
      score: "Puntuación",
      account: "Cuenta",
      votes: "Votos",
      family: "Familia",
      contribution: "Contribución",
      class: "Clase",
      noData: "No hay datos disponibles",
      masterLevel: "Master Level",
      demoData: "Mostrando datos de ejemplo",
      noGuild: "Sin Clan", // Cambiado de "Sin Clan" a "Sin Clan" para mantener consistencia
    },
    en: {
      loading: "Loading rankings...",
      error: "Error loading rankings",
      retry: "Retry",
      position: "Position",
      name: "Name",
      level: "Level",
      resets: "Resets",
      grandresets: "Grand Resets",
      kills: "Kills",
      guild: "Guild",
      master: "Leader",
      score: "Score",
      account: "Account",
      votes: "Votes",
      family: "Family",
      contribution: "Contribution",
      class: "Class",
      noData: "No data available",
      masterLevel: "Master Level",
      demoData: "Showing sample data",
      noGuild: "No Guild",
    },
    pt: {
      loading: "Carregando rankings...",
      error: "Erro ao carregar rankings",
      retry: "Tentar novamente",
      position: "Posição",
      name: "Nome",
      level: "Nível",
      resets: "Resets",
      grandresets: "Grand Resets",
      kills: "Assassinatos",
      guild: "Guild",
      master: "Líder",
      score: "Pontuação",
      account: "Conta",
      votes: "Votos",
      family: "Família",
      contribution: "Contribution",
      class: "Classe",
      noData: "Não há dados disponíveis",
      masterLevel: "Master Level",
      demoData: "Mostrando dados de exemplo",
      noGuild: "Sem Clã",
    },
  }

  const t = translations[lang as keyof typeof translations]

  // Asegurarse de que el mapeo de classNames esté completo y correcto
  // Mapeo de clases para mostrar nombres legibles
  const classNames: Record<number, string> = {
    0: "Dark Wizard",
    1: "Soul Master",
    2: "Grand Master", // Añadido
    16: "Dark Knight",
    17: "Blade Knight",
    18: "Blade Master", // Añadido
    32: "Fairy Elf",
    33: "Muse Elf",
    34: "High Elf", // Añadido
    48: "Magic Gladiator",
    49: "Duel Master", // Añadido
    64: "Dark Lord",
    65: "Lord Emperor", // Añadido
    80: "Summoner",
    81: "Bloody Summoner", // Añadido
    82: "Dimension Master", // Añadido
    96: "Rage Fighter",
    97: "Fist Master", // Añadido
    98: "Fist Blazer", // Añadido
    // Añadir más clases según sea necesario
  }

  // Asegurarse de que el mapeo de gensFamilies esté completo y correcto
  // Mapeo de familias Gens
  const gensFamilies: Record<number, string> = {
    1: "Duprian",
    2: "Vanert",
  }

  // Cargar datos del ranking
  useEffect(() => {
    const fetchRankings = async () => {
      setIsLoading(true)
      setError(null)
      setIsDemo(false)
      setMessage(null)

      try {
        // Add a timeout to the fetch request
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

        console.log(`Fetching rankings for: ${type}`)
        const result = await fetchFromApi<RankingData>(`ranking/${type}`, {
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!result.success) {
          throw new Error(result.message || "Error desconocido")
        }

        // Set demo flag if the data is mock data
        if (result.isDemo) {
          setIsDemo(true)
          setMessage(result.message || t.demoData)
        }

        // Process the data to ensure all variants of "Sin Guild" are displayed as "No Guild"
        const processedData = result.ranking.map((item) => {
          // Verificar todas las posibles variantes truncadas o incorrectas
          if (
            item.Guild === "Sin Guil" ||
            item.Guild === "Sin Gui" ||
            item.Guild === "Sin G" ||
            item.Guild === "Sin Guild" ||
            !item.Guild ||
            item.Guild === ""
          ) {
            return { ...item, Guild: t.noGuild }
          }
          return item
        })

        // Set the ranking data
        setData(processedData || [])
      } catch (err: any) {
        console.error("Error fetching rankings:", err)
        let errorMessage = "Error desconocido al cargar los datos"

        if (err.name === "AbortError") {
          errorMessage = "La solicitud ha excedido el tiempo de espera. Por favor, inténtelo de nuevo."
        } else if (err.message === "Failed to fetch") {
          errorMessage = "No se pudo conectar con el servidor. Verifique su conexión o inténtelo más tarde."
        } else {
          errorMessage = err.message || "Error desconocido al cargar los datos"
        }

        setError(errorMessage)

        // Generate mock data for the UI even when there's an error
        setData(getMockDataForType(type))
        setIsDemo(true)
        setMessage(t.demoData)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRankings()
  }, [type, t.noGuild])

  // Function to generate mock data for development/testing
  const getMockDataForType = (type: string): any[] => {
    const baseData = Array.from({ length: 10 }, (_, i) => ({
      Name: `Player${i + 1}`,
      Class: Math.floor(Math.random() * 5) * 16, // Random class
      cLevel: Math.floor(Math.random() * 400) + 100,
      Resets: Math.floor(Math.random() * 20),
      Guild: i % 3 === 0 ? "TestGuild" : "No Guild", // Cambiado a "No Guild"
    }))

    switch (type) {
      case "level":
        return baseData.sort((a, b) => b.cLevel - a.cLevel)
      case "resets":
        return baseData.sort((a, b) => b.Resets - a.Resets)
      case "killers":
        return baseData
          .map((item) => ({ ...item, PkCount: Math.floor(Math.random() * 100) }))
          .sort((a, b) => b.PkCount - a.PkCount)
      case "guilds":
        return Array.from({ length: 10 }, (_, i) => ({
          G_Name: `Guild${i + 1}`,
          G_Master: `Master${i + 1}`,
          G_Score: Math.floor(Math.random() * 10000),
        })).sort((a, b) => b.G_Score - a.G_Score)
      case "grandresets":
        return baseData
          .map((item) => ({ ...item, GrandResets: Math.floor(Math.random() * 5) }))
          .sort((a, b) => b.GrandResets - a.GrandResets)
      case "gens":
        return baseData
          .map((item) => ({ ...item, GensContribution: Math.floor(Math.random() * 5000) }))
          .sort((a, b) => b.GensContribution - a.GensContribution)
      case "votes":
        return Array.from({ length: 10 }, (_, i) => ({
          username: `User${i + 1}`,
          votes: Math.floor(Math.random() * 100),
        })).sort((a, b) => b.votes - a.votes)
      case "online":
        return baseData.slice(0, 5) // Fewer online players
      case "master":
        return baseData
          .map((item) => ({ ...item, MasterLevel: Math.floor(Math.random() * 200) }))
          .sort((a, b) => b.MasterLevel - a.MasterLevel)
      default:
        return baseData
    }
  }

  // Función para obtener el icono según el tipo de ranking
  const getRankingIcon = () => {
    switch (type) {
      case "level":
        return <Star className="h-6 w-6 text-gold-400" />
      case "resets":
      case "grandresets":
        return <Award className="h-6 w-6 text-gold-400" />
      case "killers":
        return <Swords className="h-6 w-6 text-gold-400" />
      case "guilds":
        return <Crown className="h-6 w-6 text-gold-400" />
      case "votes":
        return <Heart className="h-6 w-6 text-gold-400" />
      case "online":
        return <Users className="h-6 w-6 text-gold-400" />
      case "gens":
        return <Trophy className="h-6 w-6 text-gold-400" />
      case "master":
        return <Star className="h-6 w-6 text-gold-400" />
      default:
        return <Star className="h-6 w-6 text-gold-400" />
    }
  }

  // Función para renderizar el indicador de posición (medalla o número)
  const renderPositionIndicator = (position: number) => {
    if (position === 1) {
      return (
        <div className="medal-container">
          <div className="medal-glow first">
            <img
              src={MEDAL_IMAGES.first || "/placeholder.svg"}
              alt="Top 1"
              width={32}
              height={32}
              className="inline-block"
            />
          </div>
        </div>
      )
    } else if (position === 2) {
      return (
        <div className="medal-container">
          <div className="medal-glow second">
            <img
              src={MEDAL_IMAGES.second || "/placeholder.svg"}
              alt="Top 2"
              width={30}
              height={30}
              className="inline-block"
            />
          </div>
        </div>
      )
    } else if (position === 3) {
      return (
        <div className="medal-container">
          <div className="medal-glow third">
            <img
              src={MEDAL_IMAGES.third || "/placeholder.svg"}
              alt="Top 3"
              width={28}
              height={28}
              className="inline-block"
            />
          </div>
        </div>
      )
    } else {
      return (
        <div className="inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-bunker-950 bg-gray-400">
          {position}
        </div>
      )
    }
  }

  // Renderizar estado de carga
  if (isLoading) {
    return (
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-400 mx-auto mb-4"></div>
        <p className="text-gold-300">{t.loading}</p>
      </div>
    )
  }

  // Get column headers based on ranking type
  const getHeaders = () => {
    switch (type) {
      case "level":
        return (
          <tr className="bg-bunker-800 border-b border-gold-600">
            <th className="px-4 py-2 text-left">#</th>
            <th className="px-4 py-2 text-left">{t.name}</th>
            <th className="px-4 py-2 text-left">{t.level}</th>
            <th className="px-4 py-2 text-left">{t.class}</th>
            <th className="px-4 py-2 text-left min-w-[120px]">{t.guild}</th>
          </tr>
        )
      case "resets":
        return (
          <tr className="bg-bunker-800 border-b border-gold-600">
            <th className="px-4 py-2 text-left">#</th>
            <th className="px-4 py-2 text-left">{t.name}</th>
            <th className="px-4 py-2 text-left">{t.class}</th>
            <th className="px-4 py-2 text-left">{t.resets}</th>
            <th className="px-4 py-2 text-left">{t.level}</th>
          </tr>
        )
      case "killers":
        return (
          <tr className="bg-bunker-800 border-b border-gold-600">
            <th className="px-4 py-2 text-left">#</th>
            <th className="px-4 py-2 text-left">{t.name}</th>
            <th className="px-4 py-2 text-left">{t.class}</th>
            <th className="px-4 py-2 text-left">{t.kills}</th>
          </tr>
        )
      case "guilds":
        return (
          <tr className="bg-bunker-800 border-b border-gold-600">
            <th className="px-4 py-2 text-left">#</th>
            <th className="px-4 py-2 text-left">{t.guild}</th>
            <th className="px-4 py-2 text-left">{t.master}</th>
            <th className="px-4 py-2 text-left">{t.score}</th>
          </tr>
        )
      default:
        return (
          <tr className="bg-bunker-800 border-b border-gold-600">
            <th className="px-4 py-2 text-left">#</th>
            <th className="px-4 py-2 text-left">{t.name}</th>
            <th className="px-4 py-2 text-left">{t.class}</th>
            <th className="px-4 py-2 text-left">{t.value}</th>
          </tr>
        )
    }
  }

  // Get row data based on ranking type
  const getRowData = (char: any, i: number) => {
    const getClassName = (classId: number) => {
      return classNames[classId] || `Class ${classId}`
    }

    // Función para renderizar la celda de guild
    const renderGuildCell = (guild: string) => (
      <td className="px-4 py-2 min-w-[120px]">
        {guild === "Sin Guil" ||
        guild === "Sin Gui" ||
        guild === "Sin G" ||
        guild === "Sin Guild" ||
        !guild ||
        guild === "" ||
        guild === t.noGuild ? (
          <span className="text-gray-400">Sin Clan</span>
        ) : (
          <span className="font-medium text-gold-100">{guild}</span>
        )}
      </td>
    )

    // Función para renderizar la celda de nombre (sin avatar)
    const renderNameCell = (name: string) => <td className="px-4 py-2">{name}</td>

    // Función para renderizar la celda de clase con icono
    const renderClassCell = (classId: number) => (
      <td className="px-4 py-2">
        <div className="flex items-center gap-2">
          <ClassAvatar classId={classId} size={28} />
          <span>{getClassName(classId)}</span>
        </div>
      </td>
    )

    switch (type) {
      case "level":
        return (
          <tr key={i} className="hover:bg-bunker-700 border-b border-gold-700/30">
            <td className="px-4 py-2">{renderPositionIndicator(i + 1)}</td>
            {renderNameCell(char.Name)}
            <td className="px-4 py-2">{char.cLevel}</td>
            {renderClassCell(char.Class)}
            {renderGuildCell(char.Guild)}
          </tr>
        )
      case "resets":
        return (
          <tr key={i} className="hover:bg-bunker-700 border-b border-gold-700/30">
            <td className="px-4 py-2">{renderPositionIndicator(i + 1)}</td>
            {renderNameCell(char.Name)}
            {renderClassCell(char.Class)}
            <td className="px-4 py-2">{char.Resets}</td>
            <td className="px-4 py-2">{char.cLevel}</td>
          </tr>
        )
      case "killers":
        return (
          <tr key={i} className="hover:bg-bunker-700 border-b border-gold-700/30">
            <td className="px-4 py-2">{renderPositionIndicator(i + 1)}</td>
            {renderNameCell(char.Name)}
            {renderClassCell(char.Class)}
            <td className="px-4 py-2 text-red-400 font-medium">{char.PkCount}</td>
          </tr>
        )
      case "guilds":
        return (
          <tr key={i} className="hover:bg-bunker-700 border-b border-gold-700/30">
            <td className="px-4 py-2">{renderPositionIndicator(i + 1)}</td>
            <td className="px-4 py-2 font-medium text-gold-300">{char.G_Name}</td>
            <td className="px-4 py-2">{char.G_Master}</td>
            <td className="px-4 py-2 text-gold-400 font-medium">{char.G_Score}</td>
          </tr>
        )
      case "gens":
        return (
          <tr key={i} className="hover:bg-bunker-700 border-b border-gold-700/30">
            <td className="px-4 py-2">{renderPositionIndicator(i + 1)}</td>
            {renderNameCell(char.Name)}
            {renderClassCell(char.Class)}
            <td className="px-4 py-2">{gensFamilies[char.GensFamily] || `Family ${char.GensFamily}`}</td>
            <td className="px-4 py-2">{char.GensContribution}</td>
          </tr>
        )
      default:
        return (
          <tr key={i} className="hover:bg-bunker-700 border-b border-gold-700/30">
            <td className="px-4 py-2">{renderPositionIndicator(i + 1)}</td>
            {char.Class !== undefined ? (
              renderNameCell(char.Name || "N/A")
            ) : (
              <td className="px-4 py-2">{char.Name || char.username || "N/A"}</td>
            )}
            {char.Class !== undefined ? renderClassCell(char.Class) : <td className="px-4 py-2">N/A</td>}
            <td className="px-4 py-2">N/A</td>
          </tr>
        )
    }
  }

  return (
    <div className="overflow-x-auto rounded-md shadow-md bg-bunker-900/90 border border-gold-600 p-4">
      {isDemo && (
        <div className="bg-gold-500/20 text-gold-100 p-2 mb-4 rounded flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <span>{message || t.demoData}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 text-red-100 p-2 mb-4 rounded flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      <table className="min-w-full text-gold-100 text-sm">
        <thead>{getHeaders()}</thead>
        <tbody>
          {data.length > 0 ? (
            data.map((char, i) => getRowData(char, i))
          ) : (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-gold-300">
                {t.noData}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
