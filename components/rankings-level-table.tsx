"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { useLanguage } from "@/i18n/context"
import { ClassAvatar } from "./class-avatar"
import { fetchFromApi } from "@/lib/api-utils"
import "@/app/medal-glow.css"

// Definir la interfaz para los datos del personaje
interface CharacterData {
  Name: string
  cLevel: number
  Class: number
  Resets: number
  Guild?: string // Make Guild optional
}

interface RankingResponse {
  success: boolean
  ranking?: CharacterData[]
  error?: string
}

// URLs de las medallas para los tres primeros puestos
const MEDAL_IMAGES = {
  first: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/top%201-6DjGqpIPDrU9YNWeYbjeAlG6Y338Dm.png",
  second: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/top2-OJEmiPszC4EfERmrfPLgdXk8xkEwHB.png",
  third: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/top3-fLLATFbqhx4T4GczDlIj4PKmhy5OVZ.png",
}

// Función para obtener el nombre de la clase basado en el ID
const getClassName = (classId: number): string => {
  const classes: Record<number, string> = {
    0: "Dark Wizard",
    1: "Soul Master",
    2: "Grand Master",
    16: "Dark Knight",
    17: "Blade Knight",
    18: "Blade Master",
    32: "Fairy Elf",
    33: "Muse Elf",
    34: "High Elf",
    48: "Magic Gladiator",
    49: "Duel Master",
    64: "Dark Lord",
    65: "Lord Emperor",
    80: "Summoner",
    81: "Bloody Summoner",
    82: "Dimension Master",
    96: "Rage Fighter",
    97: "Fist Master",
    98: "Fist Blaster",
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

  return classes[classId] || `Clase ${classId}`
}

// Función para obtener la traducción de "Sin Guild" según el idioma
const getNoGuildTranslation = (lang: string): string => {
  switch (lang) {
    case "en":
      return "No Guild"
    case "pt":
      return "Sem Clã"
    case "es":
    default:
      return "Sin Clan" // Cambiado de "Sin Clan" a "Sin Clan" para mantener consistencia
  }
}

export function RankingsLevelTable() {
  const { lang } = useLanguage()
  const [characters, setCharacters] = useState<CharacterData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const noGuildText = getNoGuildTranslation(lang)

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log("Fetching ranking data from /api/ranking/level")
        const data = await fetchFromApi<RankingResponse>("ranking/level")

        if (!data.success) {
          throw new Error(data.error || "Error desconocido al cargar el ranking")
        }

        // Corregir cualquier variante de "Sin Guild" a la traducción correspondiente
        const correctedRanking =
          data.ranking?.map((char) => ({
            ...char,
            Guild:
              char.Guild === "Sin Guil" ||
              char.Guild === "Sin Gui" ||
              char.Guild === "Sin G" ||
              char.Guild === "Sin Guild" ||
              !char.Guild ||
              char.Guild === ""
                ? noGuildText
                : char.Guild,
          })) || []

        setCharacters(correctedRanking)
      } catch (err: any) {
        console.error("Error fetching rankings:", err)
        setError(err.message || "No se pudieron cargar los rankings. Por favor, intenta de nuevo más tarde.")
      } finally {
        setLoading(false)
      }
    }

    fetchRankings()
  }, [lang, noGuildText])

  // Textos según el idioma
  const getLocalizedText = () => {
    switch (lang) {
      case "en":
        return {
          loading: "Loading rankings...",
          retry: "Retry",
          noCharacters: "No characters to display",
          position: "Position",
          character: "Character",
          level: "Level",
          class: "Class",
          resets: "Resets",
          error: "Could not load rankings. Please try again later.",
        }
      case "pt":
        return {
          loading: "Carregando rankings...",
          retry: "Tentar novamente",
          noCharacters: "Não há personagens para mostrar",
          position: "Posição",
          character: "Personagem",
          level: "Nível",
          class: "Classe",
          resets: "Resets",
          error: "Não foi possível carregar os rankings. Por favor, tente novamente mais tarde.",
        }
      case "es":
      default:
        return {
          loading: "Cargando rankings...",
          retry: "Reintentar",
          noCharacters: "No hay personajes para mostrar",
          position: "Posición",
          character: "Personaje",
          level: "Nivel",
          class: "Clase",
          resets: "Resets",
          error: "No se pudieron cargar los rankings. Por favor, intenta de nuevo más tarde.",
        }
    }
  }

  const text = getLocalizedText()

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

  return (
    <div className="w-full overflow-hidden rounded-lg border border-gold-500/30 bg-bunker-950/80 backdrop-blur-sm">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-gold-400" />
          <p className="mt-4 text-gold-100">{text.loading}</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gold-600 hover:bg-gold-500 text-bunker-950 font-medium rounded-md transition-colors"
          >
            {text.retry}
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gold-500/30 bg-bunker-900/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gold-300 uppercase tracking-wider">
                  {text.position}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gold-300 uppercase tracking-wider">
                  {text.character}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gold-300 uppercase tracking-wider">
                  {text.level}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gold-300 uppercase tracking-wider">
                  {text.class}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gold-300 uppercase tracking-wider">
                  {text.resets}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gold-300 uppercase tracking-wider">
                  Guild
                </th>
              </tr>
            </thead>
            <tbody>
              {characters.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gold-100">
                    {text.noCharacters}
                  </td>
                </tr>
              ) : (
                characters.map((character, index) => (
                  <tr
                    key={index}
                    className={`
                      border-b border-bunker-800/50 
                      ${index % 2 === 0 ? "bg-bunker-900/30" : "bg-bunker-950/50"}
                      hover:bg-gold-900/20 transition-colors
                    `}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">{renderPositionIndicator(index + 1)}</td>
                    {/* Columna de nombre SIN avatar - solo el texto del nombre */}
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-gold-100">{character.Name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-red-400 font-medium">{character.cLevel}</td>
                    {/* Columna de clase CON avatar */}
                    <td className="px-4 py-3 whitespace-nowrap text-gold-100">
                      <div className="flex items-center gap-2">
                        <ClassAvatar classId={character.Class} size={28} />
                        <span>{getClassName(character.Class)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gold-300 font-medium">{character.Resets}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {character.Guild === noGuildText ? (
                        <span className="text-gray-400">Sin Clan</span>
                      ) : (
                        <span className="font-medium text-gold-100">{character.Guild}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
