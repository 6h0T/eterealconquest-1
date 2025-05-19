import { put } from "@vercel/blob"

export async function uploadDividerImage() {
  try {
    // Fetch the image from the provided URL
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DIVISORMU123-gggpDZZbKBBPQ6LpioUQkzgfgtift6.png",
    )
    const imageBuffer = await response.arrayBuffer()

    // Upload to Vercel Blob
    const blob = await put("images/DIVISORMU123.png", imageBuffer, {
      access: "public",
    })

    console.log("Imagen subida exitosamente a:", blob.url)
    return blob.url
  } catch (error) {
    console.error("Error al subir la imagen:", error)
    throw error
  }
}
