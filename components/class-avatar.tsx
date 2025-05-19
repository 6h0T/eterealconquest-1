import Image from "next/image"

interface ClassAvatarProps {
  classId: number
  size?: number
}

export function ClassAvatar({ classId, size = 24 }: ClassAvatarProps) {
  // Mapeo de classId a la URL de Blob correspondiente
  const getAvatarSrc = (classId: number): string => {
    // Usamos el ID base (múltiplos de 16) para todas las evoluciones
    const baseClassId = Math.floor(classId / 16) * 16

    switch (baseClassId) {
      case 0: // Dark Wizard y evoluciones (0, 1, 2)
        return "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dw.jpg-niMdRytgRCxFw5t2SQ5wvn9pO5X5X8.jpeg" // dw.jpg
      case 16: // Dark Knight y evoluciones (16, 17, 18)
        return "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dk.jpg-bLSXhg4sec0pYmRMPvW3Z0FIBr3oat.jpeg" // dk.jpg
      case 32: // Fairy Elf y evoluciones (32, 33, 34)
        return "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/elf.jpg-Ye9WiXMixJNOE55jwm499hojviQQxD.jpeg" // elf.jpg
      case 48: // Magic Gladiator y evoluciones (48, 49)
        return "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mg.jpg-bkkiwrrsyjHhIXuyR50Rei23E879yW.jpeg" // mg.jpg
      case 64: // Dark Lord y evoluciones (64, 65)
        return "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dl.jpg-elq1oySJFF79Mo68dUqW0a8UjP60L8.jpeg" // dl.jpg
      case 80: // Summoner y evoluciones (80, 81, 82)
        return "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sum.jpg-UmhIyXcNSr6vTVpKJfZE57kmEXAeG0.jpeg" // sum.jpg
      case 96: // Rage Fighter y evoluciones (96, 97, 98)
        return "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/rf.jpg-zEe4L5a5O6feSqv3Qo768HQHoEQ0YO.jpeg" // rf.jpg
      default:
        return ""
    }
  }

  const avatarSrc = getAvatarSrc(classId)

  // Si tenemos una imagen para esta clase, mostrarla
  if (avatarSrc) {
    return (
      <div className="rounded-full overflow-hidden" style={{ width: `${size}px`, height: `${size}px` }}>
        <Image
          src={avatarSrc || "/placeholder.svg"}
          alt={`Class ${classId} avatar`}
          width={size}
          height={size}
          className="object-cover"
          unoptimized // Para usar directamente las URLs de Blob sin optimización de Next.js
        />
      </div>
    )
  }

  // Fallback para clases desconocidas
  return (
    <div
      className="bg-bunker-700 rounded-full flex items-center justify-center"
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <span className="text-xs text-gold-400">?</span>
    </div>
  )
}
