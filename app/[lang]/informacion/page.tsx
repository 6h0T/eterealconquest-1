"use client"

import { useState, useEffect } from "react"
import { getDictionary } from "@/i18n/config"
import type { Locale } from "@/i18n/config"
import { ImageBackground } from "@/components/image-background"
import { SectionDivider } from "@/components/section-divider"

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

        <div className="backdrop-blur-sm p-6 rounded-xl border border-gold-700/20 shadow-xl">
          {/* SERVER STATISTICS */}
          <h2 className="text-2xl font-bold gold-gradient-text mb-4">{t.general}</h2>
          <div className="overflow-x-auto mb-8">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-bunker-800 border-b border-gold-700/30">
                  <th className="py-3 px-4 text-left text-gold-400 font-medium" colSpan={2}>
                    {t.general}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-bunker-700/50 hover:bg-bunker-800/30">
                  <td className="py-3 px-4 text-gold-300" style={{ width: "50%" }}>
                    {t.serverVersion}
                  </td>
                  <td className="py-3 px-4 text-gold-200" style={{ width: "50%" }}>
                    Season X
                  </td>
                </tr>
                <tr className="border-b border-bunker-700/50 hover:bg-bunker-800/30">
                  <td className="py-3 px-4 text-gold-300">{t.experience}</td>
                  <td className="py-3 px-4 text-gold-200">500x</td>
                </tr>
                <tr className="border-b border-bunker-700/50 hover:bg-bunker-800/30">
                  <td className="py-3 px-4 text-gold-300">{t.masterExperience}</td>
                  <td className="py-3 px-4 text-gold-200">300x</td>
                </tr>
                <tr className="border-b border-bunker-700/50 hover:bg-bunker-800/30">
                  <td className="py-3 px-4 text-gold-300">{t.drop}</td>
                  <td className="py-3 px-4 text-gold-200">50%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* CHAOS MACHINE RATES */}
          <h2 className="text-2xl font-bold gold-gradient-text mb-4">{t.chaosMachine}</h2>
          <div className="overflow-x-auto mb-8">
            <table className="w-full table-auto border-collapse">
              <tbody>
                <tr className="bg-bunker-800 border-b border-gold-700/30">
                  <td className="py-3 px-4 text-gold-400 font-medium" width="30%" rowSpan={2} style={{ verticalAlign: "middle" }}>
                    {t.combination}
                  </td>
                  <td className="py-3 px-4 text-gold-400 font-medium text-center" width="60%" colSpan={2}>
                    {t.maxSuccessRate}
                  </td>
                </tr>
                <tr className="bg-bunker-800 border-b border-gold-700/30">
                  <td className="py-3 px-4 text-gold-400 font-medium text-center" width="30%">
                    {t.normal}
                  </td>
                  <td className="py-3 px-4 text-gold-400 font-medium text-center" width="30%">
                    {t.gold}
                  </td>
                </tr>
                <tr className="border-b border-bunker-700/50 hover:bg-bunker-800/30">
                  <td className="py-3 px-4 text-gold-300">{t.itemLuck}</td>
                  <td className="py-3 px-4 text-gold-200 text-center">25%</td>
                  <td className="py-3 px-4 text-gold-200 text-center">45%</td>
                </tr>
                <tr className="border-b border-bunker-700/50 hover:bg-bunker-800/30">
                  <td className="py-3 px-4 text-gold-300">{t.items101112}</td>
                  <td className="py-3 px-4 text-gold-200 text-center">40% + Luck</td>
                  <td className="py-3 px-4 text-gold-200 text-center">60% + Luck</td>
                </tr>
                <tr className="border-b border-bunker-700/50 hover:bg-bunker-800/30">
                  <td className="py-3 px-4 text-gold-300">{t.items131415}</td>
                  <td className="py-3 px-4 text-gold-200 text-center">35% + Luck</td>
                  <td className="py-3 px-4 text-gold-200 text-center">55% + Luck</td>
                </tr>
                <tr className="border-b border-bunker-700/50 hover:bg-bunker-800/30">
                  <td className="py-3 px-4 text-gold-300">{t.wingsLevel1}</td>
                  <td className="py-3 px-4 text-gold-200 text-center">40% + Luck</td>
                  <td className="py-3 px-4 text-gold-200 text-center">60% + Luck</td>
                </tr>
                <tr className="border-b border-bunker-700/50 hover:bg-bunker-800/30">
                  <td className="py-3 px-4 text-gold-300">{t.wingsLevel2}</td>
                  <td className="py-3 px-4 text-gold-200 text-center">30%</td>
                  <td className="py-3 px-4 text-gold-200 text-center">50%</td>
                </tr>
                <tr className="border-b border-bunker-700/50 hover:bg-bunker-800/30">
                  <td className="py-3 px-4 text-gold-300">{t.wingsLevel3}</td>
                  <td className="py-3 px-4 text-gold-200 text-center">25%</td>
                  <td className="py-3 px-4 text-gold-200 text-center">45%</td>
                </tr>
                <tr className="border-b border-bunker-700/50 hover:bg-bunker-800/30">
                  <td className="py-3 px-4 text-gold-300">{t.wingsLevel4}</td>
                  <td className="py-3 px-4 text-gold-200 text-center">15%</td>
                  <td className="py-3 px-4 text-gold-200 text-center">35%</td>
                </tr>
                <tr className="border-b border-bunker-700/50 hover:bg-bunker-800/30">
                  <td className="py-3 px-4 text-gold-300">{t.capeOfLord}</td>
                  <td className="py-3 px-4 text-gold-200 text-center">30%</td>
                  <td className="py-3 px-4 text-gold-200 text-center">50%</td>
                </tr>
                <tr className="border-b border-bunker-700/50 hover:bg-bunker-800/30">
                  <td className="py-3 px-4 text-gold-300">{t.socketWeapon}</td>
                  <td className="py-3 px-4 text-gold-200 text-center">40%</td>
                  <td className="py-3 px-4 text-gold-200 text-center">60%</td>
                </tr>
                <tr className="border-b border-bunker-700/50 hover:bg-bunker-800/30">
                  <td className="py-3 px-4 text-gold-300">{t.fragmentOfHorn}</td>
                  <td className="py-3 px-4 text-gold-200 text-center">70%</td>
                  <td className="py-3 px-4 text-gold-200 text-center">90%</td>
                </tr>
                <tr className="border-b border-bunker-700/50 hover:bg-bunker-800/30">
                  <td className="py-3 px-4 text-gold-300">{t.brokenHorn}</td>
                  <td className="py-3 px-4 text-gold-200 text-center">60%</td>
                  <td className="py-3 px-4 text-gold-200 text-center">80%</td>
                </tr>
                <tr className="border-b border-bunker-700/50 hover:bg-bunker-800/30">
                  <td className="py-3 px-4 text-gold-300">{t.hornOfFenrir}</td>
                  <td className="py-3 px-4 text-gold-200 text-center">50%</td>
                  <td className="py-3 px-4 text-gold-200 text-center">70%</td>
                </tr>
                <tr className="border-b border-bunker-700/50 hover:bg-bunker-800/30">
                  <td className="py-3 px-4 text-gold-300">{t.featherOfCondor}</td>
                  <td className="py-3 px-4 text-gold-200 text-center">40%</td>
                  <td className="py-3 px-4 text-gold-200 text-center">60%</td>
                </tr>
                <tr className="border-b border-bunker-700/50 hover:bg-bunker-800/30">
                  <td className="py-3 px-4 text-gold-300">{t.ancientHero}</td>
                  <td className="py-3 px-4 text-gold-200 text-center">30%</td>
                  <td className="py-3 px-4 text-gold-200 text-center">50%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* PARTY EXPERIENCE BONUS */}
          <h2 className="text-2xl font-bold gold-gradient-text mb-4">{t.partyBonus}</h2>
          <div className="overflow-x-auto mb-8">
            <table className="w-full table-auto border-collapse">
              <tbody>
                <tr className="bg-bunker-800 border-b border-gold-700/30">
                  <td className="py-3 px-4 text-gold-400 font-medium" width="30%" rowSpan={2} style={{ verticalAlign: "middle" }}>
                    {t.members}
                  </td>
                  <td className="py-3 px-4 text-gold-400 font-medium text-center" width="70%" colSpan={2}>
                    {t.experienceRate}
                  </td>
                </tr>
                <tr className="bg-bunker-800 border-b border-gold-700/30">
                  <td className="py-3 px-4 text-gold-400 font-medium text-center" width="35%">
                    {t.sameClass}
                  </td>
                  <td className="py-3 px-4 text-gold-400 font-medium text-center" width="35%">
                    {t.differentClass}
                  </td>
                </tr>
                <tr className="border-b border-bunker-700/50 hover:bg-bunker-800/30">
                  <td className="py-3 px-4 text-gold-300">{t.players2}</td>
                  <td className="py-3 px-4 text-gold-200">EXP% + 10%</td>
                  <td className="py-3 px-4 text-gold-200">EXP% + 20%</td>
                </tr>
                <tr className="border-b border-bunker-700/50 hover:bg-bunker-800/30">
                  <td className="py-3 px-4 text-gold-300">{t.players3}</td>
                  <td className="py-3 px-4 text-gold-200">EXP% + 20%</td>
                  <td className="py-3 px-4 text-gold-200">EXP% + 30%</td>
                </tr>
                <tr className="border-b border-bunker-700/50 hover:bg-bunker-800/30">
                  <td className="py-3 px-4 text-gold-300">{t.players4}</td>
                  <td className="py-3 px-4 text-gold-200">EXP% + 30%</td>
                  <td className="py-3 px-4 text-gold-200">EXP% + 40%</td>
                </tr>
                <tr className="border-b border-bunker-700/50 hover:bg-bunker-800/30">
                  <td className="py-3 px-4 text-gold-300">{t.players5}</td>
                  <td className="py-3 px-4 text-gold-200">EXP% + 40%</td>
                  <td className="py-3 px-4 text-gold-200">EXP% + 50%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* COMMANDS */}
          <h2 className="text-2xl font-bold gold-gradient-text mb-4">{t.commands}</h2>
          <div className="overflow-x-auto mb-8">
            <table className="w-full table-auto border-collapse">
              <tbody>
                <tr className="border-b border-bunker-700/50 hover:bg-bunker-800/30">
                  <td className="py-3 px-4 text-gold-300" width="30%">/reset</td>
                  <td className="py-3 px-4 text-gold-200">{t.reset}</td>
                </tr>
                <tr className="border-b border-bunker-700/50 hover:bg-bunker-800/30">
                  <td className="py-3 px-4 text-gold-300">/whisper [on/off]</td>
                  <td className="py-3 px-4 text-gold-200">{t.whisper}</td>
                </tr>
                <tr className="border-b border-bunker-700/50 hover:bg-bunker-800/30">
                  <td className="py-3 px-4 text-gold-300">/clearpk</td>
                  <td className="py-3 px-4 text-gold-200">{t.clearpk}</td>
                </tr>
                <tr className="border-b border-bunker-700/50 hover:bg-bunker-800/30">
                  <td className="py-3 px-4 text-gold-300">/post [message]</td>
                  <td className="py-3 px-4 text-gold-200">{t.post}</td>
                </tr>
                <tr className="border-b border-bunker-700/50 hover:bg-bunker-800/30">
                  <td className="py-3 px-4 text-gold-300">/str [points]</td>
                  <td className="py-3 px-4 text-gold-200">{t.str}</td>
                </tr>
                <tr className="border-b border-bunker-700/50 hover:bg-bunker-800/30">
                  <td className="py-3 px-4 text-gold-300">/addagi [points]</td>
                  <td className="py-3 px-4 text-gold-200">{t.addagi}</td>
                </tr>
                <tr className="border-b border-bunker-700/50 hover:bg-bunker-800/30">
                  <td className="py-3 px-4 text-gold-300">/addvit [points]</td>
                  <td className="py-3 px-4 text-gold-200">{t.addvit}</td>
                </tr>
                <tr className="border-b border-bunker-700/50 hover:bg-bunker-800/30">
                  <td className="py-3 px-4 text-gold-300">/addene [points]</td>
                  <td className="py-3 px-4 text-gold-200">{t.addene}</td>
                </tr>
                <tr className="border-b border-bunker-700/50 hover:bg-bunker-800/30">
                  <td className="py-3 px-4 text-gold-300">/addcmd [points]</td>
                  <td className="py-3 px-4 text-gold-200">{t.addcmd}</td>
                </tr>
                <tr className="border-b border-bunker-700/50 hover:bg-bunker-800/30">
                  <td className="py-3 px-4 text-gold-300">/requests [on/off]</td>
                  <td className="py-3 px-4 text-gold-200">{t.requests}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* VIDEO */}
          <h2 className="text-2xl font-bold gold-gradient-text mb-4">{t.video}</h2>
          <div className="relative w-full overflow-hidden pb-[56.25%] mb-8">
            <iframe 
              className="absolute top-0 left-0 w-full h-full rounded-lg"
              src="https://www.youtube.com/embed/H5QQDvgU-hE?controls=0" 
              frameBorder="0" 
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  )
} 