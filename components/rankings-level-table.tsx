"use client"

import { useEffect, useState } from "react"
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { useLanguage } from "@/i18n/context"
import { ClassAvatar } from "./class-avatar"
import { fetchFromApi } from "@/lib/api-utils"
import "@/app/medal-glow.css"
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination"

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
  const { language } = useLanguage()
  const [characters, setCharacters] = useState<CharacterData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const noGuildText = getNoGuildTranslation(language)

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
  }, [language, noGuildText])

  // Textos según el idioma
  const getLocalizedText = () => {
    switch (language) {
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
          prevPage: "Previous",
          nextPage: "Next",
          page: "Page",
          of: "of",
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
          prevPage: "Anterior",
          nextPage: "Próximo",
          page: "Página",
          of: "de",
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
          prevPage: "Anterior",
          nextPage: "Siguiente",
          page: "Página",
          of: "de",
        }
    }
  }

  const text = getLocalizedText()

  // Cálculos para la paginación
  const totalPages = Math.ceil(characters.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = characters.slice(indexOfFirstItem, indexOfLastItem);

  // Funciones para la paginación
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Función para cambiar a una página específica
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

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

  if (loading) {
    return (
      <div className="text-center p-8">
        <Loader2 className="h-12 w-12 animate-spin text-gold-400 mx-auto mb-4" />
        <p className="text-gold-300">{text.loading}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="bg-red-500/20 text-red-100 p-4 rounded-md mb-4">
          <p>{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gold-600 text-bunker-950 rounded-md hover:bg-gold-500 transition-colors"
        >
          {text.retry}
        </button>
      </div>
    )
  }

  if (!characters || characters.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gold-300">{text.noCharacters}</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-md shadow-md bg-bunker-900/90 border border-gold-600 p-4">
      <table className="min-w-full text-gold-100 text-sm">
        <thead>
          <tr className="bg-bunker-800 border-b border-gold-600">
            <th className="px-4 py-2 text-left">#</th>
            <th className="px-4 py-2 text-left">{text.character}</th>
            <th className="px-4 py-2 text-left">{text.level}</th>
            <th className="px-4 py-2 text-left">{text.class}</th>
            <th className="px-4 py-2 text-left min-w-[120px]">Guild</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((character, index) => (
            <tr key={indexOfFirstItem + index} className="hover:bg-bunker-700 border-b border-gold-700/30">
              <td className="px-4 py-2">
                {renderPositionIndicator(indexOfFirstItem + index + 1)}
              </td>
              <td className="px-4 py-2">{character.Name}</td>
              <td className="px-4 py-2">{character.cLevel}</td>
              <td className="px-4 py-2">
                <div className="flex items-center gap-2">
                  <ClassAvatar classId={character.Class} size={28} />
                  <span>{getClassName(character.Class)}</span>
                </div>
              </td>
              <td className="px-4 py-2 min-w-[120px]">
                {character.Guild === noGuildText ? (
                  <span className="text-gray-400">{noGuildText}</span>
                ) : (
                  <span className="font-medium text-gold-100">{character.Guild}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Controles de paginación con Pagination de shadcn/ui */}
      {characters.length > itemsPerPage && (
        <div className="mt-4 border-t border-gold-700/30 pt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded border border-gold-700/30 ${
                    currentPage === 1
                      ? "bg-bunker-800/70 text-gold-500/50 cursor-not-allowed"
                      : "bg-bunker-800 text-gold-400 hover:bg-bunker-700 hover:text-gold-300"
                  }`}
                >
                  <ChevronLeft className="h-4 w-4" />
                  {text.prevPage}
                </button>
              </PaginationItem>
              
              {/* Número de página actual y total */}
              <PaginationItem>
                <span className="mx-2 text-gold-400">
                  {text.page} {currentPage} {text.of} {totalPages}
                </span>
              </PaginationItem>
              
              {/* Números de página */}
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                // Mostrar hasta 5 páginas alrededor de la actual
                let pageToShow: number;
                
                if (totalPages <= 5) {
                  // Si hay 5 o menos páginas, mostrarlas todas
                  pageToShow = i + 1;
                } else {
                  // Calcular qué páginas mostrar
                  const startPage = Math.max(1, currentPage - 2);
                  
                  // Ajustar si estamos cerca del final
                  if (startPage + 4 > totalPages) {
                    pageToShow = totalPages - 4 + i;
                  } else {
                    pageToShow = startPage + i;
                  }
                  
                  // Asegurarse de que pageToShow no sea menor que 1
                  if (pageToShow < 1) {
                    pageToShow = 1;
                  }
                }
                
                // No mostrar números de página fuera del rango total
                if (pageToShow > totalPages) return null;
                
                return (
                  <PaginationItem key={pageToShow}>
                    <button
                      onClick={() => goToPage(pageToShow)}
                      className={`w-8 h-8 flex items-center justify-center rounded ${
                        currentPage === pageToShow
                          ? "bg-gold-600 text-bunker-950 font-bold"
                          : "bg-bunker-800 text-gold-400 hover:bg-bunker-700"
                      }`}
                    >
                      {pageToShow}
                    </button>
                  </PaginationItem>
                );
              })}
              
              <PaginationItem>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded border border-gold-700/30 ${
                    currentPage === totalPages
                      ? "bg-bunker-800/70 text-gold-500/50 cursor-not-allowed"
                      : "bg-bunker-800 text-gold-400 hover:bg-bunker-700 hover:text-gold-300"
                  }`}
                >
                  {text.nextPage}
                  <ChevronRight className="h-4 w-4" />
                </button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}
