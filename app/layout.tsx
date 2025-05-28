import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Rowdies, Trade_Winds } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { NewsProvider } from "@/contexts/news-context"
import { Analytics } from '@vercel/analytics/react'

const rowdies = Rowdies({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  variable: "--font-rowdies",
  display: "swap",
})

const tradeWinds = Trade_Winds({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-trade-winds",
  display: "swap",
})

export const metadata: Metadata = {
  title: "ETEREALCONQUEST - S6EP3 | Servidor Privado MU Online",
  description: "Únete al mejor servidor privado de MU Online Season 6 Episode 3. Experiencia 9999x, Drop 80%, PvP balanceado, eventos automáticos y mucho más. ¡Descarga gratis!",
  keywords: "MU Online, servidor privado, Season 6, Episode 3, MMORPG, juego online, PvP, guilds, rankings, descargar gratis",
  authors: [{ name: "ETEREALCONQUEST Team" }],
  creator: "ETEREALCONQUEST",
  publisher: "ETEREALCONQUEST",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://eterealconquest.com',
    siteName: 'ETEREALCONQUEST',
    title: 'ETEREALCONQUEST - S6EP3 | Servidor Privado MU Online',
    description: 'Únete al mejor servidor privado de MU Online Season 6 Episode 3. Experiencia 9999x, Drop 80%, PvP balanceado.',
    images: [
      {
        url: 'https://eterealconquest.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ETEREALCONQUEST - Servidor Privado MU Online',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ETEREALCONQUEST - S6EP3 | Servidor Privado MU Online',
    description: 'Únete al mejor servidor privado de MU Online Season 6 Episode 3. Experiencia 9999x, Drop 80%, PvP balanceado.',
    images: ['https://eterealconquest.com/og-image.jpg'],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: { url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" },
  },
  themeColor: "#1a365d",
  manifest: "/manifest.json",
  verification: {
    google: "tu-codigo-de-verificacion-google",
    yandex: "tu-codigo-de-verificacion-yandex",
    yahoo: "tu-codigo-de-verificacion-yahoo",
  },
  alternates: {
    canonical: 'https://eterealconquest.com',
    languages: {
      'es-ES': 'https://eterealconquest.com/es',
      'en-US': 'https://eterealconquest.com/en',
      'pt-BR': 'https://eterealconquest.com/pt',
    },
  },
}

// Modificar el componente RootLayout para incluir un script de cliente
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="canonical" href="https://eterealconquest.com" />
        <meta name="google-site-verification" content="tu-codigo-de-verificacion-google" />
        <meta name="msvalidate.01" content="tu-codigo-de-verificacion-bing" />
        <meta name="yandex-verification" content="tu-codigo-de-verificacion-yandex" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Inicializar seguimiento de errores
              (function() {
                if (typeof window !== 'undefined') {
                  window.addEventListener('error', function(event) {
                    if (event.target && event.target.tagName === 'IMG') {
                      console.error('[Error de imagen]', event.target.src);
                    }
                  }, true);
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${rowdies.variable} ${tradeWinds.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <NewsProvider>
            {children}
            <Analytics />
          </NewsProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
