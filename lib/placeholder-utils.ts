/**
 * Genera una URL para una imagen placeholder
 * @param width Ancho de la imagen
 * @param height Alto de la imagen
 * @param text Texto a mostrar en la imagen
 * @returns URL de la imagen placeholder
 */
export function getPlaceholderUrl(width = 300, height = 150, text = ""): string {
  // Usar la ruta relativa para que funcione en cualquier entorno
  return `/api/placeholder?width=${width}&height=${height}&text=${encodeURIComponent(text)}`
}

/**
 * Verifica si una URL es válida
 * @param url URL a verificar
 * @returns true si la URL es válida, false en caso contrario
 */
export function isValidUrl(url: string | null | undefined): boolean {
  if (!url) return false

  try {
    new URL(url)
    return true
  } catch (e) {
    return false
  }
}

/**
 * Obtiene una URL de imagen válida o un placeholder si la URL no es válida
 * @param imageUrl URL de la imagen
 * @param width Ancho del placeholder
 * @param height Alto del placeholder
 * @param text Texto para el placeholder
 * @returns URL válida o URL de placeholder
 */
export function getValidImageUrl(imageUrl: string | null | undefined, width = 300, height = 150, text = ""): string {
  return isValidUrl(imageUrl) ? imageUrl! : getPlaceholderUrl(width, height, text)
}
