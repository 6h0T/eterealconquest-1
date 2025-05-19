"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { ChevronUp, ChevronDown, Play, Pause } from "lucide-react"
import { getDictionary } from "@/i18n/config"
import type { Locale } from "@/i18n/config"
import { motion, AnimatePresence } from "framer-motion"
import { characters } from "@/constants" // Importamos los personajes desde constants.tsx

// Nuevo estilo para los botones de categoría basado en el diseño de mrhyddenn
const categoryButtonStyle = `
  background: #fff;
  border: none;
  padding: 10px 20px;
  display: inline-block;
  font-size: 15px;
  font-weight: 600;
  width: 184px;
  text-transform: uppercase;
  cursor: pointer;
  transform: skew(-21deg);
  position: relative;
  overflow: hidden;
  z-index: 1;
  color: #000;
  transition: all 0.5s;
`

const categoryButtonActiveStyle = `
  color: #fff;
  background: #ffd700;
`

// Add this interface to match the structure in constants.tsx
interface SkillIcon {
  id: string
  img: string
}

// Update the character interface to include skillIcons
interface Character {
  id: string
  name: string
  img: string
  headerImg: string
  characterImg: string
  videos: {
    id: string
    title: string
    url: string
    vimeoId: string | null
    skillIcons?: SkillIcon[]
  }[]
  skillIcons?: SkillIcon[]
  fullImage: string
}

// Descripciones de las habilidades
const skillDescriptions = {
  // Dark Wizard
  cloakOfInvisibility: "Tras 2 segundos otorga invisibilidad por 30 segundos.",
  frostNova: "Congela a todos los enemigos (no aliados) durante la carga, y los congela por 4 segundos al liberar.",
  blast: "Alcance aumentado a 5.",

  // Dark Knight
  deathStab: "Habilidad de alto daño a un solo objetivo.",
  innerStrenght: "Ahora también empuja a todos los enemigos 5 casillas y tiene 15s de enfriamiento.",
  twistingSlash: "Habilidad de daño en área cercana.",
  crescentMoonSlash:
    "Habilidad de 7 rangos que consume mucho AG y permite cerrar distancia rápidamente. Puede ser usada como inicio de combo.",
  cyclone: "Combo de daño en área con gran potencial ofensivo.",

  // Fairy Elf - Agility
  starfall: "Habilidad de 11 rangos con alto consumo de AG, ideal para hostigar o rematar enemigos a distancia.",
  windRunner:
    "45s de enfriamiento. Aumenta la velocidad de movimiento en 50% e inmuniza contra efectos de ralentización por 15 segundos.",
  frostTrap:
    "Lanza una trampa que ralentiza enemigos cercanos y otorga a aliados el Tactical Edge Buff (mejora todas las estadísticas por un corto tiempo).",

  // Fairy Elf - Energy
  greaterEmpowerment: "Reemplaza Greater Defense & Damage. Aplica ambos buffos al grupo en un solo lanzamiento.",
  drowsyTouch:
    "Habilidad de corto alcance con 20s de enfriamiento que duerme al objetivo por 6 segundos (usable en todos los mapas).",
  sdRecovery: "Alcance, efecto y consumo de AG aumentados.",

  // Dark Lord
  earthshake: "Empuja a todos los enemigos alrededor sin necesidad de hacer clic sobre ellos.",
  overlord: "Habilidad con 60s de enfriamiento que otorga a todo el grupo inmunidad al daño por 6 segundos.",
  summon: "Ahora tiene barra de casteo y bajo cooldown. Si Dark Lord recibe daño mientras la lanza, se interrumpe.",
  fireBind: "Habilidad de 6 rangos que inmoviliza al objetivo y reduce su HP máximo en un -33%.",
  fireScream: "Habilidad explosiva con alto consumo de AG.",

  // Magic Gladiator - Energy
  manaRays:
    "Habilidad de 6 rangos con altísimo consumo de AG y 6s de enfriamiento. Empuja al objetivo 3 casillas hacia atrás.",

  // Magic Gladiator - Fuerza
  powerSlash: "Alto consumo de AG. Congela al objetivo y lo empuja una casilla hacia atrás.",
  spiralSlash: "Habilidad de 7 rangos con 30s de enfriamiento. Inicia combate con stun de 3s y slow de 6s.",
  flameStrike: "Alto consumo de AG, gran daño y reduce el HP máximo del objetivo en -33%, eficaz contra tanques.",

  // Summoner
  berserker: "70s de enfriamiento. Aumenta el daño en 70% y el AG en 400 durante 18 segundos.",
  curseOfWeakness: "Reduce tanto la defensa como el daño del objetivo. Usable en todos los mapas.",
  drainSoul: "Habilidad de 6 rangos con alto consumo de AG que drena SD al enemigo.",
  requiem: "Poderosa habilidad de daño en área.",
  sleep: "Usable en cualquier mapa.",

  // Rage Fighter
  beastUppercut: "Habilidad de alto consumo de AG que inflige gran daño y reduce el ataque del objetivo en 20%.",
  ironWill: "Habilidad de 70s de enfriamiento que otorga defensa, HP y SD por 18 segundos.",
  killingBlow: "Habilidad de alto consumo de AG que inflige gran daño y reduce el ataque del objetivo en 20%.",
  dragonSlash: "Ahora tiene 15s de enfriamiento y aplica stun de 3 segundos.",
}

