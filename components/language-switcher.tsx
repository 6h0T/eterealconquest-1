"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Globe } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { i18n, getLocalizedUrl } from "@/i18n/config"
import { setCookie } from "cookies-next"

interface LanguageSwitcherProps {
  currentLocale: string
}

export function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isClient, setIsClient] = useState(false)

  // Evitar errores de hidratación
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Modificar la función changeLanguage para establecer español como predeterminado
  const changeLanguage = (newLocale: string) => {
    // Guardar la preferencia de idioma en una cookie
    setCookie("NEXT_LOCALE", newLocale, { maxAge: 60 * 60 * 24 * 30 }) // 30 días

    // Obtener la nueva URL con el idioma cambiado
    const newPath = getLocalizedUrl(pathname, newLocale)

    // Navegar a la nueva URL
    router.push(newPath)
  }

  if (!isClient) {
    return (
      <div className="language-selector">
        <Globe className="h-4 w-4 mr-1" />
        <span className="hidden sm:inline">{currentLocale.toUpperCase()}</span>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="language-selector">
          <Globe className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">{currentLocale.toUpperCase()}</span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-bunker-800 border-gold-700/50">
        {i18n.locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            className={`w-full cursor-pointer ${
              currentLocale === locale ? "text-gold-400" : "text-gold-100 hover:text-gold-300"
            }`}
            onClick={() => changeLanguage(locale)}
          >
            {i18n.localeNames[locale as keyof typeof i18n.localeNames]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
