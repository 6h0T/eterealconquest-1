"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion } from "framer-motion"

interface PreloaderProps {
  onLoadingComplete: () => void
}

export function Preloader({ onLoadingComplete }: PreloaderProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Simular progreso de carga
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        // Incrementar el progreso gradualmente
        const newProgress = prevProgress + Math.random() * 10

        // Si llegamos al 100%, limpiar el intervalo y notificar que la carga está completa
        if (newProgress >= 100) {
          clearInterval(interval)

          // Pequeño retraso antes de completar para mostrar el 100%
          setTimeout(() => {
            onLoadingComplete()
          }, 500)

          return 100
        }

        return newProgress
      })
    }, 200)

    // Asegurarse de que la carga se complete después de un tiempo máximo (10 segundos)
    const timeout = setTimeout(() => {
      clearInterval(interval)
      setProgress(100)
      setTimeout(() => {
        onLoadingComplete()
      }, 500)
    }, 10000)

    // Limpiar intervalos y timeouts al desmontar
    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [onLoadingComplete])

  return (
    <motion.div
      className="fixed inset-0 bg-bunker-950 flex flex-col items-center justify-center z-50"
      initial={{ opacity: 1 }}
      exit={{
        opacity: 0,
        transition: { duration: 0.8, ease: "easeInOut" },
      }}
    >
      <div className="w-full max-w-md px-4 flex flex-col items-center">
        {/* Logo */}
        <div className="mb-12 animate-float">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LOGO-OFICIAL-1.2-2r5D3y3IGm2ODScjRY2hduLVEpLl7x.png"
            alt="ETEREALCONQUEST - Mu Online"
            width={300}
            height={150}
            className="mx-auto"
          />
        </div>

        {/* Texto de carga */}
        <div className="text-gold-400 mb-4 text-center">
          <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
          >
            Cargando mundo de ETEREALCONQUEST...
          </motion.div>
        </div>

        {/* Barra de progreso */}
        <div className="w-full h-2 bg-bunker-800 rounded-full overflow-hidden mb-2 relative">
          <motion.div
            className="h-full bg-gradient-to-r from-gold-700 via-gold-500 to-gold-400"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />

          {/* Efecto de brillo en la barra */}
          <motion.div
            className="absolute top-0 bottom-0 w-20 bg-gradient-to-r from-transparent via-gold-300/30 to-transparent"
            initial={{ left: "-10%" }}
            animate={{ left: "110%" }}
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
              ease: "linear",
            }}
          />
        </div>

        {/* Porcentaje */}
        <div className="text-gold-300 text-sm">{Math.round(progress)}%</div>

        {/* Decoración */}
        <div className="mt-12 flex space-x-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-full bg-gold-500"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "loop",
                delay: i * 0.3,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}
