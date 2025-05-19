export const i18n = {
  defaultLocale: "es",
  locales: ["es", "en", "pt"],
  // Definir nombres de idiomas para mostrar en el selector
  localeNames: {
    es: "Español",
    en: "English",
    pt: "Português",
  },
} as const

export type Locale = (typeof i18n)["locales"][number]

// Caché para los diccionarios
const dictCache: Record<string, any> = {}

// Función para precargar diccionarios comunes
export const preloadCommonDictionaries = async () => {
  try {
    // Precargar el diccionario predeterminado y quizás otros comunes
    if (!dictCache[i18n.defaultLocale]) {
      console.log(`Preloading dictionary for default locale: ${i18n.defaultLocale}`)
      try {
        dictCache[i18n.defaultLocale] = await dictionaries[i18n.defaultLocale]()
      } catch (error) {
        console.error(`Failed to preload dictionary for default locale`, error)
      }
    }
  } catch (error) {
    console.error("Error preloading dictionaries:", error)
  }
}

// Exportar el caché para poder acceder a él directamente si es necesario
export { dictCache }

export const dictionaries = {
  es: () => import("./dictionaries/es.json").then((module) => module.default),
  en: () => import("./dictionaries/en.json").then((module) => module.default),
  pt: () => import("./dictionaries/pt.json").then((module) => module.default),
}

export const getDictionary = async (locale: Locale) => {
  try {
    // Verificar si el locale es válido
    if (!i18n.locales.includes(locale as any)) {
      console.warn(`Invalid locale: ${locale}, falling back to default locale: ${i18n.defaultLocale}`)
      return getDictionary(i18n.defaultLocale)
    }

    // Si ya tenemos el diccionario en caché, lo devolvemos
    if (dictCache[locale]) {
      return dictCache[locale]
    }

    // Si no, lo cargamos y lo guardamos en caché
    try {
      const dict = await dictionaries[locale]()
      dictCache[locale] = dict
      return dict
    } catch (importError) {
      console.error(`Error importing dictionary for locale: ${locale}`, importError)

      // Fallback al idioma predeterminado si el solicitado no está disponible
      if (locale !== i18n.defaultLocale) {
        console.warn(`Falling back to default locale: ${i18n.defaultLocale}`)
        return getDictionary(i18n.defaultLocale)
      } else {
        // Si incluso el idioma predeterminado falla, devolver un objeto vacío
        console.error(`Failed to load even the default dictionary`)
        return {}
      }
    }
  } catch (error) {
    console.error(`Error in getDictionary for locale: ${locale}`, error)

    // Devolver un objeto vacío como último recurso para evitar errores en cascada
    return {}
  }
}

// Función para obtener la URL con el nuevo idioma
export function getLocalizedUrl(pathname: string, newLocale: string): string {
  // Verificar si la ruta ya tiene un locale
  const pathnameHasLocale = i18n.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  )

  if (pathnameHasLocale) {
    // Reemplazar el locale actual en la ruta
    for (const locale of i18n.locales) {
      if (pathname.startsWith(`/${locale}/`)) {
        return pathname.replace(`/${locale}/`, `/${newLocale}/`)
      } else if (pathname === `/${locale}`) {
        return `/${newLocale}`
      }
    }
  }

  // Si no tiene locale, añadir el nuevo
  return `/${newLocale}${pathname.startsWith("/") ? pathname : `/${pathname}`}`
}
