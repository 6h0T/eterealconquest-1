import Image from "next/image"

interface ClassIconProps {
  classId: number
  size?: number
}

export function ClassIcon({ classId, size = 24 }: ClassIconProps) {
  // Función para obtener la ruta de la imagen según el ID de clase
  const getClassImagePath = (classId: number): string => {
    // Mapeo de IDs de clase a imágenes
    // Consideramos el ID base (múltiplos de 16) para todas las evoluciones
    const baseClassId = Math.floor(classId / 16) * 16

    switch (baseClassId) {
      case 0: // Dark Wizard y evoluciones (0, 1, 2)
        return "/images/classes/dw.jpg"
      case 16: // Dark Knight y evoluciones (16, 17, 18)
        return "/images/classes/dk.jpg"
      case 32: // Fairy Elf y evoluciones (32, 33, 34)
        return "/images/classes/elf.jpg"
      case 48: // Magic Gladiator y evoluciones (48, 49)
        return "/images/classes/mg.jpg"
      case 64: // Dark Lord y evoluciones (64, 65)
        return "/images/classes/dl.jpg"
      case 80: // Summoner y evoluciones (80, 81, 82)
        return "/images/classes/sum.jpg"
      case 96: // Rage Fighter y evoluciones (96, 97, 98)
        return "/images/classes/rf.jpg"
      default:
        return "/images/classes/dw.jpg" // Imagen por defecto
    }
  }

  return (
    <div className="relative overflow-hidden rounded-full" style={{ width: size, height: size }}>
      <Image
        src={getClassImagePath(classId) || "/placeholder.svg"}
        alt={`Class ${classId}`}
        width={size}
        height={size}
        className="object-cover"
      />
    </div>
  )
}
