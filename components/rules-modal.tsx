"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X } from "lucide-react"
import type { Locale } from "@/i18n/config"

interface RulesModalProps {
  isOpen: boolean
  onClose: () => void
  lang: Locale
  rulesContent: string
  rulesTitle: string
}

export function RulesModal({ isOpen, onClose, lang, rulesContent, rulesTitle }: RulesModalProps) {
  // Traducciones para el botón cerrar
  const closeTranslations = {
    es: "Cerrar",
    en: "Close",
    pt: "Fechar"
  }

  const closeText = closeTranslations[lang] || closeTranslations.es

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] bg-bunker-900/95 backdrop-blur-md border border-gold-700/30 p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-gold-700/20">
          <DialogTitle className="text-xl font-bold gold-gradient-text pr-8">
            {rulesTitle}
          </DialogTitle>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none text-gold-400 hover:text-gold-300"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">{closeText}</span>
          </button>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(85vh-120px)] p-6">
          <div 
            className="prose prose-invert prose-gold max-w-none text-gold-100"
            dangerouslySetInnerHTML={{ __html: rulesContent }}
            style={{
              '--tw-prose-headings': 'rgb(251 191 36)',
              '--tw-prose-body': 'rgb(254 240 138)',
              '--tw-prose-bullets': 'rgb(251 191 36)',
              '--tw-prose-counters': 'rgb(251 191 36)',
            } as React.CSSProperties}
          />
        </ScrollArea>
        
        <div className="p-6 pt-4 border-t border-gold-700/20">
          <button
            onClick={onClose}
            className="golden-button w-full"
          >
            {closeText}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 