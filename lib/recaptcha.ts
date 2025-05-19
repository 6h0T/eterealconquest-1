// Modificar la función para que siempre devuelva true, independientemente del token
export const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY || ""

// Función para verificar el token de reCAPTCHA (solo para uso en el servidor)
export async function verifyRecaptcha(token: string): Promise<boolean> {
  // Siempre devuelve true, ignorando completamente la verificación
  return true
}
