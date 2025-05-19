"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DialogTitle } from "@/components/ui/dialog"
import { ArrowUp, Plus, Minus } from "lucide-react"
import type { Locale } from "@/i18n/config"

interface CharacterStatsEditorProps {
  characterName: string
  availablePoints: number
  currentStats: {
    strength: number
    dexterity: number
    vitality: number
    energy: number
  }
  lang: Locale
  onSuccess?: () => void
}

export function CharacterStatsEditor({
  characterName,
  availablePoints,
  currentStats,
  lang,
  onSuccess,
}: CharacterStatsEditorProps) {
  const [selectedStat, setSelectedStat] = useState<"str" | "agi" | "vit" | "ene">("str")
  const [amount, setAmount] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Traducciones
  const translations = {
    es: {
      title: "Añadir Estadísticas",
      strength: "Fuerza",
      dexterity: "Agilidad",
      vitality: "Vitalidad",
      energy: "Energía",
      current: "Actual",
      amount: "Cantidad",
      availablePoints: "Puntos disponibles",
      add: "Añadir",
      cancel: "Cancelar",
      max: "Máximo",
      error: "Error al añadir estadísticas",
      success: "Estadísticas añadidas correctamente",
    },
    en: {
      title: "Add Statistics",
      strength: "Strength",
      dexterity: "Dexterity",
      vitality: "Vitality",
      energy: "Energy",
      current: "Current",
      amount: "Amount",
      availablePoints: "Available points",
      add: "Add",
      cancel: "Cancel",
      max: "Max",
      error: "Error adding statistics",
      success: "Statistics added successfully",
    },
    pt: {
      title: "Adicionar Estatísticas",
      strength: "Força",
      dexterity: "Agilidade",
      vitality: "Vitalidade",
      energy: "Energia",
      current: "Atual",
      amount: "Quantidade",
      availablePoints: "Pontos disponíveis",
      add: "Adicionar",
      cancel: "Cancelar",
      max: "Máximo",
      error: "Erro ao adicionar estatísticas",
      success: "Estatísticas adicionadas com sucesso",
    },
  }

  const t = translations[lang as keyof typeof translations]

  // Mapeo de tipos de estadísticas a nombres legibles
  const statNames = {
    str: t.strength,
    agi: t.dexterity,
    vit: t.vitality,
    ene: t.energy,
  }

  // Mapeo de tipos de estadísticas a valores actuales
  const currentValues = {
    str: currentStats.strength,
    agi: currentStats.dexterity,
    vit: currentStats.vitality,
    ene: currentStats.energy,
  }

  // Función para añadir estadísticas
  const handleAddStat = async () => {
    if (amount <= 0 || amount > availablePoints) return

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Crear un objeto con las estadísticas a añadir
      const statsToAdd = {
        str: selectedStat === "str" ? amount : 0,
        agi: selectedStat === "agi" ? amount : 0,
        vit: selectedStat === "vit" ? amount : 0,
        ene: selectedStat === "ene" ? amount : 0,
      }

      const response = await fetch("/api/user/addstats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          characterName,
          stats: statsToAdd,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error desconocido")
      }

      setSuccess(t.success)
      if (onSuccess) {
        onSuccess()
      }
    } catch (err: any) {
      console.error("Error adding stats:", err)
      setError(err.message || t.error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <DialogTitle className="text-gold-400">{t.title}</DialogTitle>

      {error && <div className="p-3 bg-red-900/30 border border-red-500/30 text-red-300 rounded-md">{error}</div>}
      {success && (
        <div className="p-3 bg-green-900/30 border border-green-500/30 text-green-300 rounded-md">{success}</div>
      )}

      <div className="bg-bunker-950/50 rounded-lg p-4 border border-gold-700/20">
        <p className="text-gold-300 text-sm mb-3">
          {t.availablePoints}: <span className="text-gold-400 font-bold">{availablePoints}</span>
        </p>

        <Tabs defaultValue="str" value={selectedStat} onValueChange={(value) => setSelectedStat(value as any)}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger
              value="str"
              className="data-[state=active]:bg-gold-500 data-[state=active]:text-bunker-950 data-[state=inactive]:bg-bunker-800"
            >
              {t.strength}
            </TabsTrigger>
            <TabsTrigger
              value="agi"
              className="data-[state=active]:bg-gold-500 data-[state=active]:text-bunker-950 data-[state=inactive]:bg-bunker-800"
            >
              {t.dexterity}
            </TabsTrigger>
            <TabsTrigger
              value="vit"
              className="data-[state=active]:bg-gold-500 data-[state=active]:text-bunker-950 data-[state=inactive]:bg-bunker-800"
            >
              {t.vitality}
            </TabsTrigger>
            <TabsTrigger
              value="ene"
              className="data-[state=active]:bg-gold-500 data-[state=active]:text-bunker-950 data-[state=inactive]:bg-bunker-800"
            >
              {t.energy}
            </TabsTrigger>
          </TabsList>

          {/* Contenido común para todas las pestañas */}
          <div className="p-4 bg-bunker-900/70 rounded-lg border border-gold-700/20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gold-300 text-sm">{t.current}</p>
                <p className="text-gold-100 text-xl font-bold">{currentValues[selectedStat]}</p>
              </div>
              <div className="flex items-center">
                <ArrowUp className="text-gold-500 h-5 w-5 mr-1" />
                <p className="text-gold-300 text-sm">
                  {t.current} + <span className="text-gold-400 font-bold">{amount}</span> ={" "}
                  <span className="text-gold-100 font-bold">{currentValues[selectedStat] + amount}</span>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-gold-300 text-sm mb-2">{t.amount}</p>
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-bunker-800 border-gold-700/30 text-gold-400"
                    onClick={() => setAmount(Math.max(1, amount - 1))}
                    disabled={amount <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="mx-2 w-16">
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => {
                        const value = Number.parseInt(e.target.value)
                        if (!isNaN(value)) {
                          setAmount(Math.min(Math.max(1, value), availablePoints))
                        }
                      }}
                      className="bg-bunker-900 border-gold-700/30 text-gold-100 text-center"
                      min="1"
                      max={availablePoints}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-bunker-800 border-gold-700/30 text-gold-400"
                    onClick={() => setAmount(Math.min(amount + 1, availablePoints))}
                    disabled={amount >= availablePoints}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-2 bg-bunker-800 border-gold-700/30 text-gold-400"
                    onClick={() => setAmount(availablePoints)}
                  >
                    {t.max}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Tabs>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Button
          variant="outline"
          className="bg-bunker-800 border-gold-700/30 text-gold-400 hover:bg-bunker-700 hover:text-gold-300"
          onClick={handleAddStat}
          disabled={isLoading || amount <= 0 || amount > availablePoints}
        >
          {isLoading ? "..." : t.add}
        </Button>
        <Button variant="ghost" className="text-bunker-300 hover:text-bunker-100 hover:bg-bunker-800">
          {t.cancel}
        </Button>
      </div>
    </div>
  )
}
