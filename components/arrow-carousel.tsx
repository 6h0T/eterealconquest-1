"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { getValidImageUrl } from "@/lib/placeholder-utils"

interface CarouselItem {
  image: string
  text: string
  videoSrc?: string
  vimeoEmbed?: string // Nuevo campo para embeds de Vimeo
  description?: string // Nuevo campo para la descripción
}

interface ArrowCarouselProps {
  items: CarouselItem[]
}

export default function ArrowCarousel({ items }: ArrowCarouselProps) {
  // Start from the middle item
  const initialIndex = Math.floor(items.length / 2)
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isAnimating, setIsAnimating] = useState(false)
  const [direction, setDirection] = useState(0) // -1 for left, 1 for right
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<CarouselItem | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Track all card positions in a single state to ensure coordinated movement
  const [cardPositions, setCardPositions] = useState<number[]>([])

  // Initialize card positions
  useEffect(() => {
    const positions = items.map((_, i) => {
      const diff = (i - currentIndex + items.length) % items.length
      return diff > items.length / 2 ? diff - items.length : diff
    })
    setCardPositions(positions)
  }, [items.length, currentIndex])

  // Reset video when modal closes
  useEffect(() => {
    if (!modalOpen && videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
    
    // Reproducir automáticamente el video cuando se abre el modal
    if (modalOpen && videoRef.current) {
      const playPromise = videoRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Error al reproducir el video:', error);
        });
      }
    }
  }, [modalOpen])

  // Function to handle next slide
  const nextSlide = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setDirection(1) // Moving right

    // Update all card positions in a coordinated way
    setCardPositions((prev) => {
      return prev.map((pos) => {
        const newPos = pos - 1
        return newPos < -Math.floor(items.length / 2) ? newPos + items.length : newPos
      })
    })

    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length)

    setTimeout(() => {
      setIsAnimating(false)
    }, 800)
  }

  // Function to handle previous slide
  const prevSlide = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setDirection(-1) // Moving left

    // Update all card positions in a coordinated way
    setCardPositions((prev) => {
      return prev.map((pos) => {
        const newPos = pos + 1
        return newPos > Math.floor(items.length / 2) ? newPos - items.length : newPos
      })
    })

    setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length)

    setTimeout(() => {
      setIsAnimating(false)
    }, 800)
  }

  // Function to handle card click
  const handleCardClick = (item: CarouselItem, position: number) => {
    // If it's the center card (position 0), open the modal
    if (position === 0) {
      setSelectedItem(item)
      setModalOpen(true)
    } else if (position < 0) {
      prevSlide()
    } else if (position > 0) {
      nextSlide()
    }
  }

  // Get card styles based on position for a carousel-like effect
  const getCardStyles = (position: number) => {
    // Base values
    const scale = 1.0 // All cards have the same scale now

    // Improved opacity for side cards
    const activeOpacity = 1
    const sideCardOpacity = 0.8
    const absPosition = Math.abs(position)

    // Now the opacity only slightly decreases with distance (minimum 80%)
    const opacity = position === 0 ? activeOpacity : Math.max(sideCardOpacity, 0.95 - absPosition * 0.05)

    // Calculate carousel-like positioning
    // The radius of our imaginary carousel circle - increased for more spacing
    const radius = 600 // Adjusted for increased spacing

    // Calculate the angle based on position
    // Position 0 is at 0 degrees (front center)
    const angle = position * 23.1 * (Math.PI / 180)

    // Calculate x position using sin for horizontal placement
    const x = Math.sin(angle) * radius

    // Calculate z position using cos for depth
    // Subtract from radius to make items in front have higher z values
    const z = Math.cos(angle) * radius - radius

    // Calculate rotation - items should face toward the center
    const rotateY = -position * 23.1 // degrees

    // Z-index ensures the active card is on top
    const zIndex = 10 - absPosition

    // Enhanced shadow for all cards
    const boxShadow =
      position === 0
        ? "0 20px 40px rgba(0, 0, 0, 0.7), 0 0 30px rgba(255, 215, 0, 0.4)"
        : "0 10px 30px rgba(0, 0, 0, 0.5)"

    // Brightness adjustment: center card is normal, side cards slightly dimmed but not too much
    const filter = position === 0 ? "brightness(1.05)" : "brightness(0.9)"

    return {
      scale,
      opacity,
      x,
      z,
      rotateY,
      zIndex,
      boxShadow,
      filter,
    }
  }

  // Calculate the actual dimensions - 50% smaller than before
  const cardWidth = 600
  const cardHeight = 338 // Rounded up from 337.5

  // Refined animation transition settings
  const cardTransition = {
    type: "tween",
    ease: [0.25, 0.1, 0.25, 1],
    duration: 0.7,
  }

  // Direct blob URLs for the navigation dots
  const activeNavDotUrl =
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Active-7Nrq6ah7G3LdNZZ19QOAHX5ZqcWOmO.png"
  const inactiveNavDotUrl =
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/inactive-Zab1eM22EGiiW1vkGnC3E6BfFUHkYh.png"

  // Direct blob URLs for the arrow images
  const prevArrowUrl = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Pre-16okqcLtKF2FuyyXFsQg2Nq4lF4v4a.png"
  const nextArrowUrl = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Next-F2rCYhiHlCTuPbM8hp1wc6yfcY9qx8.png"
  const playButtonUrl =
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Play-dDnAmPkSWvTlmNu7u73YEvnfoQDgcl.png"

  // Default video sources for each feature if not provided
  const getDefaultVideoSrc = (text: string): string => {
    const lowerText = text.toLowerCase()
    if (lowerText.includes("interface") || lowerText.includes("interfaz")) {
      return "/videos/blade-knight-skills.mp4"
    } else if (lowerText.includes("skills") || lowerText.includes("habilidades")) {
      return "/videos/mg-fuerza-skills.mp4"
    } else if (lowerText.includes("buffs")) {
      return "/videos/rage-fighter-skills.mp4"
    } else {
      // Default video if no match
      return "/videos/transition.mp4"
    }
  }

  // Traducción del título según el idioma
  const getTranslatedTitle = (text: string): string => {
    // Detectar el idioma basado en la URL
    const lang = typeof window !== "undefined" ? window.location.pathname.split("/")[1] : "es"

    if (text.toLowerCase().includes("interface") || text.toLowerCase().includes("interfaz")) {
      if (lang === "en") {
        return "GRAPHIC ENGINE UPDATE, FLUIDITY LIKE YOU'VE NEVER SEEN BEFORE!"
      } else if (lang === "pt") {
        return "ATUALIZAÇÃO DO MOTOR GRÁFICO, FLUIDEZ COMO VOCÊ NUNCA VIU ANTES!"
      } else {
        return "ACTUALIZACIÓN DE MOTOR GRAFICO, FLUIDEZ COMO NUNCA ANTES HAS VISTO!"
      }
    }

    return text
  }

  // Función para obtener el contenido del modal según el item seleccionado
  const getModalContent = (item: CarouselItem | null) => {
    if (!item) return { title: "Característica", description: "", video: null }

    // Si es el Sistema Exclusivo de Rareza (en cualquier idioma)
    if (item.text.includes("RAREZA") || item.text.includes("RARITY") || item.text.includes("RARIDADE")) {
      return {
        title: item.text,
        description: item.description || "",
        video: item.vimeoEmbed || null
      }
    }

    // Contenido por defecto para interfaz gráfica
    if (item.text.toLowerCase().includes("interface") || 
        item.text.toLowerCase().includes("interfaz") ||
        item.text.toLowerCase().includes("motor") ||
        item.text.toLowerCase().includes("gráfico") ||
        item.text.toLowerCase().includes("graphic") ||
        item.text.toLowerCase().includes("engine") ||
        item.text.toLowerCase().includes("atualização")) {
      return {
        title: getTranslatedTitle(item.text),
        description: item.description || "Se acabo Mu Online con graficos antiguos. Aquí no hay aceleración gráfica ni trucos visuales engañosos, tampoco necesitaras una PC de última generación para notar una experiencia grafica TOTALMENTE DIFERENTE! ¡Hemos optimizado el motor del juego para ofrecer una experiencia moderna y unica! Prueba Etereal Conquest y redescubre Mu Online",
        video: item.vimeoEmbed || null
      }
    }

    // Contenido para el resto de características
    return {
      title: item.text,
      description: item.description || "",
      video: item.videoSrc || item.vimeoEmbed || null
    }
  }

  return (
    <div className="relative w-full pt-8 pb-16">
      {/* Carousel container with perspective for 3D effect */}
      <div className="relative h-[500px] overflow-hidden" style={{ perspective: "1500px" }}>
        {/* Cards container - this is the carousel "wheel" */}
        <div
          className="absolute top-0 left-1/2 transform -translate-x-1/2 flex items-center justify-center h-full"
          style={{
            transformStyle: "preserve-3d",
            perspective: "1500px",
          }}
        >
          {/* Render all cards with their positions */}
          {items.map((item, idx) => {
            // Only render cards that are visible (-3 to +3 positions)
            const position = cardPositions[idx] || 0
            if (Math.abs(position) > 3) return null

            const styles = getCardStyles(position)

            // Usar nuestra utilidad para obtener una URL válida
            const imageUrl = item.image.startsWith('/') && !item.image.startsWith('//') 
              ? item.image // Si es una ruta absoluta pero no un protocolo, mantenerla como está
              : getValidImageUrl(item.image, cardWidth, cardHeight, item.text)

            return (
              <motion.div
                key={`card-${idx}`}
                className="absolute overflow-hidden cursor-pointer"
                style={{
                  transformStyle: "preserve-3d",
                  width: `${cardWidth}px`,
                  height: `${cardHeight}px`,
                }}
                animate={styles}
                transition={cardTransition}
                onClick={() => handleCardClick(item, position)}
              >
                {/* Fancy border overlay */}
                <div
                  className="absolute inset-0 pointer-events-none z-30"
                  style={{
                    boxShadow: `inset 0 0 0 ${position === 0 ? 2 : 1}px rgba(255, 215, 0, ${
                      position === 0 ? 0.6 : 0.3
                    })`,
                  }}
                />

                {/* Subtle gradient overlay for additional depth */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"
                  style={{
                    opacity: position === 0 ? 0.7 : 0.6,
                  }}
                />

                <Image
                  src={imageUrl || "/placeholder.svg"}
                  alt={item.text}
                  width={cardWidth}
                  height={cardHeight}
                  className="w-full h-full object-cover"
                  style={{
                    filter: position === 0 ? "brightness(1.05)" : "brightness(0.9)",
                  }}
                  unoptimized={imageUrl.startsWith("https://") || imageUrl.startsWith("http://")}
                />

                <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-20">
                  <p className="font-trade-winds text-xl text-center gold-gradient-text font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {item.text}
                  </p>
                </div>

                {/* Play button indicator for center card */}
                {position === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="w-16 h-16 flex items-center justify-center transform transition-transform hover:scale-110">
                      <img src={playButtonUrl || "/placeholder.svg"} alt="Play" className="w-full h-full" />
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Navigation arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-8 top-1/2 transform -translate-y-1/2 z-20 transition-all duration-300 hover:scale-110"
          aria-label="Previous slide"
          disabled={isAnimating}
        >
          <img
            src={prevArrowUrl || "/placeholder.svg"}
            alt="Previous"
            width={50}
            height={50}
            className="w-12 h-12 md:w-16 md:h-16"
          />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-8 top-1/2 transform -translate-y-1/2 z-20 transition-all duration-300 hover:scale-110"
          aria-label="Next slide"
          disabled={isAnimating}
        >
          <img
            src={nextArrowUrl || "/placeholder.svg"}
            alt="Next"
            width={50}
            height={50}
            className="w-12 h-12 md:w-16 md:h-16"
          />
        </button>
      </div>

      {/* Navigation dots replaced with medallion images */}
      <div className="flex justify-center mt-8 gap-4">
        {items.map((_, i) => (
          <button
            key={`dot-${i}`}
            onClick={() => {
              if (!isAnimating) {
                setIsAnimating(true)
                setDirection(i > currentIndex ? 1 : -1)

                // Calculate the shortest path to the target index
                const diff = i - currentIndex
                const shortestDiff =
                  diff > items.length / 2 ? diff - items.length : diff < -items.length / 2 ? diff + items.length : diff

                // Update all card positions based on the difference
                setCardPositions((prev) => {
                  return prev.map((pos) => {
                    const newPos = pos - shortestDiff
                    if (newPos < -Math.floor(items.length / 2)) return newPos + items.length
                    if (newPos > Math.floor(items.length / 2)) return newPos - items.length
                    return newPos
                  })
                })

                setCurrentIndex(i)

                setTimeout(() => {
                  setIsAnimating(false)
                }, 800)
              }
            }}
            className={`relative transition-all duration-300 ${
              i === currentIndex ? "scale-110" : "scale-90 opacity-80"
            }`}
            style={{ width: "40px", height: "40px" }}
            aria-label={`Go to slide ${i + 1}`}
            disabled={isAnimating}
          >
            {/* Use the new medallion images */}
            <img
              src={i === currentIndex ? activeNavDotUrl : inactiveNavDotUrl}
              alt=""
              className="w-full h-full transition-all duration-300"
            />
          </button>
        ))}
      </div>

      {/* Video Modal with Two Columns - Dynamic content based on selected item */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent
          className="sm:max-w-[1200px] max-h-[95vh] bg-black/90 border-gold-600/30 text-gold-100 p-0 overflow-hidden"
          style={{ backdropFilter: "blur(8px)" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 h-full" style={{ minHeight: "600px" }}>
            {/* Left Column: Header and Content - Dynamic text */}
            <div className="flex flex-col justify-center p-6 md:p-8 h-full">
              <DialogTitle className="text-2xl md:text-3xl font-bold gold-gradient-text mb-6">
                {getModalContent(selectedItem).title}
              </DialogTitle>
              <div className="prose prose-invert prose-gold max-w-none">
                <div 
                  className="text-gold-100 leading-relaxed text-base md:text-lg"
                  dangerouslySetInnerHTML={{ __html: getModalContent(selectedItem).description }}
                />
              </div>
            </div>

            {/* Right Column: Video Only - Dynamic video content */}
            <div className="flex items-center justify-center h-full">
              <div className="w-full h-full flex items-center justify-center">
                {getModalContent(selectedItem).video && (
                  selectedItem?.text.includes("RAREZA") || selectedItem?.text.includes("RARITY") || selectedItem?.text.includes("RARIDADE") ? (
                    <div className="w-full h-full flex items-center justify-center p-6">
                      <div style={{width: "90%", maxWidth: "90%"}} dangerouslySetInnerHTML={{ __html: getModalContent(selectedItem).video as string }} />
                    </div>
                  ) : selectedItem?.vimeoEmbed ? (
                    <div className="aspect-video mb-6 w-full overflow-hidden rounded-lg">
                      <div dangerouslySetInnerHTML={{ __html: selectedItem.vimeoEmbed }} />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <video
                        ref={videoRef}
                        src={getModalContent(selectedItem).video as string}
                        autoPlay
                        playsInline
                        loop
                        controls
                        className="w-full h-full object-contain"
                        onError={(e) => console.error("Error al cargar el video:", e)}
                      />
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Vimeo Script */}
      <script src="https://player.vimeo.com/api/player.js" async></script>
    </div>
  )
}
