"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreditCard, DollarSign, Info } from "lucide-react"
import { getDictionary } from "@/i18n/config"

export default function DonationForm({ lang }: { lang: string }) {
  const [username, setUsername] = useState("")
  const [amount, setAmount] = useState("5.00")
  const [loading, setLoading] = useState(false)

  // Dictionary will be loaded client-side
  const [dict, setDict] = useState<any>({})

  // Load dictionary on client side
  useState(() => {
    async function loadDictionary() {
      const dictionary = await getDictionary(lang)
      setDict(dictionary)
    }
    loadDictionary()
  })

  const handleAmountSelect = (value: string) => {
    setAmount(value)
  }

  const getPayPalUrl = () => {
    return process.env.NEXT_PUBLIC_PAYPAL_ENV === "live"
      ? "https://www.paypal.com/cgi-bin/webscr"
      : "https://www.sandbox.paypal.com/cgi-bin/webscr"
  }

  const getNotifyUrl = () => {
    return process.env.NEXT_PUBLIC_API_URL
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/paypal/ipn`
      : "https://eternalc1.vercel.app/api/paypal/ipn"
  }

  return (
    <Card className="bg-bunker-900 border-gold-800/30 shadow-xl">
      <CardHeader className="border-b border-bunker-800">
        <CardTitle className="text-gold-500 flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          {dict.donate?.formTitle || "Realizar Donación"}
        </CardTitle>
        <CardDescription>
          {dict.donate?.formSubtitle || "Completa el formulario para realizar tu donación"}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form action={getPayPalUrl()} method="post">
          <input type="hidden" name="cmd" value="_xclick" />
          <input type="hidden" name="business" value="natecoronamu@gmail.com" />
          <input type="hidden" name="item_name" value="WCoin Donation" />
          <input type="hidden" name="currency_code" value="USD" />
          <input type="hidden" name="amount" value={amount} />
          <input type="hidden" name="custom" value={username} />
          <input type="hidden" name="notify_url" value={getNotifyUrl()} />

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-bunker-200">
                {dict.donate?.accountName || "Nombre de Cuenta"}
              </Label>
              <Input
                id="username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={dict.donate?.enterAccount || "Ingresa tu nombre de cuenta"}
                required
                className="bg-bunker-800 border-bunker-700 text-white"
              />
              <p className="text-xs text-bunker-400">
                {dict.donate?.accountNameHelp || "Ingresa el nombre exacto de tu cuenta en el juego"}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-bunker-200">{dict.donate?.selectAmount || "Selecciona un Monto"}</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {["5.00", "10.00", "20.00", "50.00"].map((value) => (
                  <Button
                    key={value}
                    type="button"
                    variant={amount === value ? "default" : "outline"}
                    onClick={() => handleAmountSelect(value)}
                    className={`${
                      amount === value
                        ? "bg-gold-600 hover:bg-gold-700 text-bunker-950"
                        : "bg-bunker-800 border-bunker-700 text-white hover:bg-bunker-700"
                    }`}
                  >
                    ${value} USD
                  </Button>
                ))}
              </div>
              <p className="text-xs text-bunker-400">
                {dict.donate?.amountHelp || "Recibirás WCoinC según la tasa de conversión"}
              </p>
            </div>

            <div className="bg-bunker-800/50 p-4 rounded-md flex items-start gap-3">
              <Info className="h-5 w-5 text-gold-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-bunker-300">
                {dict.donate?.paypalInfo ||
                  "Al hacer clic en 'Donar con PayPal', serás redirigido a PayPal para completar tu pago de forma segura. Los WCoinC se acreditarán automáticamente a tu cuenta después de la confirmación del pago."}
              </p>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="border-t border-bunker-800 bg-bunker-950/30">
        <Button
          type="submit"
          className="w-full bg-gold-600 hover:bg-gold-700 text-bunker-950 flex items-center gap-2"
          disabled={!username || loading}
        >
          <DollarSign className="h-4 w-4" />
          {dict.donate?.donateButton || "Donar con PayPal"}
        </Button>
      </CardFooter>
    </Card>
  )
}
