import Link from "next/link"
import { cookies } from "next/headers"

export default function NotFound() {
  // Obtener el idioma de las cookies o usar el predeterminado
  const cookieStore = cookies()
  const lang = cookieStore.get("NEXT_LOCALE")?.value || "es"

  // Textos según el idioma
  const texts = {
    es: {
      title: "Página no encontrada",
      description: "Lo sentimos, la página que estás buscando no existe o ha sido movida.",
      button: "Volver al inicio",
    },
    en: {
      title: "Page not found",
      description: "Sorry, the page you are looking for does not exist or has been moved.",
      button: "Back to home",
    },
    pt: {
      title: "Página não encontrada",
      description: "Desculpe, a página que você está procurando não existe ou foi movida.",
      button: "Voltar ao início",
    },
  }

  const t = texts[lang as keyof typeof texts] || texts.es

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-bunker-950 p-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold gold-gradient-text mb-6">{t.title}</h1>
        <p className="text-gold-100 mb-8">{t.description}</p>
        <Link href={`/${lang}`}>
          <button className="golden-button">{t.button}</button>
        </Link>
      </div>
    </div>
  )
}
