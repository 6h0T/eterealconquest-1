"use server"

// Esta función se ejecuta en el servidor y devuelve un valor seguro para el cliente
export async function getRecaptchaConfig() {
  // Constante para facilitar la desactivación de reCAPTCHA durante pruebas
  const FORCE_DISABLE_RECAPTCHA = true // Cambiar a false para reactivar reCAPTCHA cuando sea necesario

  // En lugar de devolver directamente la variable de entorno,
  // devolvemos un objeto con la información necesaria
  return {
    enabled: !FORCE_DISABLE_RECAPTCHA && !!process.env.RECAPTCHA_SECRET_KEY, // Solo indicamos si reCAPTCHA está habilitado
    siteKey: "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI", // Clave de prueba pública de Google
  }
}
