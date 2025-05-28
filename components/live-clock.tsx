"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"

interface LiveClockProps {
  className?: string
}

export function LiveClock({ className = "" }: LiveClockProps) {
  const [time, setTime] = useState<string>("")
  const [date, setDate] = useState<string>("")
  
  useEffect(() => {
    // Función para actualizar la hora
    const updateClock = () => {
      const now = new Date()
      
      // Ajustar a UTC-3
      const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000)
      const utcMinus3 = new Date(utcTime - (3 * 3600000))
      
      // Formatear la hora con horas, minutos y segundos
      const hours = utcMinus3.getHours().toString().padStart(2, '0')
      const minutes = utcMinus3.getMinutes().toString().padStart(2, '0')
      const seconds = utcMinus3.getSeconds().toString().padStart(2, '0')
      
      setTime(`${hours}:${minutes}:${seconds}`)
      
      // Formatear la fecha
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }
      setDate(utcMinus3.toLocaleDateString('es-ES', options))
    }
    
    // Actualizar inmediatamente
    updateClock()
    
    // Actualizar cada segundo
    const interval = setInterval(updateClock, 1000)
    
    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <div className="bg-bunker-800/80 backdrop-blur-sm px-4 py-2 rounded-md border border-gold-700/30 inline-flex items-center gap-2">
        <Clock className="h-4 w-4 text-gold-400" />
        <span className="text-gold-300 font-mono">{time}</span>
        <span className="text-xs text-gold-500 px-2 py-0.5 bg-bunker-700/80 rounded-md">UTC-3</span>
      </div>
    </div>
  )
} 