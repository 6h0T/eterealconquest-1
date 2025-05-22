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
      image: "https://i.imgur.com/I1nqMRc.jpeg",
      text: lang === "es" 
        ? "¡Motor Gráfico Modernizado y Actualizado!" 
        : lang === "pt" 
          ? "Motor Gráfico Modernizado e Atualizado!" 
          : "Modernized and Updated Graphic Engine!",
      vimeoEmbed: '<div style="padding:56.25% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/1086489255?h=d81721ac13&badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&background=1&title=0&byline=0&portrait=0&controls=0" frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media" style="position:absolute;top:0;left:0;width:100%;height:100%;" title="Motor Gráfico"></iframe></div><script src="https://player.vimeo.com/api/player.js"></script>',
      description: lang === "es" 
        ? "Optmización grafica de ultima generación! Hemos renovado el motor gráfico para ofrecer una experiencia fluida real, una vez comiences tu aventura, disfrutaras Mu Online totalmente distintiva! 🎨 Interfaz rediseñada, efectos mejorados y un juego más moderno que nunca."
        : lang === "pt"
          ? "Otimização gráfica de última geração! Renovamos o motor gráfico para oferecer uma experiência fluida real. Quando você começar sua aventura, desfrutará de um Mu Online totalmente diferente! 🎨 Interface redesenhada, efeitos aprimorados e um jogo mais moderno do que nunca."
          : "State-of-the-art graphic optimization! We have renewed the graphic engine to offer a real fluid experience. Once you start your adventure, you will enjoy a completely distinctive Mu Online! 🎨 Redesigned interface, improved effects, and a more modern game than ever.",
    },
    {
      image: "https://i.imgur.com/VinmmZR.jpeg",
      text: lang === "es" 
        ? "Rework de Habilidades: PvP Rediseñado" 
        : lang === "pt" 
          ? "Reformulação de Habilidades: PvP Redesenhado" 
          : "Skills Rework: Redesigned PvP",
      vimeoEmbed: '<div style="padding:56.25% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/1086489329?h=4aa0069064&badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&background=1&title=0&byline=0&portrait=0&controls=0" frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media" style="position:absolute;top:0;left:0;width:100%;height:100%;" title="Rework Habilidades"></iframe></div><script src="https://player.vimeo.com/api/player.js"></script>',
      description: lang === "es" 
        ? "El combate evoluciona. Nuevas habilidades, ajustes clave y un enfoque total en el PvP. Cada clase se siente más poderosa, estratégica y única que nunca."
        : lang === "pt"
          ? "O combate evolui. Novas habilidades, ajustes chave e um foco total no PvP. Cada classe se sente mais poderosa, estratégica e única do que nunca."
          : "Combat evolves. New skills, key adjustments, and a total focus on PvP. Each class feels more powerful, strategic, and unique than ever.",
    },
    {
      image: "https://i.imgur.com/7fiwQ3P.jpeg",
      text: lang === "es" 
        ? "SISTEMA EXCLUSIVO DE RAREZA!" 
        : lang === "pt" 
          ? "SISTEMA EXCLUSIVO DE RARIDADE!" 
          : "EXCLUSIVE RARITY SYSTEM!",
      vimeoEmbed: '<div style="padding:56.25% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/1086468398?h=59426c2367&badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&background=1&title=0&byline=0&portrait=0&controls=0" frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media" style="position:absolute;top:0;left:0;width:100%;height:100%;" title="Rareza-drops"></iframe></div><script src="https://player.vimeo.com/api/player.js"></script>',
      description: lang === "es" 
        ? "El comercio y la progresión alcanzan una nueva dimensión gracias al sistema de rareza de ítems. Cada pieza ya no solo pertenece a un tier específico, sino que ahora se clasifica según su rareza: <strong>Normal, Uncommon, Rare, Epic y Legendary</strong>. La rareza no solo define el poder, sino también el prestigio. Obtener ítems Legendarios será un símbolo de dedicación y habilidad, consolidando a su portador como un verdadero conquistador!."
        : lang === "pt"
          ? "O comércio e a progressão atingem uma nova dimensão graças ao sistema de raridade de itens. Cada peça não pertence mais apenas a um tier específico, mas agora é classificada de acordo com sua raridade: <strong>Normal, Uncommon, Rare, Epic e Legendary</strong>. A raridade não define apenas o poder, mas também o prestígio. Obter itens Legendários será um símbolo de dedicação e habilidade, consolidando seu portador como um verdadeiro conquistador!."
          : "Trading and progression reach a new dimension thanks to the item rarity system. Each piece no longer just belongs to a specific tier, but is now classified according to its rarity: <strong>Normal, Uncommon, Rare, Epic and Legendary</strong>. Rarity not only defines power, but also prestige. Obtaining Legendary items will be a symbol of dedication and skill, establishing its bearer as a true conqueror!.",
    },
    {
      image: "https://i.imgur.com/vz5vQgT.jpeg",
      text: lang === "es" 
        ? "Nuevo Sistema de Dungeons" 
        : lang === "pt" 
          ? "Novo Sistema de Masmorras" 
          : "New Dungeon System",
      vimeoEmbed: '<div style="padding:56.25% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/1086489296?h=2dbdaeea40&badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&background=1&title=0&byline=0&portrait=0&controls=0" frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media" style="position:absolute;top:0;left:0;width:100%;height:100%;" title="Dungeons"></iframe></div><script src="https://player.vimeo.com/api/player.js"></script>',
      description: lang === "es" 
        ? "Explora mapas exclusivos, enfréntate a poderosos bosses y obtén ítems raros. Una experiencia PvE única que solo encontrarás en MU: Etereal Conquest."
        : lang === "pt"
          ? "Explore mapas exclusivos, enfrente chefes poderosos e obtenha itens raros. Uma experiência PvE única que você só encontrará em MU: Etereal Conquest."
          : "Explore exclusive maps, face powerful bosses, and obtain rare items. A unique PvE experience that you will only find in MU: Etereal Conquest.",
    }
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
                alt="ETEREALCONQUEST - S6EP3"
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
