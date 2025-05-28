"use client"

import { useState, useEffect } from "react"
import { getDictionary } from "@/i18n/config"
import type { Locale } from "@/i18n/config"
import { ImageBackground } from "@/components/image-background"

export default function InformacionPage({ params }: { params: { lang: Locale } }) {
  const [dictionary, setDictionary] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)
  const lang = params.lang as Locale

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

    loadDictionary()
  }, [lang])

  // Obtener las traducciones del diccionario
  const t = isLoading ? {} : dictionary.info || {}

  if (isLoading) {
    return (
      <div className="pt-20 pb-16 relative overflow-visible min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse h-10 w-64 bg-bunker-800 rounded-md mx-auto mb-8"></div>
          <div className="animate-pulse h-96 bg-bunker-800 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-20 pb-16 relative overflow-visible min-h-screen">
      {/* Fondo con imagen */}
      <ImageBackground imagePath="https://i.imgur.com/MrDWSAr.jpeg" overlayOpacity={0.3} />

      <div className="container max-w-6xl mx-auto px-4 sm:px-6 relative z-20">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold gold-gradient-text mb-4">{t.title}</h1>
        </div>

        <div className="backdrop-blur-sm p-6 rounded-xl border border-gold-700/20 shadow-xl space-y-8">
          
          {/* INFORMACIÓN GENERAL */}
          <section>
            <h2 className="text-2xl font-bold gold-gradient-text mb-4">{t.general}</h2>
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <tbody>
                  <tr className="border-b border-bunker-700/50 hover:bg-bunker-800/30">
                    <td className="py-3 px-4 text-gold-300 font-medium" style={{ width: "50%" }}>
                      {t.serverVersion}
                    </td>
                    <td className="py-3 px-4 text-gold-200" style={{ width: "50%" }}>
                      Season 6
                    </td>
                  </tr>
                  <tr className="border-b border-bunker-700/50 hover:bg-bunker-800/30">
                    <td className="py-3 px-4 text-gold-300 font-medium">{t.experience}</td>
                    <td className="py-3 px-4 text-gold-200">10x (Dinámica)</td>
                  </tr>
                  <tr className="border-b border-bunker-700/50 hover:bg-bunker-800/30">
                    <td className="py-3 px-4 text-gold-300 font-medium">{t.drop}</td>
                    <td className="py-3 px-4 text-gold-200">30%</td>
                  </tr>
                  <tr className="border-b border-bunker-700/50 hover:bg-bunker-800/30">
                    <td className="py-3 px-4 text-gold-300 font-medium">{t.zen}</td>
                    <td className="py-3 px-4 text-gold-200">Low</td>
                  </tr>
                  <tr className="border-b border-bunker-700/50 hover:bg-bunker-800/30">
                    <td className="py-3 px-4 text-gold-300 font-medium">{t.serverType}</td>
                    <td className="py-3 px-4 text-gold-200">No Reset</td>
                  </tr>
                  <tr className="border-b border-bunker-700/50 hover:bg-bunker-800/30">
                    <td className="py-3 px-4 text-gold-300 font-medium">{t.maxLevel}</td>
                    <td className="py-3 px-4 text-gold-200">400</td>
                  </tr>
                  <tr className="border-b border-bunker-700/50 hover:bg-bunker-800/30">
                    <td className="py-3 px-4 text-gold-300 font-medium">{t.maxAccounts}</td>
                    <td className="py-3 px-4 text-gold-200">5</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* CARACTERÍSTICAS ESPECIALES */}
          <section>
            <h2 className="text-2xl font-bold gold-gradient-text mb-4">{t.specialFeatures}</h2>
            <div className="grid gap-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-bunker-800/30 border border-gold-700/20">
                <span className="text-gold-400 text-xl">⚡</span>
                <span className="text-gold-200">{t.updatedEngine}</span>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-bunker-800/30 border border-gold-700/20">
                <span className="text-gold-400 text-xl">🎨</span>
                <span className="text-gold-200">{t.modernInterface}</span>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-bunker-800/30 border border-gold-700/20">
                <span className="text-gold-400 text-xl">🌍</span>
                <span className="text-gold-200">{t.multiLanguage}</span>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-bunker-800/30 border border-gold-700/20">
                <span className="text-gold-400 text-xl">💎</span>
                <span className="text-gold-200">{t.raritySystem}</span>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-bunker-800/30 border border-gold-700/20">
                <span className="text-gold-400 text-xl">🏰</span>
                <span className="text-gold-200">{t.dungeonSystem}</span>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-bunker-800/30 border border-gold-700/20">
                <span className="text-gold-400 text-xl">🗺️</span>
                <span className="text-gold-200">{t.newContinent}</span>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-bunker-800/30 border border-gold-700/20">
                <span className="text-gold-400 text-xl">🚁</span>
                <span className="text-gold-200">{t.airshipSystem}</span>
              </div>
            </div>
          </section>

          {/* SISTEMA PVP */}
          <section>
            <h2 className="text-2xl font-bold gold-gradient-text mb-4">{t.pvpSystem}</h2>
            <div className="grid gap-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-bunker-800/30 border border-gold-700/20">
                <span className="text-gold-400 text-xl">⚔️</span>
                <span className="text-gold-200">{t.battlegrounds}</span>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-bunker-800/30 border border-gold-700/20">
                <span className="text-gold-400 text-xl">🏆</span>
                <span className="text-gold-200">{t.rankingSystem}</span>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-bunker-800/30 border border-gold-700/20">
                <span className="text-gold-400 text-xl">✨</span>
                <span className="text-gold-200">{t.improvedSkills}</span>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-bunker-800/30 border border-gold-700/20">
                <span className="text-gold-400 text-xl">🛡️</span>
                <span className="text-gold-200">{t.antihack}</span>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-bunker-800/30 border border-gold-700/20">
                <span className="text-gold-400 text-xl">🎯</span>
                <span className="text-gold-200">{t.tournaments}</span>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-bunker-800/30 border border-gold-700/20">
                <span className="text-gold-400 text-xl">🏰</span>
                <span className="text-gold-200">{t.castleSiege}</span>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-bunker-800/30 border border-gold-700/20">
                <span className="text-gold-400 text-xl">🎯</span>
                <span className="text-gold-200">{t.dummys}</span>
              </div>
            </div>
          </section>

          {/* ECONOMÍA DEL SERVIDOR */}
          <section>
            <h2 className="text-2xl font-bold gold-gradient-text mb-4">{t.serverEconomy}</h2>
            <div className="grid gap-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-bunker-800/30 border border-gold-700/20">
                <span className="text-gold-400 text-xl">🚫</span>
                <span className="text-gold-200">{t.noPay2Win}</span>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-bunker-800/30 border border-gold-700/20">
                <span className="text-gold-400 text-xl">🏪</span>
                <span className="text-gold-200">{t.auctionHouse}</span>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-bunker-800/30 border border-gold-700/20">
                <span className="text-gold-400 text-xl">💰</span>
                <span className="text-gold-200">{t.wcoinTrade}</span>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-bunker-800/30 border border-gold-700/20">
                <span className="text-gold-400 text-xl">👹</span>
                <span className="text-gold-200">{t.goblinStore}</span>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-bunker-800/30 border border-gold-700/20">
                <span className="text-gold-400 text-xl">🎮</span>
                <span className="text-gold-200">{t.earnGoblinPoints}</span>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-bunker-800/30 border border-gold-700/20">
                <span className="text-gold-400 text-xl">📈</span>
                <span className="text-gold-200">{t.progressiveRewards}</span>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-bunker-800/30 border border-gold-700/20">
                <span className="text-gold-400 text-xl">🏛️</span>
                <span className="text-gold-200">{t.guildRewards}</span>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
} 