// Variantes para las animaciones
const panelVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3 },
  },
}

// Variantes para el selector
const selectorVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.15, // Reducido de 0.3 a 0.15
      delay: 0.1, // Reducido de 0.6 a 0.1
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.15,
    },
  },
}

// Variantes para animaciones secuenciales
const headerVariants = {
  initial: { opacity: 0, y: -50 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.15, // Reducido de 0.3 a 0.15
      delay: 0.15, // Reducido de 0.65 a 0.15
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.15,
    },
  },
}

const characterImageVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.15, // Reducido de 0.3 a 0.15
      delay: 0.2, // Reducido de 0.7 a 0.2
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.15,
    },
  },
}

const descriptionVariants = {
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.15, // Reducido de 0.3 a 0.15
      delay: 0.25, // Reducido de 0.75 a 0.25
    },
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: {
      duration: 0.15,
    },
  },
}

const videoVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.15, // Reducido de 0.3 a 0.15
      delay: 0.3, // Reducido de 0.8 a 0.3
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.15,
    },
  },
}

// Variantes para el video de transición
const transitionVideoVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3 },
  },
}

// Modificar las variantes para la animación de expansión de habilidades para un efecto más suave de arriba hacia abajo
// Buscar esta sección:
// Y reemplazarla con:
const skillExpandVariants = {
  collapsed: {
    height: 0,
    opacity: 0,
    y: -20,
    scale: 0.98,
    transformOrigin: "top",
    overflow: "hidden",
  },
  expanded: {
    height: "auto",
    opacity: 1,
    y: 0,
    scale: 1,
    overflow: "hidden",
    transition: {
      height: { duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] },
      opacity: { duration: 0.25, delay: 0.05 },
      y: { duration: 0.4, ease: "easeOut" },
      scale: { duration: 0.3, ease: "easeOut" },
    },
  },
  exit: {
    height: 0,
    opacity: 0,
    y: -10,
    scale: 0.98,
    overflow: "hidden",
    transition: {
      height: { duration: 0.3, ease: "easeIn" },
      opacity: { duration: 0.2 },
      y: { duration: 0.3, ease: "easeIn" },
      scale: { duration: 0.2 },
    },
  },
}

interface CircularSliderProps {
  lang: Locale
}

