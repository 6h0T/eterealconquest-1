import { put } from "@vercel/blob"
import { nanoid } from "nanoid"

/**
 * Sube una imagen al servicio Vercel Blob
 * @param file Archivo a subir
 * @param folder Carpeta opcional donde guardar el archivo (ej: "news")
 * @returns Objeto con la URL de la imagen subida
 */
export async function uploadImageToBlob(file: File, folder = "news") {
  try {
    // Validar el archivo
    if (!file || !file.type.startsWith("image/")) {
      throw new Error("El archivo debe ser una imagen")
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("La imagen no debe superar los 5MB")
    }

    // Generar un nombre único para el archivo
    const fileExtension = file.name.split(".").pop() || "jpg"
    const fileName = `${folder}/${nanoid()}-${Date.now()}.${fileExtension}`

    // Subir el archivo a Vercel Blob
    const blob = await put(fileName, file, {
      access: "public",
      addRandomSuffix: false, // Usamos nuestro propio sufijo
    })

    console.log("Imagen subida exitosamente a Blob:", blob.url)

    return {
      success: true,
      url: blob.url,
      size: blob.size,
      uploadedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Error al subir imagen a Vercel Blob:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    }
  }
}
