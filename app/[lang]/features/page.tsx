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
    return [
      {
        image: `/placeholder.svg?height=800&width=600&query=fantasy game graphics engine update vertical`,
        text: lang === "es" 
          ? "¡Motor Gráfico Modernizado y Actualizado!" 
          : lang === "en" 
            ? "Modernized and Updated Graphic Engine!" 
            : "Motor Gráfico Modernizado e Atualizado!",
        vimeoEmbed: '<div style="padding:56.25% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/1086489255?h=d81721ac13&badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&background=1&title=0&byline=0&portrait=0&controls=0" frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media" style="position:absolute;top:0;left:0;width:100%;height:100%;" title="Motor Gráfico"></iframe></div><script src="https://player.vimeo.com/api/player.js"></script>',
        description: lang === "es" 
          ? "Optmización grafica de ultima generación! Hemos renovado el motor gráfico para ofrecer una experiencia fluida real, una vez comiences tu aventura, disfrutaras Mu Online totalmente distintiva! 🎨 Interfaz rediseñada, efectos mejorados y un juego más moderno que nunca."
          : lang === "en"
            ? "State-of-the-art graphic optimization! We have renewed the graphic engine to offer a real fluid experience. Once you start your adventure, you will enjoy a completely distinctive Mu Online! 🎨 Redesigned interface, improved effects, and a more modern game than ever."
            : "Otimização gráfica de última geração! Renovamos o motor gráfico para oferecer uma experiência fluida real. Quando você começar sua aventura, desfrutará de um Mu Online totalmente diferente! 🎨 Interface redesenhada, efeitos aprimorados e um jogo mais moderno do que nunca.",
      },
      {
        image: `/placeholder.svg?height=800&width=600&query=fantasy game pvp vertical`,
        text: lang === "es" 
          ? "Rework de Habilidades: PvP Rediseñado" 
          : lang === "en" 
            ? "Skills Rework: Redesigned PvP" 
            : "Reformulação de Habilidades: PvP Redesenhado",
        vimeoEmbed: '<div style="padding:56.25% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/1086489329?h=4aa0069064&badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&background=1&title=0&byline=0&portrait=0&controls=0" frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media" style="position:absolute;top:0;left:0;width:100%;height:100%;" title="Rework Habilidades"></iframe></div><script src="https://player.vimeo.com/api/player.js"></script>',
        description: lang === "es" 
          ? "El combate evoluciona. Nuevas habilidades, ajustes clave y un enfoque total en el PvP. Cada clase se siente más poderosa, estratégica y única que nunca."
          : lang === "en"
            ? "Combat evolves. New skills, key adjustments, and a total focus on PvP. Each class feels more powerful, strategic, and unique than ever."
            : "O combate evolui. Novas habilidades, ajustes chave e um foco total no PvP. Cada classe se sente mais poderosa, estratégica e única do que nunca.",
      },
      {
        image: `/placeholder.svg?height=800&width=600&query=fantasy game rarity system vertical`,
        text: lang === "es" 
          ? "SISTEMA EXCLUSIVO DE RAREZA!" 
          : lang === "en" 
            ? "EXCLUSIVE RARITY SYSTEM!" 
            : "SISTEMA EXCLUSIVO DE RARIDADE!",
        vimeoEmbed: '<div style="padding:56.25% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/1086468398?h=59426c2367&badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&background=1&title=0&byline=0&portrait=0&controls=0" frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media" style="position:absolute;top:0;left:0;width:100%;height:100%;" title="Rareza-drops"></iframe></div><script src="https://player.vimeo.com/api/player.js"></script>',
        description: lang === "es" 
          ? "El comercio y la progresión alcanzan una nueva dimensión gracias al sistema de rareza de ítems. Cada pieza ya no solo pertenece a un tier específico, sino que ahora se clasifica según su rareza: <strong>Normal, Uncommon, Rare, Epic y Legendary</strong>. La rareza no solo define el poder, sino también el prestigio. Obtener ítems Legendarios será un símbolo de dedicación y habilidad, consolidando a su portador como un verdadero conquistador!."
          : lang === "en"
            ? "Trading and progression reach a new dimension thanks to the item rarity system. Each piece no longer just belongs to a specific tier, but is now classified according to its rarity: <strong>Normal, Uncommon, Rare, Epic and Legendary</strong>. Rarity not only defines power, but also prestige. Obtaining Legendary items will be a symbol of dedication and skill, establishing its bearer as a true conqueror!."
            : "O comércio e a progressão atingem uma nova dimensão graças ao sistema de raridade de itens. Cada peça não pertence mais apenas a um tier específico, mas agora é classificada de acordo com sua raridade: <strong>Normal, Uncommon, Rare, Epic e Legendary</strong>. A raridade não define apenas o poder, mas também o prestígio. Obter itens Legendários será um símbolo de dedicação e habilidade, consolidando seu portador como um verdadeiro conquistador!.",
      },
      {
        image: `/placeholder.svg?height=800&width=600&query=fantasy game dungeon vertical`,
        text: lang === "es" 
          ? "Nuevo Sistema de Dungeons" 
          : lang === "en"
            ? "New Dungeon System" 
            : "Novo Sistema de Masmorras",
        vimeoEmbed: '<div style="padding:56.25% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/1086489296?h=2dbdaeea40&badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&background=1&title=0&byline=0&portrait=0&controls=0" frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media" style="position:absolute;top:0;left:0;width:100%;height:100%;" title="Dungeons"></iframe></div><script src="https://player.vimeo.com/api/player.js"></script>',
        description: lang === "es" 
          ? "Explora mapas exclusivos, enfréntate a poderosos bosses y obtén ítems raros. Una experiencia PvE única que solo encontrarás en MU: Etereal Conquest."
          : lang === "en"
            ? "Explore exclusive maps, face powerful bosses, and obtain rare items. A unique PvE experience that you will only find in MU: Etereal Conquest."
            : "Explore mapas exclusivos, enfrente chefes poderosos e obtenha itens raros. Uma experiência PvE única que você só encontrará em MU: Etereal Conquest.",
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
