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

interface MobileNavbarProps {
  lang: Locale
}

export function MobileNavbar({ lang }: MobileNavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
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

    checkAuth()
    window.addEventListener("storage", checkAuth)
    return () => window.removeEventListener("storage", checkAuth)
  }, [])

  // Cargar el diccionario
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

  // Cambiar idioma
  const changeLanguage = (newLang: string) => {
    setCookie("NEXT_LOCALE", newLang, { maxAge: 60 * 60 * 24 * 30 })
    let newPath = pathname

    for (const locale of i18n.locales) {
      if (pathname.startsWith(`/${locale}/`)) {
        newPath = pathname.replace(`/${locale}/`, `/${newLang}/`)
        break
      } else if (pathname === `/${locale}`) {
        newPath = `/${newLang}`
        break
      }
    }

    window.location.href = newPath
  }

  // Elementos de navegación
  const navItems =
    dictionary && dictionary.navbar
      ? [
          { name: dictionary.navbar.home, href: `/${lang}`, isAnchor: false },
          { name: dictionary.navbar.features, href: `/${lang}#info-section`, isAnchor: true },
          { name: dictionary.navbar.news, href: `/${lang}#news-section`, isAnchor: true },
          { name: dictionary.navbar.rankings, href: `/${lang}/ranking`, isAnchor: false },
          { name: dictionary.navbar.classes, href: `/${lang}#classes-section`, isAnchor: true },
          { name: dictionary.navbar.download, href: `/${lang}#cta-section`, isAnchor: true },
        ]
      : []

  // Manejar navegación
  const handleNavigation = (href: string, isAnchor: boolean) => {
    setIsOpen(false)

    if (isAnchor) {
      const isHomePage = pathname === `/${lang}` || pathname === `/${lang}/`

      if (isHomePage) {
        const sectionId = href.split("#")[1]
        const section = document.getElementById(sectionId)
        if (section) {
          section.scrollIntoView({ behavior: "smooth" })
        }
        return
      }
    }

    router.push(href)
  }

  const languages = [
    { code: "es", name: "Español" },
    { code: "en", name: "English" },
    { code: "pt", name: "Português" },
  ]

  if (isLoading) {
    return (
      <nav className="mobile-navbar">
        <div className="mobile-navbar-container">
          <div className="w-8 h-8 bg-bunker-800 animate-pulse rounded"></div>
          <div className="w-16 h-8 bg-bunker-800 animate-pulse rounded"></div>
          <div className="w-8 h-8 bg-bunker-800 animate-pulse rounded"></div>
        </div>
      </nav>
    )
  }

  return (
    <>
      <nav className="mobile-navbar">
        <div className="mobile-navbar-container">
          {/* Lado izquierdo: Logo y contador */}
          <div className="mobile-navbar-left">
            <Link href={`/${lang}`} className="mobile-logo">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ICONO-OFICIAL-13-3gGmj2RPNX7685QOkTM5PzyDPjnwdn.png"
                alt="ETEREALCONQUEST"
                className="mobile-logo-img"
              />
            </Link>
            <OnlineBadgeSimple />
          </div>

          {/* Lado derecho: Controles */}
          <div className="mobile-navbar-right">
            {/* Selector de idioma */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="mobile-lang-btn">
                  <Globe size={18} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-bunker-800 border-gold-700/50">
                {languages.map((language) => (
                  <DropdownMenuItem
                    key={language.code}
                    className={`cursor-pointer ${
                      lang === language.code ? "text-gold-400" : "text-gold-100 hover:text-gold-300"
                    }`}
                    onClick={() => changeLanguage(language.code)}
                  >
                    {language.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Botón de registro */}
            {dictionary && dictionary.navbar && !isAuthenticated && (
              <Link href={`/${lang}/registro`}>
                <button className="button mobile-button-size">{dictionary.navbar.register}</button>
              </Link>
            )}

            {/* Menú hamburguesa */}
            <button
              className="mobile-menu-toggle"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Overlay del menú */}
      {isOpen && (
        <div className="mobile-menu-overlay" onClick={() => setIsOpen(false)}>
          <div className="mobile-menu-content" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <h3 className="mobile-menu-title">Navegación</h3>
              <button
                className="mobile-menu-close"
                onClick={() => setIsOpen(false)}
              >
                <X size={24} />
              </button>
            </div>

            <div className="mobile-menu-items">
              {navItems.map((item) => {
                // Lógica mejorada para detectar página activa
                const isActive = () => {
                  // Para enlaces con ancla (como #info-section)
                  if (item.isAnchor) {
                    const basePath = item.href.split("#")[0]
                    return pathname === basePath || pathname === basePath + "/"
                  }
                  // Para enlaces directos (como /ranking)
                  else {
                    return pathname === item.href || pathname === item.href + "/"
                  }
                }

                return (
                  <button
                    key={item.href}
                    className={`mobile-menu-item ${isActive() ? "active" : ""}`}
                    onClick={() => handleNavigation(item.href, item.isAnchor)}
                  >
                    {item.name}
                  </button>
                )
              })}
            </div>

            <div className="mobile-menu-auth">
              {dictionary && dictionary.navbar && (
                <>
                  {isAuthenticated ? (
                    <Link href={`/${lang}/panel`} className="w-full">
                      <button className="mobile-auth-btn primary" onClick={() => setIsOpen(false)}>
                        <User size={18} />
                        Panel de Usuario
                      </button>
                    </Link>
                  ) : (
                    <Link href={`/${lang}/inicio-sesion`} className="w-full">
                      <button className="mobile-auth-btn secondary" onClick={() => setIsOpen(false)}>
                        {dictionary.navbar.signin}
                      </button>
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
} 