"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
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
        <div className="flex flex-col md:flex-row justify-center gap-16 max-w-3xl mx-auto">
          <div className="flex-1">
            <h3 className="text-gold-400 font-bold text-lg mb-4 text-center md:text-left">
              {dictionary.footer?.quickLinks}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href={`/${lang}`} className="text-gold-100 hover:text-gold-300 transition-colors">
                  {dictionary.navbar?.home}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/features`} className="text-gold-100 hover:text-gold-300 transition-colors">
                  {dictionary.navbar?.features}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/noticias`} className="text-gold-100 hover:text-gold-300 transition-colors">
                  {dictionary.navbar?.news}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/download`} className="text-gold-100 hover:text-gold-300 transition-colors">
                  {dictionary.navbar?.download}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/ranking`} className="text-gold-100 hover:text-gold-300 transition-colors">
                  {dictionary.navbar?.ranking}
                </Link>
              </li>
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
        <div className="mt-8 pt-8 text-center">
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