export default function CircularSlider({ lang }: CircularSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [previousIndex, setPreviousIndex] = useState(0)
  const [dictionary, setDictionary] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)
  // Corregir la inicialización de isAnimating que está causando el error
  // Cambiar esta línea:
  // Por esta línea:
  const [isAnimating, setIsAnimating] = useState(false)
  const [showContent, setShowContent] = useState(true)
  const [showSelector, setShowSelector] = useState(true)
  // Eliminar o comentar el código relacionado con el video de transición
  // Eliminar estas líneas:
  const [showTransition, setShowTransition] = useState(false)
  const [activeVideoIndex, setActiveVideoIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true) // Iniciar como true para autoplay
  const [showOverlay, setShowOverlay] = useState(false)
  const [activeSkill, setActiveSkill] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  // Eliminar la referencia al video de transición que ya no necesitamos
  // Buscar esta línea:
  const vimeoIframeRef = useRef<HTMLIFrameElement>(null)
  const [vimeoPlayer, setVimeoPlayer] = useState<any>(null)
  // Eliminar la referencia al contenedor de habilidades que ya no necesitamos
  // const skillsContainerRef = useRef<HTMLDivElement>(null);
  // Eliminar o comentar el código relacionado con el video de transición
  // Eliminar estas líneas:
  const transitionVideoRef = useRef<HTMLVideoElement>(null)

  const loadDictionary = useCallback(async () => {
    setIsLoading(true)
    try {
      const dict = await getDictionary(lang)
      setDictionary(dict)
    } catch (error) {
      console.error("Error loading dictionary:", error)
    } finally {
      setIsLoading(false)
    }
  }, [lang])

  useEffect(() => {
    loadDictionary()
  }, [loadDictionary])

  // Cargar el script de Vimeo
  useEffect(() => {
    if (typeof window !== "undefined" && !window.Vimeo) {
      const script = document.createElement("script")
      script.src = "https://player.vimeo.com/api/player.js"
      script.async = true
      script.onload = () => {
        console.log("Vimeo API loaded")
      }
      document.body.appendChild(script)

      return () => {
        document.body.removeChild(script)
      }
    }
  }, [])

  // Reiniciar el índice de video activo cuando cambia la clase
  useEffect(() => {
    setActiveVideoIndex(0)
    setIsPlaying(true) // Asegurar que el nuevo video se reproduzca automáticamente
    setActiveSkill(null) // Resetear la habilidad activa al cambiar de clase
  }, [activeIndex])

  // Inicializar el reproductor de Vimeo cuando cambia el video activo
  useEffect(() => {
    let player: any = null

    // Always define these variables to avoid conditional hook issues
    const activeCharacter = characters[activeIndex]
    const activeVideo = activeCharacter.videos[activeVideoIndex]
    const hasVimeoId = activeVideo && activeVideo.vimeoId

    if (typeof window !== "undefined" && window.Vimeo && vimeoIframeRef.current && hasVimeoId) {
      try {
        player = new window.Vimeo.Player(vimeoIframeRef.current)
        setVimeoPlayer(player)

        player.on("play", () => {
          setIsPlaying(true)
        })

        player.on("pause", () => {
          setIsPlaying(false)
        })

        player.on("ended", () => {
          // Al finalizar, reiniciar y reproducir de nuevo
          player.setCurrentTime(0).then(() => {
            player.play().catch((error: any) => {
              console.error("Error al reproducir de nuevo el video de Vimeo:", error)
            })
          })
        })

        // Reproducir automáticamente el video
        player.play().catch((error: any) => {
          console.error("Error al reproducir automáticamente el video de Vimeo:", error)
        })
      } catch (error) {
        console.error("Error initializing Vimeo player:", error)
      }
    }

    return () => {
      if (player) {
        player.off("play")
        player.off("pause")
        player.off("ended")
        player.destroy()
      }
    }
  }, [activeIndex, activeVideoIndex])

  // Reproducir automáticamente videos locales cuando cambian
  useEffect(() => {
    const activeCharacter = characters[activeIndex]
    const activeVideo = activeCharacter.videos[activeVideoIndex]
    const isLocalVideo = activeVideo && activeVideo.url && activeVideo.url.startsWith("https://")

    if (videoRef.current && isLocalVideo) {
      videoRef.current.play().catch((error) => {
        console.error("Error al reproducir automáticamente el video local:", error)
      })
      setIsPlaying(true)
    }
  }, [activeIndex, activeVideoIndex])

  // También eliminar o comentar el useEffect relacionado con el video de transición
  // Buscar este useEffect:
  // Manejar la reproducción del video de transición
  // Eliminar o comentar el useEffect que maneja la reproducción del video de transición
  // useEffect(() => {
  //   if (showTransition && transitionVideoRef.current) {
  //     // Pequeño retraso para asegurar que el video esté completamente cargado en el DOM
  //     const playTimer = setTimeout(() => {
  //       if (transitionVideoRef.current) {
  //         // Reiniciar el video al principio
  //         transitionVideoRef.current.currentTime = 0

  //         // Reproducir el video con manejo de errores mejorado
  //         const playPromise = transitionVideoRef.current.play()

  //         if (playPromise !== undefined) {
  //           playPromise.catch((error) => {
  //             console.error("Error al reproducir el video de transición:", error)
  //             // No mostrar el error en producción, solo registrarlo
  //           })
  //         }
  //       }
  //     }, 50) // Pequeño retraso para asegurar que el DOM se ha actualizado

  //     return () => {
  //       clearTimeout(playTimer)
  //     }
  //   }
  // }, [showTransition])

  // Eliminar el efecto que hacía scroll a la habilidad seleccionada
  // useEffect(() => {
  //   if (activeSkill && skillsContainerRef.current) {
  //     const container = skillsContainerRef.current;
  //     const activeElement = container.querySelector(`[data-skill-id="${activeSkill}"]`);
  //     ...
  //   }
  // }, [activeSkill]);

  // Ahora, modifiquemos la función changeClass para ajustar los tiempos de la nueva animación
  // Buscar la función changeClass y reemplazarla con:
  // Manejar la reproducción del video de transición

  // Función para manejar el final del video de transición
  // const handleTransitionVideoEnd = () => {
  //   // No ocultar automáticamente la transición, lo haremos manualmente en changeClass
  // }

  // Simplificar la función changeClass para usar una transición más simple
  const changeClass = (index: number) => {
    if (index === activeIndex || isAnimating) return

    setPreviousIndex(activeIndex)
    setIsAnimating(true)

    // Ocultar el contenido actual con una animación simple de fade out
    setShowContent(false)
    setShowSelector(false)

    // Eliminar el uso del video de transición
    // setShowTransition(true)

    // Cambiar el índice después de un breve retraso
    setTimeout(() => {
      setActiveIndex(index)

      // Mostrar el nuevo contenido con una animación simple de fade in
      setTimeout(() => {
        setShowSelector(true)
        setShowContent(true)

        // Finalizar la animación
        setTimeout(() => {
          setIsAnimating(false)
        }, 100)
      }, 300)
    }, 300)

    // Pausar el video actual si está reproduciéndose
    if (isPlaying) {
      if (videoRef.current) {
        videoRef.current.pause()
      }
      if (vimeoPlayer) {
        vimeoPlayer.pause()
      }
      setIsPlaying(false)
    }
  }

  const moveUp = () => {
    const newIndex = (activeIndex - 1 + characters.length) % characters.length
    changeClass(newIndex)
  }

  const moveDown = () => {
    const newIndex = (activeIndex + 1) % characters.length
    changeClass(newIndex)
  }

  const togglePlay = () => {
    const activeCharacter = characters[activeIndex]
    const activeVideo = activeCharacter.videos[activeVideoIndex]

    if (activeVideo.vimeoId && vimeoPlayer) {
      if (isPlaying) {
        vimeoPlayer.pause()
      } else {
        vimeoPlayer.play()
      }
    } else if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleVideoEnd = () => {
    // Al finalizar, reiniciar y reproducir de nuevo
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play().catch((error) => {
        console.error("Error al reproducir de nuevo el video local:", error)
      })
    }
  }

  const changeVideo = (index: number) => {
    if (index === activeVideoIndex) return

    // Pausar el video actual si está reproduciéndose
    if (isPlaying) {
      if (videoRef.current) {
        videoRef.current.pause()
      }
      if (vimeoPlayer) {
        vimeoPlayer.pause()
      }
    }

    setActiveVideoIndex(index)
    setIsPlaying(true) // Asegurar que el nuevo video se reproduzca automáticamente
    setActiveSkill(null) // Resetear la habilidad activa al cambiar de video
  }

  const handleVideoClick = () => {
    togglePlay()

    // Mostrar overlay brevemente
    setShowOverlay(true)
    setTimeout(() => {
      setShowOverlay(false)
    }, 1500) // Ocultar después de 1.5 segundos
  }

  // Función para manejar el clic en una habilidad
  const toggleSkill = (skillId: string) => {
    if (activeSkill === skillId) {
      setActiveSkill(null) // Colapsar si ya está activa
    } else {
      setActiveSkill(skillId) // Expandir la nueva habilidad
    }
  }

  const activeCharacter = characters[activeIndex] as Character
  const previousCharacter = characters[previousIndex] as Character
  const hasMultipleVideos = activeCharacter.videos && activeCharacter.videos.length > 1
  const activeVideo =
    activeCharacter.videos && activeCharacter.videos[activeVideoIndex] ? activeCharacter.videos[activeVideoIndex] : null

  // Obtener los iconos de habilidades según el personaje y el video activo
  const getSkillIcons = () => {
    if (
      (activeCharacter.id === "fairyElf" || activeCharacter.id === "magicGladiator") &&
      activeCharacter.videos &&
      activeCharacter.videos[activeVideoIndex]?.skillIcons
    ) {
      return activeCharacter.videos[activeVideoIndex].skillIcons
    } else if (
      (activeCharacter.id === "summoner" ||
        activeCharacter.id === "darkKnight" ||
        activeCharacter.id === "darkWizard" ||
        activeCharacter.id === "darkLord" ||
        activeCharacter.id === "rageFighter") &&
      activeCharacter.skillIcons
    ) {
      return activeCharacter.skillIcons
    }
    return []
  }

  // Renderizar un estado de carga mientras se obtienen las traducciones
  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="animate-pulse h-40 w-40 rounded-full bg-bunker-800/50"></div>
      </div>
    )
  }

  return (
    <div className="w-full h-full relative">
      {/* Contenedor principal para la animación */}
      <div className="relative w-full min-h-screen overflow-hidden">
        {/* Fondo plano */}
        <div className="absolute inset-0 bg-bunker-950 z-5"></div>

        {/* Animación de transición con video */}
        {/* Eliminar el componente AnimatePresence para el video de transición */}
        {/* <AnimatePresence>
          {showTransition && (
            <motion.div
              className="absolute inset-0 z-50 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.3 } }}
            >
              <video
                ref={transitionVideoRef}
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/0427-ndw1zXTckTD0dyQto10oELu8Fkr3ua.mp4"
                className="absolute inset-0 w-full h-full object-cover"
                muted
                playsInline
                onEnded={handleTransitionVideoEnd}
              />
            </motion.div>
          )}
        </AnimatePresence> */}

        {/* Imagen del personaje como fondo */}
        <AnimatePresence mode="wait">
          {showContent && (
            <motion.div
              key={`bg-${activeCharacter.id}`}
              className="absolute left-0 bottom-0 h-full w-1/2 z-5"
              variants={characterImageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="relative w-[85%] h-[85%]">
                  <Image
                    src={activeCharacter.characterImg || "/placeholder.svg"}
                    alt={activeCharacter.name}
                    fill
                    className="object-contain object-bottom"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contenido principal con animaciones secuenciales */}
        <div className="relative z-20 w-full h-screen flex items-center justify-center">
          <div className="flex w-full max-w-6xl px-4">
            {/* Selector de clases con iconos */}
            <AnimatePresence>
              {showSelector && (
                <motion.div
                  className="flex-shrink-0 mr-8 self-center relative z-30"
                  variants={selectorVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div className="flex flex-col items-center space-y-4">
                    <button
                      onClick={moveUp}
                      className="w-10 h-10 rounded-full bg-bunker-800/80 flex items-center justify-center text-gold-400 hover:bg-bunker-700 hover:text-gold-300 transition-colors"
                      aria-label="Personaje anterior"
                      disabled={isAnimating}
                    >
                      <ChevronUp size={20} />
                    </button>

                    <div className="flex flex-col space-y-4">
                      {characters.map((char, i) => (
                        <div
                          key={i}
                          className={`relative cursor-pointer transition-all duration-300 ${isAnimating ? "pointer-events-none" : ""}`}
                          onClick={() => changeClass(i)}
                        >
                          {/* Contenedor exterior para el borde y la sombra */}
                          <div
                            className={`w-14 h-14 rounded-full overflow-hidden border-2 transition-all duration-300 ${
                              i === activeIndex
                                ? "border-gold-500 shadow-lg shadow-gold-500/30"
                                : "border-transparent hover:border-gold-500/50"
                            }`}
                          >
                            {/* Contenedor intermedio para centrar la imagen */}
                            <div className="w-full h-full flex items-center justify-center">
                              {/* Imagen con escala independiente */}
                              <Image
                                src={char.img || "/placeholder.svg"}
                                alt={char.name}
                                width={56}
                                height={56}
                                className={`object-contain transition-transform duration-300 ${i === activeIndex ? "scale-125" : ""}`}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={moveDown}
                      className="w-10 h-10 rounded-full bg-bunker-800/80 flex items-center justify-center text-gold-400 hover:bg-bunker-700 hover:text-gold-300 transition-colors"
                      aria-label="Siguiente personaje"
                      disabled={isAnimating}
                    >
                      <ChevronDown size={20} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Contenido de la clase */}
            <AnimatePresence mode="wait">
              {showContent && (
                <div key={activeCharacter.id} className="flex-grow">
                  {/* Imagen del encabezado con animación */}
                  <motion.div
                    className="absolute left-0 top-0 w-1/2 h-32 md:h-40 mb-8 z-10 flex items-center justify-center"
                    variants={headerVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <div className="relative w-full max-w-xl h-full">
                      <Image
                        src={activeCharacter.headerImg || "/placeholder.svg"}
                        alt={activeCharacter.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </motion.div>

                  {/* Contenido principal */}
                  <div className="flex flex-col md:flex-row items-start justify-between gap-8">
                    {/* Espacio vacío donde estaba la imagen para mantener el layout */}
                    <div className="md:w-1/3">{/* Empty space to maintain layout */}</div>

                    {/* Descripción y video a la derecha */}
                    <div className="md:w-2/3">
                      {/* Encabezado de Abilities Rework */}
                      <motion.h2
                        className="text-center text-xl md:text-2xl font-bold text-gold-500 mb-3 border-b border-gold-500/30 pb-2"
                        variants={descriptionVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                      >
                        {dictionary.classes?.abilitiesRework || "Abilities Rework"}
                      </motion.h2>
                      {/* Video con animación */}
                      <motion.div
                        className="relative w-full aspect-video bg-bunker-800/70 backdrop-blur-sm rounded-lg overflow-hidden cursor-pointer mb-4"
                        variants={videoVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        onClick={handleVideoClick}
                      >
                        {activeVideo && activeVideo.vimeoId ? (
                          // Video de Vimeo
                          <div className="relative w-full h-full">
                            <iframe
                              ref={vimeoIframeRef}
                              src={`https://player.vimeo.com/video/${activeVideo.vimeoId}?title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479&background=1&loop=1`}
                              className="absolute top-0 left-0 w-full h-full"
                              frameBorder="0"
                              allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                              title={`${activeCharacter.name} - ${activeVideo.title}`}
                            ></iframe>
                          </div>
                        ) : activeVideo && activeVideo.url.startsWith("https://") ? (
                          // Video local
                          <video
                            ref={videoRef}
                            src={activeVideo.url}
                            className="w-full h-full object-cover"
                            onEnded={handleVideoEnd}
                            playsInline
                            autoPlay
                            muted
                            loop={false}
                          />
                        ) : (
                          // Placeholder de imagen
                          <Image
                            src={activeVideo?.url || "/placeholder.svg"}
                            alt={`${activeCharacter.name} video`}
                            fill
                            className="object-cover"
                          />
                        )}

                        {/* Overlay con botón de play/pause que aparece brevemente al hacer clic */}
                        {showOverlay && (
                          <div
                            className="absolute inset-0 flex items-center justify-center transition-opacity duration-300"
                            style={{ backgroundColor: "rgba(17, 20, 26, 0.4)" }}
                          >
                            <div
                              className="w-16 h-16 rounded-full bg-gold-500/80 flex items-center justify-center text-bunker-950"
                              aria-label={isPlaying ? "Video pausado" : "Video reproduciendo"}
                            >
                              {isPlaying ? <Pause size={32} /> : <Play size={32} />}
                            </div>
                          </div>
                        )}
                      </motion.div>

                      {/* Botones de categoría para Fairy Elf y Magic Gladiator */}
                      {(activeCharacter.id === "fairyElf" || activeCharacter.id === "magicGladiator") &&
                        hasMultipleVideos && (
                          <div className="flex justify-center mb-4 space-x-4">
                            {activeCharacter.videos.map((video, idx) => (
                              <button
                                key={idx}
                                onClick={() => changeVideo(idx)}
                                className={`category-button ${idx === activeVideoIndex ? "category-button-active" : ""}`}
                                style={{
                                  background: idx === activeVideoIndex ? "#ffd700" : "#fff",
                                  border: "none",
                                  padding: "10px 20px",
                                  display: "inline-block",
                                  fontSize: "15px",
                                  fontWeight: "600",
                                  width: "184px",
                                  textTransform: "uppercase",
                                  cursor: "pointer",
                                  transform: "skew(-21deg)",
                                  position: "relative",
                                  overflow: "hidden",
                                  zIndex: "1",
                                  color: idx === activeVideoIndex ? "#fff" : "#000",
                                  transition: "all 0.5s",
                                  boxShadow: idx === activeVideoIndex ? "0 2px 10px rgba(255, 215, 0, 0.3)" : "none",
                                }}
                              >
                                <span style={{ display: "inline-block", transform: "skew(21deg)" }}>{video.title}</span>
                              </button>
                            ))}
                          </div>
                        )}

                      {/* Skill icons section - Rediseñado para mostrar habilidades en horizontal */}
                      <motion.div
                        className="p-4"
                        variants={descriptionVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                      >
                        <h3 className="text-gold-400 font-bold mb-3 flex items-center justify-center">Habilidades</h3>

                        {/* Contenedor de iconos de habilidades centrados */}
                        <div className="flex justify-center items-center mb-6">
                          <div className="flex flex-wrap justify-center gap-3 max-w-3xl">
                            {getSkillIcons().map((icon, index) => (
                              <div
                                key={index}
                                className={`flex flex-col items-center cursor-pointer transition-all duration-300 ${
                                  activeSkill === icon.id
                                    ? "bg-gold-500/10 rounded-lg"
                                    : "hover:bg-bunker-700/50 hover:rounded-lg"
                                }`}
                                onClick={() => toggleSkill(icon.id)}
                              >
                                <div className="w-[84px] h-[84px] relative flex-shrink-0 p-2">
                                  <Image
                                    src={icon.img || "/placeholder.svg"}
                                    alt={icon.id}
                                    width={84}
                                    height={84}
                                    className="object-contain"
                                  />
                                </div>
                                <p className="text-gold-300 text-sm font-medium text-center px-1">
                                  {icon.id.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Descripción de la habilidad seleccionada */}
                        <AnimatePresence mode="sync">
                          {activeSkill && (
                            <motion.div
                              key={`skill-desc-${activeSkill}`}
                              variants={skillExpandVariants}
                              initial="collapsed"
                              animate="expanded"
                              exit="exit"
                              className="bg-bunker-900/70 p-3 rounded-lg border border-gold-600/20 mt-2 overflow-hidden"
                            >
                              <div className="skill-description-content">
                                <h4 className="text-gold-400 font-medium mb-1">
                                  {activeSkill.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                                </h4>
                                <p className="text-gold-100">
                                  {skillDescriptions[activeSkill as keyof typeof skillDescriptions] ||
                                    "No hay descripción disponible para esta habilidad."}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Mensaje cuando no hay habilidades */}
                        {getSkillIcons().length === 0 && (
                          <p className="text-gold-100/70 italic">No hay información de habilidades disponible.</p>
                        )}
                      </motion.div>
                    </div>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* Estilos para navegadores webkit (Chrome, Safari, etc.) */
        ::-webkit-scrollbar {
          height: 6px;
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(54, 66, 86, 0.3);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 215, 0, 0.5);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 215, 0, 0.7);
        }
        
        /* Estilos para la animación de la descripción de habilidades */
        .skill-description-content {
          transform-origin: top;
          will-change: transform, opacity;
        }
        
        /* Estilos para los botones de categoría */
        .category-button::before {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          right: 100%;
          left: 0;
          background: linear-gradient(to right, #ffd700, #d19e00);
          opacity: 0;
          z-index: -1;
          transition: all 0.5s;
        }
        
        .category-button:hover {
          color: #fff !important;
          box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4) !important;
        }
        
        .category-button:hover::before {
          left: 0;
          right: 0;
          opacity: 1;
        }
        
        .category-button-active {
          color: #fff !important;
          background: #ffd700 !important;
        }
        
        .category-button:not(.category-button-active):hover {
          border-color: #ffd700 !important;
        }
      `}</style>
    </div>
  )
}
