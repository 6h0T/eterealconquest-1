"use client"

import { useEffect, useState } from "react"
import { getDictionary } from "@/i18n/config"
import { SectionDivider } from "@/components/section-divider"
import { VimeoBackground } from "@/components/vimeo-background"
import type { Locale } from "@/i18n/config"
import ClassModal from "@/components/class-modal"

export default function ClassesPage({ params }: { params: { lang: Locale } }) {
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

  // Class data with videos and descriptions
  const classes = [
    {
      title: lang === "es" ? "Sistema de 7 Clases" : lang === "en" ? "7-Class System" : "Sistema de 7 Classes",
      description:
        lang === "es"
          ? "Eternal Conquest presenta un sistema clásico de 7 clases, cada una con habilidades y características únicas. Desde poderosos guerreros hasta magos devastadores, elige tu camino y domina las artes de tu clase para convertirte en una leyenda."
          : lang === "en"
            ? "Eternal Conquest features a classic 7-class system, each with unique abilities and characteristics. From powerful warriors to devastating wizards, choose your path and master your class's arts to become a legend."
            : "Eternal Conquest apresenta um sistema clássico de 7 classes, cada uma com habilidades e características únicas. De poderosos guerreiros a magos devastadores, escolha seu caminho e domine as artes da sua classe para se tornar uma lenda.",
      imageSrc: "/placeholder-qaqd6.png",
      vimeoEmbed:
        '<div style="padding:56.25% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/1084813301?h=a9d556bae2&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media" style="position:absolute;top:0;left:0;width:100%;height:100%;" title="2025-05-06 15-30-27"></iframe></div><script src="https://player.vimeo.com/api/player.js"></script>',
    },
    {
      title: "Dark Knight",
      description:
        lang === "es"
          ? "Guerreros implacables que dominan el combate cuerpo a cuerpo. Equipados con espadas y armaduras pesadas, los Dark Knights son la primera línea de defensa en cualquier batalla."
          : lang === "en"
            ? "Relentless warriors who master close combat. Equipped with swords and heavy armor, Dark Knights are the first line of defense in any battle."
            : "Guerreiros implacáveis que dominam o combate corpo a corpo. Equipados com espadas e armaduras pesadas, os Dark Knights são a primeira linha de defesa em qualquer batalha.",
      imageSrc: "/images/classes/dk.jpg",
      videoSrc: "/videos/blade-knight-skills.mp4",
    },
    {
      title: "Dark Wizard",
      description:
        lang === "es"
          ? "Maestros de la magia elemental que pueden desatar devastadores ataques a distancia. Su poder mágico es inigualable, pero su defensa física es limitada."
          : lang === "en"
            ? "Masters of elemental magic who can unleash devastating ranged attacks. Their magical power is unmatched, but their physical defense is limited."
            : "Mestres da magia elemental que podem desencadear ataques devastadores à distância. Seu poder mágico é incomparável, mas sua defesa física é limitada.",
      imageSrc: "/images/classes/mg.jpg",
      videoSrc: "/videos/mg-fuerza-skills.mp4",
    },
    {
      title: "Elf",
      description:
        lang === "es"
          ? "Arqueros ágiles con precisión mortal. Los Elfos combinan ataques a distancia con magia de apoyo, convirtiéndolos en excelentes aliados en cualquier grupo."
          : lang === "en"
            ? "Agile archers with deadly precision. Elves combine ranged attacks with support magic, making them excellent allies in any group."
            : "Arqueiros ágeis com precisão mortal. Os Elfos combinam ataques à distância com magia de suporte, tornando-os excelentes aliados em qualquer grupo.",
      imageSrc: "/images/classes/elf.jpg",
      videoSrc: "/videos/transition.mp4",
    },
    {
      title: "Magic Gladiator",
      description:
        lang === "es"
          ? "Híbridos versátiles que dominan tanto la espada como la magia. Los Magic Gladiators pueden adaptarse a cualquier situación, combinando lo mejor de los guerreros y los magos."
          : lang === "en"
            ? "Versatile hybrids who master both sword and magic. Magic Gladiators can adapt to any situation, combining the best of warriors and wizards."
            : "Híbridos versáteis que dominam tanto a espada quanto a magia. Os Magic Gladiators podem se adaptar a qualquer situação, combinando o melhor dos guerreiros e magos.",
      imageSrc: "/images/classes/dw.jpg",
      videoSrc: "/videos/transition-video.mp4",
    },
    {
      title: "Dark Lord",
      description:
        lang === "es"
          ? "Líderes natos con habilidades de invocación. Los Dark Lords pueden convocar criaturas para luchar a su lado y fortalecer a sus aliados con poderosos buffs."
          : lang === "en"
            ? "Natural leaders with summoning abilities. Dark Lords can summon creatures to fight by their side and strengthen their allies with powerful buffs."
            : "Líderes natos com habilidades de invocação. Os Dark Lords podem convocar criaturas para lutar ao seu lado e fortalecer seus aliados com poderosos buffs.",
      imageSrc: "/images/classes/dl.jpg",
      videoSrc: "/videos/new-transition.mp4",
    },
    {
      title: "Summoner",
      description:
        lang === "es"
          ? "Maestros de la invocación y la magia oscura. Los Summoners controlan poderosas criaturas y lanzan hechizos debilitantes contra sus enemigos."
          : lang === "en"
            ? "Masters of summoning and dark magic. Summoners control powerful creatures and cast debilitating spells against their enemies."
            : "Mestres da invocação e magia negra. Os Summoners controlam criaturas poderosas e lançam feitiços debilitantes contra seus inimigos.",
      imageSrc: "/images/classes/sum.jpg",
      videoSrc: "/videos/fondo1.mp4",
    },
    {
      title: "Rage Fighter",
      description:
        lang === "es"
          ? "Luchadores cuerpo a cuerpo que canalizan su ira para desatar devastadores combos. Los Rage Fighters son imparables cuando entran en estado de furia."
          : lang === "en"
            ? "Close-combat fighters who channel their rage to unleash devastating combos. Rage Fighters are unstoppable when they enter a state of fury."
            : "Lutadores corpo a corpo que canalizam sua raiva para desencadear combos devastadores. Os Rage Fighters são imparáveis quando entram em estado de fúria.",
      imageSrc: "/images/classes/rf.jpg",
      videoSrc: "/videos/rage-fighter-skills.mp4",
    },
  ]

  return (
    <div className="pt-32 pb-24 relative overflow-visible">
      {/* Vimeo background */}
      <VimeoBackground videoId="1074464598" fallbackId="1074465089" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold gold-gradient-text mb-6">{dict?.classes?.title || "Clases"}</h1>
          <p className="text-xl text-gold-100 max-w-3xl mx-auto">
            {lang === "es"
              ? "Elige entre 7 clases únicas, cada una con sus propias habilidades y estilos de juego."
              : lang === "en"
                ? "Choose from 7 unique classes, each with their own abilities and playstyles."
                : "Escolha entre 7 classes únicas, cada uma com suas próprias habilidades e estilos de jogo."}
          </p>
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {/* First card is larger - 7 Class System */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3">
            <ClassModal
              title={classes[0].title}
              description={classes[0].description}
              imageSrc={classes[0].imageSrc}
              vimeoEmbed={classes[0].vimeoEmbed}
            />
          </div>

          {/* Individual class cards */}
          {classes.slice(1).map((classItem, index) => (
            <div key={index}>
              <ClassModal
                title={classItem.title}
                description={classItem.description}
                imageSrc={classItem.imageSrc}
                videoSrc={classItem.videoSrc}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Section divider */}
      <SectionDivider />
    </div>
  )
}
