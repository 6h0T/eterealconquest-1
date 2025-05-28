"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Facebook, Instagram } from "lucide-react"
import { FaDiscord } from "react-icons/fa"
import type { Locale } from "@/i18n/config"
import { getDictionary } from "@/i18n/config"

interface FooterProps {
  lang: Locale
}

export function Footer({ lang }: FooterProps) {
  const year = new Date().getFullYear()
  const [dictionary, setDictionary] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Cargar el diccionario directamente en el componente
  useEffect(() => {
    const loadDictionary = async () => {
      setIsLoading(true)
      try {
        const dict = await getDictionary(lang)
        setDictionary(dict)
      } catch (error) {
        console.error("Error loading dictionary:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDictionary()
  }, [lang])

  // Función para manejar la navegación igual que en el navbar
  const handleNavigation = (href: string, isAnchor: boolean, isCenteredSection = false) => {
    // Si es un enlace con ancla
    if (isAnchor) {
      const isHomePage = pathname === `/${lang}` || pathname === `/${lang}/`

      // Si estamos en la página principal y queremos ir a una sección de la misma página
      if (isHomePage) {
        const sectionId = href.split("#")[1]
        const section = document.getElementById(sectionId)

        if (section) {
          // Si es la sección de descargas, usar un desplazamiento personalizado para centrarla
          if (isCenteredSection) {
            // Obtener la altura del viewport
            const viewportHeight = window.innerHeight
            // Obtener la posición y altura de la sección
            const rect = section.getBoundingClientRect()
            const sectionHeight = rect.height
            // Calcular la posición de desplazamiento para centrar la sección
            const scrollPosition = window.scrollY + rect.top - viewportHeight / 2 + sectionHeight / 2

            // Desplazarse a la posición calculada
            window.scrollTo({
              top: scrollPosition - 100, // Ajuste adicional para mejorar la posición
              behavior: "smooth",
            })
          } else {
            // Para otras secciones, usar el comportamiento normal
            section.scrollIntoView({ behavior: "smooth" })
          }
        }
        return
      }

      // Si estamos en otra página y queremos ir a una sección de la página principal
      router.push(href)
      return
    }

    // Si es un enlace normal (sin ancla)
    router.push(href)
  }

  // Enlaces rápidos con la misma configuración que el navbar
  const quickLinks = dictionary && dictionary.navbar ? [
    { name: dictionary.navbar.home, href: `/${lang}`, isAnchor: false },
    { name: dictionary.navbar.features, href: `/${lang}#info-section`, isAnchor: true },
    { name: dictionary.navbar.news, href: `/${lang}#news-section`, isAnchor: true },
    { name: dictionary.navbar.download, href: `/${lang}#cta-section`, isAnchor: true, isCenteredSection: true },
    { name: dictionary.navbar.ranking, href: `/${lang}/ranking`, isAnchor: false },
  ] : []

  // Renderizar un footer simplificado mientras se cargan las traducciones
  if (isLoading) {
    return (
      <footer className="bg-bunker-900 pt-12 pb-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse h-40 bg-bunker-800/50 rounded-lg"></div>
        </div>
      </footer>
    )
  }

  return (
    <footer className="bg-bunker-900 pt-12 pb-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Layout para desktop - mantener original */}
        <div className="hidden md:flex flex-col md:flex-row justify-center gap-16 max-w-3xl mx-auto">
          <div className="flex-1">
            <h3 className="text-gold-400 font-bold text-lg mb-4 text-center md:text-left">
              {dictionary.footer?.quickLinks}
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault()
                      handleNavigation(link.href, link.isAnchor, link.isCenteredSection)
                    }}
                    className="text-gold-100 hover:text-gold-300 transition-colors cursor-pointer"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex-1">
            <h3 className="text-gold-400 font-bold text-lg mb-4 text-center md:text-left">
              {dictionary.footer?.social}
            </h3>
            <div className="flex flex-col space-y-4">
              <a
                href="https://discord.gg/2pF7h7uvRU"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gold-100 hover:text-gold-400 transition-colors"
              >
                <FaDiscord className="h-6 w-6 mr-2" />
                <span>Discord</span>
              </a>
              <a
                href="https://www.facebook.com/eterealconquest"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gold-100 hover:text-gold-400 transition-colors"
              >
                <Facebook className="h-6 w-6 mr-2" />
                <span>Facebook</span>
              </a>
              <a
                href="https://www.instagram.com/eterealconquest.mu/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gold-100 hover:text-gold-400 transition-colors"
              >
                <Instagram className="h-6 w-6 mr-2" />
                <span>Instagram</span>
              </a>
            </div>
          </div>
        </div>

        {/* Layout para móvil - una sola línea */}
        <div className="block md:hidden">
          {/* Contenido en una línea con títulos alineados */}
          <div className="flex justify-between items-start gap-4">
            {/* Enlaces rápidos */}
            <div className="flex-1 ml-20">
              <h3 className="text-gold-400 font-bold text-base mb-4">
                {dictionary.footer?.quickLinks}
              </h3>
              <ul className="space-y-1">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault()
                        handleNavigation(link.href, link.isAnchor, link.isCenteredSection)
                      }}
                      className="text-gold-100 hover:text-gold-300 transition-colors text-sm cursor-pointer"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Redes sociales */}
            <div className="flex-1">
              <h3 className="text-gold-400 font-bold text-base mb-4">
                {dictionary.footer?.social}
              </h3>
              <div className="flex flex-col space-y-2">
                <a
                  href="https://discord.gg/2pF7h7uvRU"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gold-100 hover:text-gold-400 transition-colors text-sm"
                >
                  <FaDiscord className="h-4 w-4 mr-2" />
                  <span>Discord</span>
                </a>
                <a
                  href="https://www.facebook.com/eterealconquest"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gold-100 hover:text-gold-400 transition-colors text-sm"
                >
                  <Facebook className="h-4 w-4 mr-2" />
                  <span>Facebook</span>
                </a>
                <a
                  href="https://www.instagram.com/eterealconquest.mu/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gold-100 hover:text-gold-400 transition-colors text-sm"
                >
                  <Instagram className="h-4 w-4 mr-2" />
                  <span>Instagram</span>
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Copyright - igual para ambas versiones */}
        <div className="text-center mt-8 pt-8 border-t border-gold-700/30">
          <p className="text-gold-200 text-sm">
            &copy; {year} ETEREALCONQUEST. {dictionary.footer?.allRightsReserved}.
          </p>
          <p className="text-gold-200 text-sm mt-2">
            {dictionary.footer?.developedBy}{" "}
            <a
              href="https://www.gh0tstudio.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-400 hover:text-gold-300 transition-colors"
            >
              www.gh0tstudio.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
