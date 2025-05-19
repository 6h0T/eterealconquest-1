import { getDictionary } from "@/i18n/config"
import DonationForm from "@/components/donation-form"
import { SectionDivider } from "@/components/section-divider"

export default async function DonatePage({ params: { lang } }: { params: { lang: string } }) {
  const dict = await getDictionary(lang)

  return (
    <main className="min-h-screen bg-bunker-950 text-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-gold-500">
          {dict.donate?.title || "Donaciones"}
        </h1>
        <p className="text-center text-lg mb-8 text-bunker-300">
          {dict.donate?.subtitle || "Apoya a Eternal Conquest y recibe recompensas exclusivas"}
        </p>

        <SectionDivider className="my-8" />

        <div className="max-w-3xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-bunker-900 border border-gold-800/30 rounded-lg p-6 shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-gold-400">{dict.donate?.benefits || "Beneficios"}</h2>
              <ul className="space-y-3 text-bunker-200">
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">✦</span>
                  <span>{dict.donate?.benefit1 || "Acceso a items exclusivos"}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">✦</span>
                  <span>{dict.donate?.benefit2 || "Mejora tu equipamiento"}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">✦</span>
                  <span>{dict.donate?.benefit3 || "Apoya el desarrollo del servidor"}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">✦</span>
                  <span>{dict.donate?.benefit4 || "Recibe WCoinC instantáneamente"}</span>
                </li>
              </ul>
            </div>

            <div className="bg-bunker-900 border border-gold-800/30 rounded-lg p-6 shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-gold-400">{dict.donate?.rates || "Tasas de Conversión"}</h2>
              <div className="space-y-3 text-bunker-200">
                <div className="flex justify-between items-center border-b border-bunker-800 pb-2">
                  <span>$5 USD</span>
                  <span className="text-gold-500 font-semibold">5,000 WCoinC</span>
                </div>
                <div className="flex justify-between items-center border-b border-bunker-800 pb-2">
                  <span>$10 USD</span>
                  <span className="text-gold-500 font-semibold">10,000 WCoinC</span>
                </div>
                <div className="flex justify-between items-center border-b border-bunker-800 pb-2">
                  <span>$20 USD</span>
                  <span className="text-gold-500 font-semibold">22,000 WCoinC</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>$50 USD</span>
                  <span className="text-gold-500 font-semibold">60,000 WCoinC</span>
                </div>
              </div>
            </div>
          </div>

          <DonationForm lang={lang} />
        </div>
      </div>
    </main>
  )
}
