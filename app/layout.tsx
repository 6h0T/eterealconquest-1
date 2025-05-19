import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Rowdies, Trade_Winds } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { NewsProvider } from "@/contexts/news-context"

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
  title: "ETEREALCONQUEST - MU Online",
  description: "Sitio oficial de ETEREALCONQUEST, el mejor servidor de MU Online",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-192x192", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512", sizes: "512x512", type: "image/png" },
    ],
    apple: { url: "/apple-touch-icon", type: "image/png", sizes: "180x180" },
  },
  themeColor: "#1a365d",
  manifest: "/en/manifest.json", // Cambiado de "/manifest.json" a "/en/manifest.json"
    generator: 'v0.dev'
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
      <body className={`${rowdies.variable} ${tradeWinds.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <NewsProvider>{children}</NewsProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
