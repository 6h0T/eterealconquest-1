import type { Locale } from "@/i18n/config"

// Tipo para páginas con solo el parámetro de idioma
export type LocalePageProps = {
  params: {
    lang: Locale
  }
  searchParams?: { [key: string]: string | string[] | undefined }
}

// Tipo para páginas con parámetros adicionales (como ID)
export type LocalePagePropsWithParams<T = {}> = {
  params: {
    lang: Locale
  } & T
  searchParams?: { [key: string]: string | string[] | undefined }
}

// Ejemplo de uso:
// Para una página normal: function Page({ params }: LocalePageProps)
// Para una página con ID: function Page({ params }: LocalePagePropsWithParams<{ id: string }>)
