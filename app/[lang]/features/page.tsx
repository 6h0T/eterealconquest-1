"use client"

import { getDictionary } from "@/i18n/config"
import { SectionDivider } from "@/components/section-divider"
import { VimeoBackground } from "@/components/vimeo-background"
import type { Locale } from "@/i18n/config"
import { useState, useEffect } from "react"
import ArrowCarousel from "@/components/arrow-carousel"

export default function FeaturesPage({ params }: { params: { lang: Locale } }) {
  const { lang } = params
  const [dict, setDict] = useState<any>(null)

  // Load dictionary when component mounts
  useEffect(() => {
    const loadDictionary = async () => {
      const dictionary = await getDictionary(params.lang as any)
      setDict(dictionary)
    }
    loadDictionary()
  }, [params.lang])

  // Define gallery items based on language
  const getGalleryItems = () => {
    const interfaceDescription =
      "Se acabo Mu Online con graficos antiguos. Aquí no hay aceleración gráfica ni trucos visuales engañosos, tampoco necesitaras una PC de última generación para notar una experiencia grafica TOTALMENTE DIFERENTE! ¡Hemos optimizado el motor del juego para ofrecer una experiencia moderna y unica! Prueba Etereal Conquest y redescubre Mu Online"

    return [
      {
        image: `/placeholder.svg?height=800&width=600&query=fantasy game graphics engine update vertical`,
        text:
          lang === "es"
            ? "Actualización de Motor Gráfico"
            : lang === "en"
              ? "Graphic Engine Update"
              : "Atualização do Motor Gráfico",
        vimeoEmbed:
          '<div style="padding:56.25% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/1084813301?h=a9d556bae2&autoplay=1&loop=1&background=1&app_id=58479" frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media" style="position:absolute;top:0;left:0;width:100%;height:100%;" title="2025-05-06 15-30-27"></iframe></div><script src="https://player.vimeo.com/api/player.js"></script>',
        description: interfaceDescription,
      },
      {
        image: `/placeholder.svg?height=800&width=600&query=fantasy game fps vertical`,
        text: lang === "es" ? "FPS" : lang === "en" ? "FPS" : "FPS",
        videoSrc: "/videos/transition.mp4",
        description:
          "Disfruta de una experiencia de juego fluida con altas tasas de FPS. Hemos optimizado el motor del juego para garantizar un rendimiento excepcional incluso en equipos modestos.",
      },
      {
        image: `/placeholder.svg?height=800&width=600&query=fantasy game skills vertical`,
        text: lang === "es" ? "Habilidades" : lang === "en" ? "Skills" : "Habilidades",
        videoSrc: "/videos/mg-fuerza-skills.mp4",
        description:
          "Domina un amplio repertorio de habilidades únicas para cada clase. Personaliza tu estilo de juego y crea combinaciones devastadoras para derrotar a tus enemigos.",
      },
      {
        image: `/placeholder.svg?height=800&width=600&query=fantasy game tests vertical`,
        text: lang === "es" ? "Pruebas" : lang === "en" ? "Tests" : "Testes",
        videoSrc: "/videos/transition-video.mp4",
        description:
          "Supera desafiantes pruebas y eventos especiales para obtener recompensas exclusivas. Pon a prueba tus habilidades y demuestra tu valía en el mundo de Eternal Conquest.",
      },
      {
        image: `/placeholder.svg?height=800&width=600&query=fantasy game equipment vertical`,
        text: lang === "es" ? "Equipamiento" : lang === "en" ? "Equipment" : "Equipamento",
        videoSrc: "/videos/new-transition.mp4",
        description:
          "Colecciona y mejora equipamiento legendario para potenciar a tu personaje. Cada pieza tiene atributos únicos que pueden marcar la diferencia en combate.",
      },
      {
        image: `/placeholder.svg?height=800&width=600&query=fantasy game items vertical`,
        text: lang === "es" ? "Ítems" : lang === "en" ? "Items" : "Itens",
        videoSrc: "/videos/fondo1.mp4",
        description:
          "Descubre una amplia variedad de ítems especiales que te ayudarán en tu aventura. Desde pociones hasta artefactos mágicos, cada objeto tiene un propósito específico.",
      },
      {
        image: `/placeholder.svg?height=800&width=600&query=fantasy game buffs vertical`,
        text: lang === "es" ? "Buffs" : lang === "en" ? "Buffs" : "Buffs",
        videoSrc: "/videos/rage-fighter-skills.mp4",
        description:
          "Potencia temporalmente tus habilidades con diversos buffs. Aprende a combinarlos estratégicamente para maximizar tu poder en situaciones críticas.",
      },
      {
        image: `/placeholder.svg?height=800&width=600&query=fantasy game auction vertical`,
        text: lang === "es" ? "Subastas" : lang === "en" ? "Auction" : "Leilões",
        videoSrc: "/videos/fondo-cards.mp4",
        description:
          "Participa en el sistema de subastas para comprar y vender objetos valiosos. Una economía dinámica donde podrás hacer fortuna si sabes negociar.",
      },
    ]
  }

  return (
    <div className="pt-32 pb-24 relative overflow-visible">
      {/* Vimeo background */}
      <VimeoBackground videoId="1074464598" fallbackId="1074465089" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold gold-gradient-text mb-6">
            {dict?.features?.title || "Características"}
          </h1>
          <p className="text-xl text-gold-100 max-w-3xl mx-auto">
            {lang === "es"
              ? "Descubre todas las características exclusivas que ETERNALQUEST tiene para ofrecer."
              : lang === "en"
                ? "Discover all the exclusive features that ETERNALQUEST has to offer."
                : "Descubra todas as características exclusivas que ETERNALQUEST tem para oferecer."}
          </p>
        </div>

        {/* Circular Gallery - completely replacing the card grid */}
        <div className="h-[600px] relative">
          <ArrowCarousel items={getGalleryItems()} />
        </div>
      </div>

      {/* Section divider */}
      <SectionDivider />
    </div>
  )
}
