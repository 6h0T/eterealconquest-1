"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, Globe, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Locale } from "@/i18n/config"
import { i18n } from "@/i18n/config"
import { getDictionary } from "@/i18n/config"
import { setCookie } from "cookies-next"
import OnlineBadgeSimple from "@/components/online-badge-simple"
import { MobileNavbar } from "@/components/mobile-navbar"

interface NavbarProps {
  lang: Locale
}

export function Navbar({ lang }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [dictionary, setDictionary] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Verificar si el usuario está autenticado
  useEffect(() => {
    const checkAuth = () => {
      const auth = localStorage.getItem("isAuthenticated") === "true"
      setIsAuthenticated(auth)
    }

    // Verificar al montar el componente
    checkAuth()

    // Verificar cuando cambia la ruta
    const handleRouteChange = () => {
      checkAuth()
    }

    window.addEventListener("storage", handleRouteChange)

    return () => {
      window.removeEventListener("storage", handleRouteChange)
    }
  }, [])

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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Modificar la función changeLanguage para establecer español como predeterminado
  const changeLanguage = (newLang: string) => {
    // Guardar la preferencia de idioma en una cookie
    setCookie("NEXT_LOCALE", newLang, { maxAge: 60 * 60 * 24 * 30 }) // 30 días

    // Construir la nueva ruta con el nuevo idioma
    let newPath = pathname

    // Reemplazar el idioma actual en la ruta
    for (const locale of i18n.locales) {
      if (pathname.startsWith(`/${locale}/`)) {
        newPath = pathname.replace(`/${locale}/`, `/${newLang}/`)
        break
      } else if (pathname === `/${locale}`) {
        newPath = `/${newLang}`
        break
      }
    }

    // Usar una redirección más directa para asegurar que la página se recargue completamente
    window.location.href = newPath
  }

  // Si estamos cargando, mostrar un esqueleto
  if (isLoading) {
    return (
      <>
        {/* Navbar móvil */}
        <div className="block lg:hidden">
          <MobileNavbar lang={lang} />
        </div>
        
        {/* Navbar escritorio */}
        <nav className={`hidden lg:block navbar ${scrolled ? "scrolled" : ""}`}>
          <div className="navbar-container">
            <div className="navbar-left">
              <div className="w-36 h-10 bg-bunker-800 animate-pulse rounded"></div>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="flex space-x-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-24 h-8 bg-bunker-800 animate-pulse rounded"></div>
                ))}
              </div>
            </div>
            <div className="navbar-right">
              <div className="w-24 h-10 bg-bunker-800 animate-pulse rounded"></div>
            </div>
          </div>
        </nav>
      </>
    )
  }

  // Verificar que el diccionario y navbar existen antes de crear los elementos de navegación
  const navItems =
    dictionary && dictionary.navbar
      ? [
          { name: dictionary.navbar.home, href: `/${lang}`, isAnchor: false },
          { name: dictionary.navbar.features, href: `/${lang}#info-section`, isAnchor: true },
          { name: dictionary.navbar.news, href: `/${lang}#news-section`, isAnchor: true },
          { name: dictionary.navbar.rankings, href: `/${lang}/ranking`, isAnchor: false },
          { name: dictionary.navbar.classes, href: `/${lang}#classes-section`, isAnchor: true },
          { name: dictionary.navbar.download, href: `/${lang}#cta-section`, isAnchor: true, isCenteredSection: true },
        ]
      : []

  // Función mejorada para manejar la navegación
  const handleNavigation = (href: string, isAnchor: boolean, isCenteredSection = false) => {
    setIsOpen(false)

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

  const languages = [
    { code: "es", name: "Español" },
    { code: "en", name: "English" },
    { code: "pt", name: "Português" },
  ]

  return (
    <>
      {/* Navbar móvil */}
      <div className="block lg:hidden">
        <MobileNavbar lang={lang} />
      </div>
      
      {/* Navbar escritorio */}
      <nav className={`hidden lg:block navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="navbar-container">
          <div className="navbar-left">
            <Link href={`/${lang}`} className="navbar-logo">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ICONO-OFICIAL-13-3gGmj2RPNX7685QOkTM5PzyDPjnwdn.png"
                alt="ETEREALCONQUEST - S6EP3"
                width={75}
                height={75}
                className="h-16 w-auto object-contain"
              />
            </Link>

            <div className="flex items-center gap-6">
              <OnlineBadgeSimple />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="language-selector font-trade-winds">
                    <Globe className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">{lang.toUpperCase()}</span>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-bunker-800 border-gold-700/50">
                  {languages.map((language) => (
                    <DropdownMenuItem
                      key={language.code}
                      className={`w-full cursor-pointer ${
                        lang === language.code ? "text-gold-400" : "text-gold-100 hover:text-gold-300"
                      }`}
                      onClick={() => changeLanguage(language.code)}
                    >
                      {language.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="radio-inputs-desktop">
            {navItems.map((item) => (
              <label className="radio" key={item.href}>
                <input
                  type="radio"
                  name="navbar-radio"
                  checked={pathname === item.href.split("#")[0]}
                  onChange={() => {
                    // Este onChange es necesario para React pero no hace nada
                  }}
                />
                <a
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault()
                    handleNavigation(item.href, item.isAnchor, item.isCenteredSection)
                  }}
                >
                  <span className="name font-trade-winds">{item.name}</span>
                </a>
              </label>
            ))}
          </div>

          <div className="navbar-right">
            {dictionary && dictionary.navbar && (
              <>
                {isAuthenticated ? (
                  <Link href={`/${lang}/panel`}>
                    <Button className="button-secondary">
                      <User className="h-4 w-4 mr-2" />
                      Panel de Usuario
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href={`/${lang}/inicio-sesion`}>
                      <Button className="button-secondary">{dictionary.navbar.signin}</Button>
                    </Link>
                    <Link href={`/${lang}/registro`}>
                      <button className="button">{dictionary.navbar.register}</button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  )
}
