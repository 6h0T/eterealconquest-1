"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getDictionary, type Locale } from "./config"
import { LanguageFallback } from "@/components/language-fallback"

type DictionaryContextType = {
  dictionary: any
  isLoading: boolean
  setLocale: (locale: Locale) => void
  error: string | null
  language: Locale // Añadido para exponer el locale actual
}

const DictionaryContext = createContext<DictionaryContextType>({
  dictionary: {},
  isLoading: true,
  setLocale: () => {},
  error: null,
  language: "es", // Valor por defecto
})

export function DictionaryProvider({ children, locale: initialLocale }: { children: ReactNode; locale: Locale }) {
  const [dictionary, setDictionary] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)
  const [locale, setLocale] = useState<Locale>(initialLocale)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const loadDictionary = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const dict = await getDictionary(locale)
      setDictionary(dict)
      setError(null)
    } catch (error: any) {
      console.error("Error loading dictionary:", error)
      setError(error.message || "Error desconocido al cargar el diccionario")
    } finally {
      setIsLoading(false)
    }
  }

  // Efecto para cargar el diccionario cuando cambia el locale o se solicita un retry
  useEffect(() => {
    loadDictionary()
  }, [locale, retryCount])

  // Función para reintentar la carga del diccionario
  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
  }

  // Si hay un error, mostrar el componente de fallback
  if (error) {
    return <LanguageFallback onRetry={handleRetry} />
  }

  return (
    <DictionaryContext.Provider
      value={{
        dictionary,
        isLoading,
        setLocale,
        error,
        language: locale, // Exponemos el locale actual como language
      }}
    >
      {children}
    </DictionaryContext.Provider>
  )
}

export function useDictionary() {
  return useContext(DictionaryContext)
}

// Añadimos la exportación de useLanguage que falta
export function useLanguage() {
  const context = useContext(DictionaryContext)
  return {
    language: context.language,
    setLanguage: context.setLocale,
  }
}

export function useTranslations() {
  const { dictionary } = useContext(DictionaryContext)
  return dictionary || {}
}
