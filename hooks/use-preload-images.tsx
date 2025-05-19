"use client"

import { useEffect } from "react"

export function usePreloadImages(imageUrls: string[]) {
  useEffect(() => {
    // Función para precargar una imagen
    const preloadImage = (url: string) => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image()
        img.src = url
        img.onload = () => resolve()
        img.onerror = () => {
          console.warn(`Failed to preload image: ${url}`)
          resolve() // Resolver de todos modos para no bloquear la carga
        }
      })
    }

    // Precargar todas las imágenes en paralelo
    const preloadAll = async () => {
      try {
        await Promise.all(imageUrls.map((url) => preloadImage(url)))
        console.log("All images preloaded successfully")
      } catch (error) {
        console.error("Error preloading images:", error)
      }
    }

    preloadAll()
  }, [imageUrls])
}
