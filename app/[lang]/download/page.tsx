import { getDictionary } from "@/i18n/config"
import { Card, CardContent } from "@/components/ui/card"
import { Download, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectionDivider } from "@/components/section-divider"
import { VimeoBackground } from "@/components/vimeo-background"
import type { Locale } from "@/i18n/config"

export default async function DownloadPage({ params }: { params: { lang: Locale } }) {
  const { lang } = params
  const dict = await getDictionary(params.lang as any)

  return (
    <div className="py-28 relative overflow-visible flex flex-col justify-center min-h-screen">
      {/* Fondo con video de Vimeo */}
      <VimeoBackground videoId="1074464598" fallbackId="1074465089" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        <div className="text-center mb-12 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold gold-gradient-text mb-6">
            {lang === "es" ? "Descargar" : lang === "en" ? "Download" : "Baixar"}
          </h1>
          <p className="text-xl text-gold-100 max-w-3xl mx-auto">
            {lang === "es"
              ? "Descarga el cliente de ETEREAL MU y comienza tu aventura ahora mismo."
              : lang === "en"
                ? "Download the ETEREAL MU client and start your adventure right now."
                : "Baixe o cliente ETEREAL MU e comece sua aventura agora mesmo."}
          </p>
          {/* Eliminar la siguiente línea que contiene la línea dorada */}
          {/* <div className="w-24 h-1 bg-gold-500 mx-auto mt-6"></div> */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12 max-w-5xl w-full">
          <div>
            <Card className="bg-bunker-800 overflow-hidden h-full">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gold-300 mb-6">
                  {lang === "es" ? "Cliente Completo" : lang === "en" ? "Full Client" : "Cliente Completo"}
                </h2>
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-gold-500/10 flex items-center justify-center mr-4">
                    <Download className="h-6 w-6 text-gold-400" />
                  </div>
                  <div>
                    <div className="text-gold-100 font-medium">
                      {lang === "es" ? "Tamaño:" : lang === "en" ? "Size:" : "Tamanho:"} 2.4 GB
                    </div>
                    <div className="text-gold-100/70 text-sm">
                      {lang === "es" ? "Versión:" : lang === "en" ? "Version:" : "Versão:"} 1.5.2
                    </div>
                  </div>
                </div>
                <p className="text-gold-100 mb-8">
                  {lang === "es"
                    ? "Descarga el cliente completo del juego. Incluye todos los archivos necesarios para jugar."
                    : lang === "en"
                      ? "Download the full game client. Includes all necessary files to play."
                      : "Baixe o cliente completo do jogo. Inclui todos os arquivos necessários para jogar."}
                </p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-gold-400 mr-3" />
                    <span className="text-gold-100">
                      {lang === "es"
                        ? "Escaneado con antivirus"
                        : lang === "en"
                          ? "Scanned with antivirus"
                          : "Escaneado com antivírus"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-gold-400 mr-3" />
                    <span className="text-gold-100">
                      {lang === "es"
                        ? "Sin adware ni spyware"
                        : lang === "en"
                          ? "No adware or spyware"
                          : "Sem adware ou spyware"}
                    </span>
                  </div>
                </div>
                <Button variant="primary" className="w-full bg-gold-600 text-bunker-950 hover:bg-gold-500">
                  {lang === "es"
                    ? "Descargar Cliente Completo"
                    : lang === "en"
                      ? "Download Full Client"
                      : "Baixar Cliente Completo"}
                </Button>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card className="bg-bunker-800 overflow-hidden h-full">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gold-300 mb-6">
                  {lang === "es" ? "Actualizador" : lang === "en" ? "Updater" : "Atualizador"}
                </h2>
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-gold-500/10 flex items-center justify-center mr-4">
                    <Download className="h-6 w-6 text-gold-400" />
                  </div>
                  <div>
                    <div className="text-gold-100 font-medium">
                      {lang === "es" ? "Tamaño:" : lang === "en" ? "Size:" : "Tamanho:"} 85 MB
                    </div>
                    <div className="text-gold-100/70 text-sm">
                      {lang === "es" ? "Versión:" : lang === "en" ? "Version:" : "Versão:"} 1.5.2
                    </div>
                  </div>
                </div>
                <p className="text-gold-100 mb-8">
                  {lang === "es"
                    ? "Si ya tienes una versión anterior instalada, puedes usar el actualizador para obtener la última versión."
                    : lang === "en"
                      ? "If you already have a previous version installed, you can use the updater to get the latest version."
                      : "Se você já tem uma versão anterior instalada, pode usar o atualizador para obter a versão mais recente."}
                </p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-gold-400 mr-3" />
                    <span className="text-gold-100">
                      {lang === "es" ? "Actualización rápida" : lang === "en" ? "Fast update" : "Atualização rápida"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-gold-400 mr-3" />
                    <span className="text-gold-100">
                      {lang === "es"
                        ? "Conserva tu configuración"
                        : lang === "en"
                          ? "Keeps your settings"
                          : "Mantém suas configurações"}
                    </span>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  className="w-full bg-bunker-700 text-gold-400 hover:bg-bunker-600 border border-gold-500/30"
                >
                  {lang === "es" ? "Descargar Actualizador" : lang === "en" ? "Download Updater" : "Baixar Atualizador"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Divisor al final de la página - como elemento independiente */}
      <SectionDivider />
    </div>
  )
}
