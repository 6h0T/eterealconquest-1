import { Resend } from "resend"

// Verificamos que la API key esté definida
if (!process.env.RESEND_API_KEY) {
  console.warn("RESEND_API_KEY no está definida. Los correos electrónicos no se enviarán correctamente.")
}

// Creamos y exportamos la instancia de Resend
export const resend = new Resend(process.env.RESEND_API_KEY)

// Función de ayuda para enviar correos electrónicos
export async function sendEmail({
  to,
  subject,
  html,
  from = "Etereal Conquest <noreply@mu-occidental.com>",
}: {
  to: string
  subject: string
  html: string
  from?: string
}) {
  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    })

    if (error) {
      console.error("Error al enviar correo electrónico:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error al enviar correo electrónico:", error)
    return { success: false, error }
  }
}
