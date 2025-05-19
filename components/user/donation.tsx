"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { CreditCard, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { Locale } from "@/i18n/config"

interface UserDonationProps {
  username: string
  lang: Locale
}

export function UserDonation({ username, lang }: UserDonationProps) {
  const [selectedAmount, setSelectedAmount] = useState("5.00")

  // Traducciones específicas para la donación
  const translations = {
    es: {
      title: "Donaciones",
      subtitle: "Apoya a EterealConquest y recibe recompensas exclusivas",
      benefits: "Beneficios",
      benefit1: "Acceso a items exclusivos",
      benefit2: "Mejora tu equipamiento",
      benefit3: "Apoya el desarrollo del servidor",
      benefit4: "Recibe WCoinC instantáneamente",
      rates: "Tasas de Conversión",
      formTitle: "Realizar Donación",
      formSubtitle: "Completa el formulario para realizar tu donación",
      accountName: "Nombre de Cuenta",
      enterAccount: "Ingresa tu nombre de cuenta",
      accountNameHelp: "Ingresa el nombre exacto de tu cuenta en el juego",
      selectAmount: "Selecciona un Monto",
      amountHelp: "Recibirás WCoinC según la tasa de conversión",
      paypalInfo:
        "Al hacer clic en 'Donar con PayPal', serás redirigido a PayPal para completar tu pago de forma segura. Los WCoinC se acreditarán automáticamente a tu cuenta después de la confirmación del pago.",
      donateButton: "Donar con PayPal",
      conversionRates: "Tasas de conversión",
      usd5: "5 USD = 5,000 WCoinC",
      usd10: "10 USD = 10,500 WCoinC",
      usd20: "20 USD = 22,000 WCoinC",
      usd50: "50 USD = 60,000 WCoinC",
      usd100: "100 USD = 130,000 WCoinC",
    },
    en: {
      title: "Donations",
      subtitle: "Support EterealConquest and receive exclusive rewards",
      benefits: "Benefits",
      benefit1: "Access to exclusive items",
      benefit2: "Upgrade your equipment",
      benefit3: "Support server development",
      benefit4: "Receive WCoinC instantly",
      rates: "Conversion Rates",
      formTitle: "Make a Donation",
      formSubtitle: "Complete the form to make your donation",
      accountName: "Account Name",
      enterAccount: "Enter your account name",
      accountNameHelp: "Enter the exact name of your game account",
      selectAmount: "Select an Amount",
      amountHelp: "You will receive WCoinC according to the conversion rate",
      paypalInfo:
        "By clicking 'Donate with PayPal', you will be redirected to PayPal to complete your payment securely. WCoinC will be automatically credited to your account after payment confirmation.",
      donateButton: "Donate with PayPal",
      conversionRates: "Conversion rates",
      usd5: "5 USD = 5,000 WCoinC",
      usd10: "10 USD = 10,500 WCoinC",
      usd20: "20 USD = 22,000 WCoinC",
      usd50: "50 USD = 60,000 WCoinC",
      usd100: "100 USD = 130,000 WCoinC",
    },
    pt: {
      title: "Doações",
      subtitle: "Apoie o EterealConquest e receba recompensas exclusivas",
      benefits: "Benefícios",
      benefit1: "Acesso a itens exclusivos",
      benefit2: "Melhore seu equipamento",
      benefit3: "Apoie o desenvolvimento do servidor",
      benefit4: "Receba WCoinC instantaneamente",
      rates: "Taxas de Conversão",
      formTitle: "Fazer uma Doação",
      formSubtitle: "Preencha o formulário para fazer sua doação",
      accountName: "Nome da Conta",
      enterAccount: "Digite o nome da sua conta",
      accountNameHelp: "Digite o nome exato da sua conta no jogo",
      selectAmount: "Selecione um Valor",
      amountHelp: "Você receberá WCoinC de acordo com a taxa de conversão",
      paypalInfo:
        "Ao clicar em 'Doar com PayPal', você será redirecionado para o PayPal para concluir seu pagamento com segurança. WCoinC será creditado automaticamente em sua conta após a confirmação do pagamento.",
      donateButton: "Doar com PayPal",
      conversionRates: "Taxas de conversão",
      usd5: "5 USD = 5.000 WCoinC",
      usd10: "10 USD = 10.500 WCoinC",
      usd20: "20 USD = 22.000 WCoinC",
      usd50: "50 USD = 60.000 WCoinC",
      usd100: "100 USD = 130.000 WCoinC",
    },
  }

  const t = translations[lang as keyof typeof translations]

  const paypalUrl =
    process.env.NEXT_PUBLIC_PAYPAL_ENV === "live"
      ? "https://www.paypal.com/cgi-bin/webscr"
      : "https://www.sandbox.paypal.com/cgi-bin/webscr"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-6">
        {/* Tasas de conversión */}
        <Card className="bg-bunker-800/90 backdrop-blur-sm border border-gold-700/30 overflow-hidden shadow-lg">
          <CardHeader className="bg-bunker-950/30 border-b border-gold-700/20 pb-3">
            <CardTitle className="text-gold-400 flex items-center text-xl">
              <DollarSign className="h-5 w-5 mr-2" />
              {t.conversionRates}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-bunker-900/50 border border-gold-700/20 rounded-lg p-3 text-center">
                <p className="text-gold-300">{t.usd5}</p>
              </div>
              <div className="bg-bunker-900/50 border border-gold-700/20 rounded-lg p-3 text-center">
                <p className="text-gold-300">{t.usd10}</p>
              </div>
              <div className="bg-bunker-900/50 border border-gold-700/20 rounded-lg p-3 text-center">
                <p className="text-gold-300">{t.usd20}</p>
              </div>
              <div className="bg-bunker-900/50 border border-gold-700/20 rounded-lg p-3 text-center">
                <p className="text-gold-300">{t.usd50}</p>
              </div>
              <div className="bg-bunker-900/50 border border-gold-700/20 rounded-lg p-3 text-center">
                <p className="text-gold-300">{t.usd100}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulario de donación */}
        <Card className="bg-bunker-800/90 backdrop-blur-sm border border-gold-700/30 overflow-hidden shadow-lg">
          <CardHeader className="bg-bunker-950/30 border-b border-gold-700/20 pb-3">
            <CardTitle className="text-gold-400 flex items-center text-xl">
              <CreditCard className="h-5 w-5 mr-2" />
              {t.formTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form action={paypalUrl} method="post" className="space-y-6">
              <input type="hidden" name="cmd" value="_xclick" />
              <input type="hidden" name="business" value="natecoronamu@gmail.com" />
              <input type="hidden" name="item_name" value="WCoin Donation" />
              <input type="hidden" name="amount" value={selectedAmount} />
              <input type="hidden" name="currency_code" value="USD" />
              <input type="hidden" name="custom" value={username} />
              <input type="hidden" name="notify_url" value={`${window.location.origin}/api/paypal/ipn`} />
              <input
                type="hidden"
                name="return"
                value={`${window.location.origin}/${lang}/panel?tab=donation&status=success`}
              />
              <input
                type="hidden"
                name="cancel_return"
                value={`${window.location.origin}/${lang}/panel?tab=donation&status=cancel`}
              />

              <div className="space-y-2">
                <Label htmlFor="accountName" className="text-gold-300 flex items-center">
                  <CreditCard className="h-4 w-4 mr-2 opacity-70" />
                  {t.accountName}
                </Label>
                <Input
                  id="accountName"
                  value={username}
                  readOnly
                  className="bg-bunker-900 border-gold-700/30 text-gold-100 focus:border-gold-500 focus:ring-gold-500/20 transition-all"
                />
                <p className="text-xs text-gold-300/70">{t.accountNameHelp}</p>
              </div>

              <div className="space-y-4">
                <Label className="text-gold-300 flex items-center">
                  <DollarSign className="h-4 w-4 mr-2 opacity-70" />
                  {t.selectAmount}
                </Label>
                <RadioGroup
                  defaultValue="5.00"
                  className="grid grid-cols-2 md:grid-cols-5 gap-4"
                  onValueChange={setSelectedAmount}
                >
                  <div>
                    <RadioGroupItem value="5.00" id="amount-5" className="peer sr-only" />
                    <Label
                      htmlFor="amount-5"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-gold-700/30 bg-bunker-900 p-4 hover:bg-bunker-800 hover:border-gold-500/50 peer-data-[state=checked]:border-gold-500 [&:has([data-state=checked])]:border-gold-500"
                    >
                      <span className="text-xl font-bold text-gold-400">$5</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="10.00" id="amount-10" className="peer sr-only" />
                    <Label
                      htmlFor="amount-10"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-gold-700/30 bg-bunker-900 p-4 hover:bg-bunker-800 hover:border-gold-500/50 peer-data-[state=checked]:border-gold-500 [&:has([data-state=checked])]:border-gold-500"
                    >
                      <span className="text-xl font-bold text-gold-400">$10</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="20.00" id="amount-20" className="peer sr-only" />
                    <Label
                      htmlFor="amount-20"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-gold-700/30 bg-bunker-900 p-4 hover:bg-bunker-800 hover:border-gold-500/50 peer-data-[state=checked]:border-gold-500 [&:has([data-state=checked])]:border-gold-500"
                    >
                      <span className="text-xl font-bold text-gold-400">$20</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="50.00" id="amount-50" className="peer sr-only" />
                    <Label
                      htmlFor="amount-50"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-gold-700/30 bg-bunker-900 p-4 hover:bg-bunker-800 hover:border-gold-500/50 peer-data-[state=checked]:border-gold-500 [&:has([data-state=checked])]:border-gold-500"
                    >
                      <span className="text-xl font-bold text-gold-400">$50</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="100.00" id="amount-100" className="peer sr-only" />
                    <Label
                      htmlFor="amount-100"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-gold-700/30 bg-bunker-900 p-4 hover:bg-bunker-800 hover:border-gold-500/50 peer-data-[state=checked]:border-gold-500 [&:has([data-state=checked])]:border-gold-500"
                    >
                      <span className="text-xl font-bold text-gold-400">$100</span>
                    </Label>
                  </div>
                </RadioGroup>
                <p className="text-xs text-gold-300/70">{t.amountHelp}</p>
              </div>

              <div className="bg-bunker-900/50 border border-gold-700/20 rounded-lg p-4 text-sm text-gold-100/80">
                <p>{t.paypalInfo}</p>
              </div>

              <Button
                type="submit"
                className="w-full bg-gold-600 text-bunker-950 hover:bg-gold-500 shadow-md shadow-gold-700/20 border border-gold-500/50 mt-2"
              >
                <span className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  {t.donateButton}
                </span>
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
