import { put } from "@vercel/blob"

export async function uploadClassIcons() {
  try {
    // URLs de las imágenes proporcionadas
    const dkIconUrl =
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dk-icon-0pZk867caifxVWaYoXnPAcUqLmVDdK.png"
    const elfIconUrl =
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/elf-icon-mDT2kG4C0iFk9phQCzEpyHUdKTbvy0.png"
    const dwIconUrl =
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dw-icon-g6orUs2a4FHQot1csJmFblGuWwbTZ2.png"

    // Descargar las imágenes
    const dkResponse = await fetch(dkIconUrl)
    const elfResponse = await fetch(elfIconUrl)
    const dwResponse = await fetch(dwIconUrl)

    if (!dkResponse.ok || !elfResponse.ok || !dwResponse.ok) {
      throw new Error("Error al descargar una o más imágenes")
    }

    const dkBlob = await dkResponse.blob()
    const elfBlob = await elfResponse.blob()
    const dwBlob = await dwResponse.blob()

    // Subir las imágenes a Vercel Blob
    const dkUpload = await put("dk-icon.png", dkBlob, { access: "public" })
    const elfUpload = await put("elf-icon.png", elfBlob, { access: "public" })
    const dwUpload = await put("dw-icon.png", dwBlob, { access: "public" })

    return {
      dkUrl: dkUpload.url,
      elfUrl: elfUpload.url,
      dwUrl: dwUpload.url,
    }
  } catch (error) {
    console.error("Error al subir los iconos:", error)
    throw error
  }
}
