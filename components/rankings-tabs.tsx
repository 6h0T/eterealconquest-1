"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { fetchFromApi } from "@/lib/api-utils"
import { ClassAvatar } from "./class-avatar"
import "@/app/medal-glow.css"

// Modificado para ocultar la pestaña "online" y "reset"
const tabs = [
  { key: "level", label: "Nivel" },
  { key: "killers", label: "PK" },
  { key: "guilds", label: "Guilds" },
]

// URLs de las medallas para los tres primeros puestos
const MEDAL_IMAGES = {
  first: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/top%201-6DjGqpIPDrU9YNWeYbjeAlG6Y338Dm.png",
  second: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/top2-OJEmiPszC4EfERmrfPLgdXk8xkEwHB.png",
  third: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/top3-fLLATFbqhx4T4GczDlIj4PKmhy5OVZ.png",
}

interface RankingResponse {
  success: boolean
  ranking?: any[]
  error?: string
  message?: string
}

export function RankingsTabs() {
  const [activeTab, setActiveTab] = useState("level")
  const [data, setData] = useState<any[]>([])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = async () => {
    setIsLoading(true)
    setError("")

    try {
      console.log(`Fetching rankings for: ${activeTab}`)

      const json: RankingResponse = await fetchFromApi(`ranking/${activeTab}`)
      console.log("Rankings data received:", json)

      if (!json.success) {
        throw new Error(json.error || "Error desconocido en la respuesta")
      }

      if (!json.ranking || !Array.isArray(json.ranking) || json.ranking.length === 0) {
        console.warn("No ranking data found in response")
        setData([])
        setError("No hay datos de ranking disponibles.")
      } else {
        setData(json.ranking)
      }
    } catch (err: any) {
      console.error("Ranking error:", err)
      setError(`No se pudo obtener el ranking: ${err.message || "Error desconocido"}`)
      setData([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const handleRetry = () => {
    fetchData()
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
      return <span className="text-gold-100">{position}</span>
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              tab.key === activeTab ? "bg-gold-500 text-bunker-900" : "bg-bunker-700 text-gold-300 hover:bg-bunker-600"
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gold-400 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-gold-300">Cargando rankings...</p>
        </div>
      ) : error ? (
        <div className="text-red-400 text-center p-4 bg-bunker-800/50 rounded-lg border border-red-900/30">
          <p>{error}</p>
          <button
            onClick={handleRetry}
            className="mt-4 px-4 py-2 bg-gold-600 hover:bg-gold-700 text-bunker-900 rounded-md transition-colors"
          >
            Reintentar
          </button>
        </div>
      ) : data.length === 0 ? (
        <div className="text-gold-300 text-center p-4 bg-bunker-800/50 rounded-lg">
          <p>No hay datos disponibles para este ranking.</p>
        </div>
      ) : (
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-x-auto"
        >
          <table className="w-full text-sm border-collapse bg-bunker-900/80 backdrop-blur-sm border border-gold-700/40 rounded-md overflow-hidden">
            <thead>
              <tr className="bg-bunker-800 text-gold-200 text-left">
                <th className="px-4 py-2 border-b border-gold-700/20">#</th>
                {data[0] &&
                  Object.keys(data[0]).map((key) => (
                    <th key={key} className="px-4 py-2 capitalize border-b border-gold-700/20">
                      {key === "cLevel"
                        ? "Nivel"
                        : key === "PkCount"
                          ? "Asesinatos"
                          : key === "G_Name"
                            ? "Guild"
                            : key === "G_Master"
                              ? "Líder"
                              : key === "G_Score"
                                ? "Puntos"
                                : key === "Class"
                                  ? "Clase"
                                  : key === "Name"
                                    ? "Personaje"
                                    : key === "Guild"
                                      ? "Guild"
                                      : key}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {data.map((entry, i) => (
                <tr key={i} className="hover:bg-bunker-800 text-gold-100 border-b border-gold-700/10">
                  <td className="px-4 py-2">{renderPositionIndicator(i + 1)}</td>
                  {Object.entries(entry).map(([key, val], j) => (
                    <td key={j} className="px-4 py-2">
                      {key === "Name" ? (
                        <span>{val}</span>
                      ) : key === "Class" ? (
                        <div className="flex items-center gap-2">
                          <ClassAvatar classId={val as number} size={24} />
                          <span>{getClassName(val as number)}</span>
                        </div>
                      ) : key === "cLevel" ? (
                        <span className={activeTab === "level" ? "text-red-400 font-medium" : ""}>{val}</span>
                      ) : key === "PkCount" ? (
                        <span className="text-red-400 font-medium">{val}</span>
                      ) : key === "Guild" ? (
                        <span
                          className={`px-2 py-1 rounded ${
                            val === "Sin Guild" ||
                            val === "Sin Guil" ||
                            val === "Sin Gui" ||
                            val === "Sin G" ||
                            !val ||
                            val === ""
                              ? "text-gray-400"
                              : "bg-gold-900/30 text-gold-300"
                          }`}
                        >
                          {val === "Sin Guild" ||
                          val === "Sin Guil" ||
                          val === "Sin Gui" ||
                          val === "Sin G" ||
                          !val ||
                          val === ""
                            ? "Sin Clan"
                            : val}
                        </span>
                      ) : key === "G_Name" ? (
                        <span className="font-medium text-gold-300">{val}</span>
                      ) : key === "G_Master" ? (
                        <span>{val}</span>
                      ) : key === "G_Score" ? (
                        <span className="text-gold-400 font-medium">{val}</span>
                      ) : val !== null && val !== undefined ? (
                        String(val)
                      ) : (
                        ""
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  )

  function getClassName(classId: number): string {
    // Mapeo de IDs de clase a nombres con emojis
    const classMap: Record<number, string> = {
      // Dark Wizard (DW)
      0: "Dark Wizard",
      1: "Soul Master",
      2: "Grand Master",

      // Dark Knight (DK)
      16: "Dark Knight",
      17: "Blade Knight",
      18: "Blade Master",

      // Fairy Elf (ELF)
      32: "Fairy Elf",
      33: "Muse Elf",
      34: "High Elf",

      // Magic Gladiator (MG)
      48: "Magic Gladiator",
      49: "Magic Gladiator",
      50: "Duel Master",

      // Dark Lord (DL)
      64: "Dark Lord",
      65: "Lord Emperor",
      66: "Lord Emperor",

      // Summoner
      80: "Summoner",
      81: "Bloody Summoner",
      82: "Dimension Master",

      // Rage Fighter
      96: "Rage Fighter",
      97: "Fist Master",
      98: "Fist Master",

      // Otros IDs que podrían existir
      112: "Grow Lancer",
      114: "Mirage Lancer",
      128: "Rune Wizard",
      129: "Rune Spell Master",
      130: "Grand Rune Master",
      144: "Slayer",
      145: "Royal Slayer",
      146: "Master Slayer",
      160: "Gun Crusher",
      161: "Gun Breaker",
      162: "Master Gun Breaker",
    }

    return classMap[classId] || `Clase ${classId}`
  }
}
