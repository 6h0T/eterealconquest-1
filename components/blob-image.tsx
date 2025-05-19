import type React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { getValidImageUrl } from "@/lib/placeholder-utils"

interface BlobImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  fill?: boolean
  sizes?: string
}

export function BlobImage({
  src,
  alt,
  width = 300,
  height = 150,
  className,
  priority = false,
  fill = false,
  sizes,
  ...props
}: BlobImageProps & React.ComponentPropsWithoutRef<typeof Image>) {
  // Verificar si la URL ya es de Vercel Blob
  const isVercelBlob =
    src.startsWith("https://v0.blob.com/") || src.startsWith("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/")

  // Usar nuestra utilidad para obtener una URL válida
  const imageSrc = getValidImageUrl(src, width, height, alt)

  return (
    <Image
      src={imageSrc || "/placeholder.svg"}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      className={cn(className)}
      priority={priority}
      fill={fill}
      sizes={sizes}
      // Añadir manejo de errores para cargar el fallback si la imagen falla
      onError={(e) => {
        // @ts-ignore - Sabemos que currentTarget.src existe
        e.currentTarget.src = getValidImageUrl(null, width, height, alt)
        // Evitar bucles infinitos si el fallback también falla
        e.currentTarget.onerror = null
      }}
      {...props}
    />
  )
}
