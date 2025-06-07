"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, Users, Zap, Clock, ExternalLink } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import type { Locale } from "@/i18n/config"
import { getDictionary } from "@/i18n/config"

interface DownloadModalProps {
  isOpen: boolean
  onClose: () => void
  lang: Locale
}

export function DownloadModal({ isOpen, onClose, lang }: DownloadModalProps) {
  const [dictionary, setDictionary] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)

  // Cargar el diccionario
  useEffect(() => {
    const loadDictionary = async () => {
      setIsLoading(true)
      try {
        const dict = await getDictionary(lang as any)
        setDictionary(dict)
      } catch (error) {
        console.error("Error loading dictionary:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (isOpen) {
      loadDictionary()
    }
  }, [lang, isOpen])

  // Traducciones específicas para la página de descargas
  const translations = {
    es: {
      title: "Descargas",
      whyChoose: "¿Por qué elegir ETEREALCONQUEST?",
      systemRequirements: "Requisitos del Sistema",
      secure: "Cliente seguro y optimizado a 60 FPS",
      exclusive: "Sistema exclusivo de PvP y PvM",
      community: "Comunidad activa con miles de miembros",
      updates: "¡Actualizaciones regulares de excelente calidad!",
      downloadClient: "Descargar Cliente",
      mediafire: "Descargar desde MediaFire",
      mega: "Descargar desde MEGA",
      drive: "Descargar desde Google Drive",
      version: "Versión 1.0.0",
      lastUpdate: "Última actualización: 15/05/2024",
      minimum: "Mínimo",
      recommended: "Recomendado",
      os: "SO",
      cpu: "CPU",
      ram: "RAM",
      gpu: "GPU",
      storage: "Almacenamiento",
      notes: "Notas:",
      note1: "Se recomienda una conexión a Internet estable para una mejor experiencia de juego.",
      note2:
        "El juego puede funcionar en sistemas con especificaciones inferiores, pero la experiencia puede verse afectada.",
      note3: "Para un rendimiento óptimo, asegúrese de tener los controladores de su tarjeta gráfica actualizados.",
    },
    en: {
      title: "Downloads",
      whyChoose: "Why Choose ETEREALCONQUEST?",
      systemRequirements: "System Requirements",
      secure: "Secure and Optimized 60 FPS RealClient",
      exclusive: "Exclusive PvP and PvM System",
      community: "Active Community with thousands of members",
      updates: "Regular Updates of outstanding quality!",
      downloadClient: "Download Client",
      mediafire: "Download from MediaFire",
      mega: "Download from MEGA",
      drive: "Download from Google Drive",
      version: "Version 1.0.0",
      lastUpdate: "Last update: 05/15/2024",
      minimum: "Minimum",
      recommended: "Recommended",
      os: "OS",
      cpu: "CPU",
      ram: "RAM",
      gpu: "GPU",
      storage: "Storage",
      notes: "Notes:",
      note1: "A stable Internet connection is recommended for a better gaming experience.",
      note2: "The game may run on systems with lower specifications, but the experience may be affected.",
      note3: "For optimal performance, make sure you have your graphics card drivers updated.",
    },
    pt: {
      title: "Downloads",
      whyChoose: "Por que escolher ETEREALCONQUEST?",
      systemRequirements: "Requisitos do Sistema",
      secure: "Cliente seguro e otimizado a 60 FPS",
      exclusive: "Sistema exclusivo de PvP e PvM",
      community: "Comunidade ativa com milhares de membros",
      updates: "Atualizações regulares de excelente qualidade!",
      downloadClient: "Baixar Cliente",
      mediafire: "Baixar do MediaFire",
      mega: "Baixar do MEGA",
      drive: "Baixar do Google Drive",
      version: "Versão 1.0.0",
      lastUpdate: "Última atualização: 15/05/2024",
      minimum: "Mínimo",
      recommended: "Recomendado",
      os: "OS",
      cpu: "CPU",
      ram: "RAM",
      gpu: "GPU",
      storage: "Armazenamento",
      notes: "Notas:",
      note1: "Recomenda-se uma conexão estável com a Internet para uma melhor experiência de jogo.",
      note2: "O jogo pode funcionar em sistemas com especificações inferiores, mas a experiência pode ser afetada.",
      note3: "Para um desempenho ideal, certifique-se de ter os drivers da sua placa gráfica atualizados.",
    },
  }

  const t = isLoading ? translations.es : translations[lang as keyof typeof translations]

  // Variantes para animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  }

  if (isLoading && isOpen) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-5xl bg-bunker-900/95 backdrop-blur-md border border-gold-700/30 p-0 overflow-hidden">
          <div className="animate-pulse h-10 w-64 bg-bunker-800 rounded-md mx-auto mb-8 mt-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            <div className="animate-pulse h-96 bg-bunker-800 rounded-lg"></div>
            <div className="animate-pulse h-96 bg-bunker-800 rounded-lg"></div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl bg-bunker-900/95 backdrop-blur-md border border-gold-700/30 p-0 overflow-hidden">
        <AnimatePresence>
          {isOpen && (
            <motion.div className="p-6" initial="hidden" animate="visible" exit="hidden" variants={containerVariants}>
              <motion.div className="text-center mb-8" variants={itemVariants}>
                <h1 className="text-3xl md:text-4xl font-bold gold-gradient-text">{t.title}</h1>
              </motion.div>

              <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tarjeta de ¿Por qué elegir ETEREALCONQUEST? */}
                  <motion.div variants={itemVariants}>
                    <Card className="bg-bunker-800/90 backdrop-blur-sm border border-gold-700/30 overflow-hidden h-full flex flex-col">
                      <CardContent className="p-6 flex flex-col flex-grow justify-between">
                        <div>
                          <h2 className="text-2xl font-bold text-gold-400 mb-6 text-center">{t.whyChoose}</h2>

                          <div className="space-y-5 mb-6">
                            <div className="flex items-start">
                              <div className="w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center mr-4 flex-shrink-0">
                                <Shield className="h-6 w-6 text-gold-400" />
                              </div>
                              <p className="text-gold-100 text-base pt-1">{t.secure}</p>
                            </div>

                            <div className="flex items-start">
                              <div className="w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center mr-4 flex-shrink-0">
                                <Zap className="h-6 w-6 text-gold-400" />
                              </div>
                              <p className="text-gold-100 text-base pt-1">{t.exclusive}</p>
                            </div>

                            <div className="flex items-start">
                              <div className="w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center mr-4 flex-shrink-0">
                                <Users className="h-6 w-6 text-gold-400" />
                              </div>
                              <p className="text-gold-100 text-base pt-1">{t.community}</p>
                            </div>

                            <div className="flex items-start">
                              <div className="w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center mr-4 flex-shrink-0">
                                <Clock className="h-6 w-6 text-gold-400" />
                              </div>
                              <p className="text-gold-100 text-base pt-1">{t.updates}</p>
                            </div>
                          </div>
                        </div>

                        {/* Nuevos botones de descarga */}
                        <div className="mt-auto">
                          <h3 className="text-xl font-bold text-gold-400 mb-4 text-center">{t.downloadClient}</h3>

                          <div className="grid grid-cols-3 gap-3 mb-4">
                            <a
                              href="https://www.mediafire.com/file/q96ogj6gwyb1bmr/Etereal+Mu+Beta+.rar/file"
                              className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-md transition-all duration-200 hover:shadow-lg"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                              <span>MediaFire</span>
                            </a>

                            <a
                              href="https://mega.nz/file/J6AHxaDb#9OKcs1f1grcO54L-E2NeCOD35Rfzhk7Sm2y4piZmYq0"
                              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-md transition-all duration-200 hover:shadow-lg"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                              <span>MEGA</span>
                            </a>

                            <a
                              href="https://drive.google.com/file/d/1x9QuFac95tuDf6dSL3BkMuAAq_K-3wdm/view?usp=sharing"
                              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-md transition-all duration-200 hover:shadow-lg"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                              <span>Drive</span>
                            </a>
                          </div>

                          <div className="text-center text-gold-200 text-sm">
                            <p>{t.version}</p>
                            <p>{t.lastUpdate}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Tarjeta de Requisitos del Sistema */}
                  <motion.div variants={itemVariants}>
                    <Card className="bg-bunker-800/90 backdrop-blur-sm border border-gold-700/30 overflow-hidden h-full flex flex-col">
                      <CardContent className="p-6 flex flex-col flex-grow justify-between">
                        <div>
                          <h2 className="text-2xl font-bold text-gold-400 mb-6 text-center">{t.systemRequirements}</h2>

                          <div className="grid grid-cols-3 gap-3 text-sm mb-6">
                            <div></div>
                            <div className="text-gold-400 font-bold text-center">{t.minimum}</div>
                            <div className="text-gold-400 font-bold text-center">{t.recommended}</div>

                            <div className="text-gold-300 font-bold">{t.os}:</div>
                            <div className="text-gold-100">Windows 7/8/10</div>
                            <div className="text-gold-100">Windows 10 64-bit</div>

                            <div className="text-gold-300 font-bold">{t.cpu}:</div>
                            <div className="text-gold-100">Intel Core i3 o AMD equivalente</div>
                            <div className="text-gold-100">Intel Core i5 o mejor</div>

                            <div className="text-gold-300 font-bold">{t.ram}:</div>
                            <div className="text-gold-100">4GB</div>
                            <div className="text-gold-100">8GB</div>

                            <div className="text-gold-300 font-bold">{t.gpu}:</div>
                            <div className="text-gold-100">DirectX 9 compatible</div>
                            <div className="text-gold-100">DirectX 11 compatible</div>

                            <div className="text-gold-300 font-bold">{t.storage}:</div>
                            <div className="text-gold-100">2GB disponible</div>
                            <div className="text-gold-100">4GB disponible</div>
                          </div>
                        </div>

                        <motion.div
                          className="bg-bunker-900/50 p-4 rounded-lg border border-gold-700/20 mt-auto"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6, duration: 0.5 }}
                        >
                          <h3 className="text-gold-400 font-bold mb-2">{t.notes}</h3>
                          <ul className="list-disc list-inside text-gold-100 space-y-1 text-sm">
                            <li>{t.note1}</li>
                            <li>{t.note2}</li>
                            <li>{t.note3}</li>
                          </ul>
                        </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
