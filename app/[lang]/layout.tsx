import type React from "react"
import { Rowdies, Trade_Winds } from "next/font/google"
import "../globals.css"
import "../modal-animations.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import type { Locale } from "@/i18n/config"
import { PreloaderWrapper } from "@/components/preloader-wrapper"
import StreamsBox from "@/components/streams-box"
import { StructuredData } from "@/components/structured-data"
import { DiscordFloatButton } from "@/components/discord-float-button"

// Importar la función de precarga
import { preloadCommonDictionaries } from "@/i18n/config"

// Importar el ErrorBoundary
import ErrorBoundary from "@/components/error-boundary"

// Configurar la fuente Rowdies
const rowdies = Rowdies({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  variable: "--font-rowdies",
  display: "swap",
})

// Configurar la fuente Trade Winds
const tradeWinds = Trade_Winds({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-trade-winds",
  display: "swap",
})

// Interfaz para el layout
interface LayoutProps {
  children: React.ReactNode
  params: { lang: string }
}

// Función para generar metadata dinámica
export async function generateMetadata({ params }: { params: { lang: string } }) {
  const lang = params.lang as Locale
  
  const titles = {
    es: "ETEREALCONQUEST - S6EP3 | Servidor Privado MU Online",
    en: "ETEREALCONQUEST - S6EP3 | MU Online Private Server",
    pt: "ETEREALCONQUEST - S6EP3 | Servidor Privado MU Online"
  }
  
  const descriptions = {
    es: "Únete al mejor servidor privado de MU Online Season 6 Episode 3. Experiencia 9999x, Drop 80%, PvP balanceado, eventos automáticos y mucho más. ¡Descarga gratis!",
    en: "Join the best MU Online Season 6 Episode 3 private server. 9999x Experience, 80% Drop, balanced PvP, automatic events and much more. Free download!",
    pt: "Junte-se ao melhor servidor privado de MU Online Season 6 Episode 3. Experiência 9999x, Drop 80%, PvP balanceado, eventos automáticos e muito mais. Download grátis!"
  }

  return {
    title: titles[lang as keyof typeof titles] || titles.es,
    description: descriptions[lang as keyof typeof descriptions] || descriptions.es,
    alternates: {
      canonical: `https://eterealconquest.com/${lang}`,
      languages: {
        'es-ES': 'https://eterealconquest.com/es',
        'en-US': 'https://eterealconquest.com/en',
        'pt-BR': 'https://eterealconquest.com/pt',
      },
    },
    openGraph: {
      title: titles[lang as keyof typeof titles] || titles.es,
      description: descriptions[lang as keyof typeof descriptions] || descriptions.es,
      url: `https://eterealconquest.com/${lang}`,
      locale: lang === 'es' ? 'es_ES' : lang === 'en' ? 'en_US' : 'pt_BR',
    },
  }
}

// Precargar diccionarios comunes
preloadCommonDictionaries()

export default function Layout({ children, params }: LayoutProps) {
  const lang = params.lang as Locale

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <link rel="canonical" href={`https://eterealconquest.com/${lang}`} />
        <link rel="alternate" hrefLang="es" href="https://eterealconquest.com/es" />
        <link rel="alternate" hrefLang="en" href="https://eterealconquest.com/en" />
        <link rel="alternate" hrefLang="pt" href="https://eterealconquest.com/pt" />
        <link rel="alternate" hrefLang="x-default" href="https://eterealconquest.com/es" />
      </head>
      <body className={`${rowdies.variable} ${tradeWinds.variable} antialiased`}>
        <StructuredData type="website" lang={lang} />
        <StructuredData type="game" lang={lang} />
        <StructuredData type="organization" lang={lang} />
        
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>
            <PreloaderWrapper>
              <Navbar lang={lang} />
              <main className="min-h-screen">
                {children}
              </main>
              <Footer lang={lang} />
              <StreamsBox />
              <DiscordFloatButton lang={lang} />
            </PreloaderWrapper>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  )
}
