import { ClassIcon } from "./class-icon"

interface ClassEmojiProps {
  classId: number
  size?: number
  showImage?: boolean
}

export function ClassEmoji({ classId, size = 24, showImage = true }: ClassEmojiProps) {
  // Si showImage es true, mostrar la imagen de la clase
  if (showImage) {
    return <ClassIcon classId={classId} size={size} />
  }

  // Mapeo de clases a emojis (como fallback)
  const getClassEmoji = (classId: number): string => {
    // Obtener la clase base (múltiplos de 16)
    const baseClassId = Math.floor(classId / 16) * 16

    switch (baseClassId) {
      case 0: // Dark Wizard y evoluciones
        return "🧙‍♂️"
      case 16: // Dark Knight y evoluciones
        return "⚔️"
      case 32: // Fairy Elf y evoluciones
        return "🧝‍♀️"
      case 48: // Magic Gladiator y evoluciones
        return "🔥"
      case 64: // Dark Lord y evoluciones
        return "👑"
      case 80: // Summoner y evoluciones
        return "🔮"
      case 96: // Rage Fighter y evoluciones
        return "👊"
      case 112: // Grow Lancer y evoluciones
        return "🔱"
      case 128: // Rune Wizard y evoluciones
        return "📜"
      case 144: // Slayer y evoluciones
        return "🗡️"
      case 160: // Gun Crusher y evoluciones
        return "🔫"
      default:
        return "❓"
    }
  }

  return <span>{getClassEmoji(classId)}</span>
}
