import Image from "next/image"
import { getDictionary } from "@/i18n/config"
import { SoundControl } from "@/components/sound-control"
import CircularSlider from "@/components/circular-slider"
import type { Locale } from "@/i18n/config"
import { SectionDivider } from "@/components/section-divider"
import { AltSectionDivider } from "@/components/alt-section-divider"
import { VimeoScript } from "@/components/vimeo-script"
import { VimeoBackground } from "@/components/vimeo-background"
import { characters } from "@/constants"
import HomeNewsSection from "@/components/home-news-section"
import { ClientDownloadButton } from "@/components/client-download-button"
import ArrowCarousel from "@/components/arrow-carousel"

export default async function Home({ params }: { params: { lang: Locale } }) {
  // @ts-ignore - Suppress TS warning about direct param access
  const lang = params.lang as Locale
  const dict = await getDictionary(lang)

  // Lista de imágenes importantes para precargar
  const importantImages = [
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LOGO-OFICIAL-1.2-2r5D3y3IGm2ODScjRY2hduLVEpLl7x.png",
    // Añadir aquí otras imágenes importantes
    ...characters.map((char) => char.img),
    ...characters.map((char) => char.headerImg),
    ...characters.map((char) => char.characterImg),
  ]

  // Traducciones para el componente de noticias
  const newsTranslations = {
    es: {
      title: "Noticias",
      readMore: "Leer más",
      viewAll: "Ver todas las noticias",
      publishedOn: "Publicado el",
      loading: "Cargando noticias...",
      noNews: "No hay noticias disponibles en este momento",
    },
    en: {
      title: "News",
      readMore: "Read more",
      viewAll: "View all news",
      publishedOn: "Published on",
      loading: "Loading news...",
      noNews: "No news available at this time",
    },
    pt: {
      title: "Notícias",
      readMore: "Ler mais",
      viewAll: "Ver todas as notícias",
      publishedOn: "Publicado em",
      loading: "Carregando notícias...",
      noNews: "Não há notícias disponíveis no momento",
    },
  }

  // Define gallery items with game screenshots
  const galleryItems = [
    {
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1-H04lYZFyOTea5WMZJa9FO3vwP7860g.png",
      text:
        lang === "es"
          ? "Sistema de 7 Clases Clásico"
          : lang === "pt"
            ? "Sistema Clássico de 7 Classes"
            : "Classic 7-Class System",
    },
    {
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2%20%281%29-wYZAAb03xIYLXEwxxbXq6fHp5JlZII.png",
      text:
        lang === "es"
          ? "Experiencia Versión 2002"
          : lang === "pt"
            ? "Experiência da Versão 2002"
            : "Version 2002 Experience",
    },
    {
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3-IMpdmH8t4v8nSQz35ay2qu1Zqc75gf.png",
      text: lang === "es" ? "Renacimiento Completo" : lang === "pt" ? "Renascimento Completo" : "Complete Revival",
    },
    {
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4-2r2V8To0sYVsoq6SLKxNKWlO0j6Lsv.png",
      text:
        lang === "es"
          ? "Juego Basado en Habilidades"
          : lang === "pt"
            ? "Jogabilidade Baseada em Habilidades"
            : "Skill-Based Play",
    },
    {
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/5-cN6VR7hIZieZzLRLqpjqZTaVoCkUmV.png",
      text: lang === "es" ? "Sistema Único de Reset" : lang === "pt" ? "Sistema Único de Reset" : "Unique Reset System",
    },
  ]

  return (
    <>
      <div className="flex flex-col min-h-screen">
        {/* Vimeo Script */}
        <VimeoScript />

        {/* Hero Section with Vimeo Background */}
        <section id="hero-section" className="relative h-screen flex items-center justify-center py-16">
          <div className="absolute inset-0 z-0">
            {/* Overlay para mejorar la legibilidad del contenido */}
            <div className="absolute inset-0 bg-gradient-to-b from-bunker-950/50 via-bunker-950/60 to-bunker-950 z-10"></div>

            {/* Video de Vimeo como fondo */}
            <div className="absolute inset-0 w-full h-full">
              <div className="vimeo-wrapper">
                <iframe
                  id="vimeo-background"
                  src="https://player.vimeo.com/video/1072837249?h=468905b58b&badge=0&autopause=0&player_id=vimeo-background&app_id=58479&background=1&muted=1&loop=1&autoplay=1"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                  title="ETEREALCONQUEST Background"
                ></iframe>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="animate-float mb-12">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LOGO-OFICIAL-1.2-2r5D3y3IGm2ODScjRY2hduLVEpLl7x.png"
                alt="ETEREALCONQUEST - Mu Online"
                width={600}
                height={300}
                className="mx-auto"
              />
            </div>
            <div className="flex justify-center w-full mx-auto">
              <a href="#info-section" className="scroll-smooth">
                <button className="golden-button">{dict.hero.explore}</button>
              </a>
            </div>
          </div>

          {/* Sound Control */}
          <SoundControl playerId="vimeo-background" lang={lang} />
        </section>

        {/* Divisor después del hero - como elemento independiente */}
        <AltSectionDivider />

        {/* Features Section with Arrow Carousel */}
        <section id="info-section" className="py-16 relative">
          {/* Fondo con video de Vimeo */}
          <VimeoBackground videoId="1074464598" fallbackId="1074465089" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-2">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold gold-gradient-text mb-4">
                {dict.features.featuresAndServer}
              </h2>
            </div>

            {/* Arrow Carousel Component */}
            <ArrowCarousel items={galleryItems} />
          </div>
        </section>

        {/* Divisor después de features section - como elemento independiente */}
        <AltSectionDivider />

        {/* News Section */}
        <section id="news-section" className="py-16 relative">
          {/* Fondo con video de Vimeo */}
          <VimeoBackground videoId="1074465089" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-2">
            <HomeNewsSection lang={lang} translations={newsTranslations[lang as keyof typeof newsTranslations]} />
          </div>
        </section>

        {/* Divisor después de news section - como elemento independiente */}
        <SectionDivider />

        {/* Classes Section with CircularSlider */}
        <section id="classes-section" className="py-16 relative bg-bunker-950">
          {/* Circular Slider Component */}
          <CircularSlider lang={lang} />
        </section>

        {/* Divisor después de classes section - como elemento independiente */}
        <SectionDivider />

        {/* CTA Section */}
        <section id="cta-section" className="min-h-[500px] flex items-center justify-center relative">
          {/* Fondo con video de Vimeo */}
          <VimeoBackground videoId="1074465089" />
          <div className="container w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-2 flex flex-col items-center justify-center text-center py-20">
            <div className="flex flex-col items-center justify-center space-y-8">
              <h2 className="text-3xl md:text-5xl font-bold gold-gradient-text">{dict.cta.title}</h2>
              <p className="text-xl text-gold-100 max-w-2xl mx-auto">{dict.cta.description}</p>
              <div className="mt-8">
                <button className="golden-button download-trigger text-lg px-8 py-3">{dict.cta.download}</button>
              </div>
            </div>
          </div>
        </section>

        {/* Divisor después de la sección CTA - como elemento independiente */}
        <SectionDivider />
      </div>

      {/* Componente de cliente para manejar el modal */}
      <ClientDownloadButton lang={lang} />
    </>
  )
}
