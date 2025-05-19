import { getDictionary } from "@/i18n/config"
import { BlobVideo } from "@/components/blob-video"
import { BlobImage } from "@/components/blob-image"
import { SectionDivider } from "@/components/section-divider"
import { VimeoBackground } from "@/components/vimeo-background"
import type { Locale } from "@/i18n/config"

export default async function MediaPage({ params }: { params: { lang: Locale } }) {
  const { lang } = params
  const dict = await getDictionary(params.lang as any)

  // Ejemplo de URLs de Vercel Blob (estas son URLs de ejemplo, deberás reemplazarlas con tus propias URLs)
  const videoUrl = "https://v0.blob.com/example-video.mp4" // Reemplazar con tu URL real
  const imageUrl =
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LOGO-OFICIAL-1.2-66Pt2FzUzEXMTxWP7IK3sbzMEh8srR.png" // URL del logo

  // Modificar el return para incluir el SectionDivider al final
  return (
    <div className="pt-32 pb-24 relative overflow-visible">
      {/* Fondo con video de Vimeo */}
      <VimeoBackground videoId="1074464598" fallbackId="1074465089" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold gold-gradient-text mb-6">
            {lang === "es" ? "Multimedia" : lang === "en" ? "Media" : "Mídia"}
          </h1>
          <p className="text-xl text-gold-100 max-w-3xl mx-auto">
            {lang === "es"
              ? "Explora videos y capturas de pantalla de ETEREALCONQUEST."
              : lang === "en"
                ? "Explore videos and screenshots of ETEREALCONQUEST."
                : "Explore vídeos e capturas de tela de ETEREALCONQUEST."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="bg-bunker-800 rounded-lg overflow-hidden border border-gold-900/50">
            <h2 className="text-2xl font-bold text-gold-300 p-4">
              {lang === "es" ? "Video destacado" : lang === "en" ? "Featured Video" : "Vídeo em destaque"}
            </h2>
            <div className="aspect-video">
              <BlobVideo
                src={videoUrl}
                controls={true}
                autoPlay={false}
                poster={imageUrl}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="text-xl font-bold text-gold-300 mb-2">
                {lang === "es" ? "Tráiler oficial" : lang === "en" ? "Official Trailer" : "Trailer oficial"}
              </h3>
              <p className="text-gold-100/80">
                {lang === "es"
                  ? "Mira el tráiler oficial de ETEREALCONQUEST y descubre un mundo de fantasía."
                  : lang === "en"
                    ? "Watch the official ETEREALCONQUEST trailer and discover a fantasy world."
                    : "Assista ao trailer oficial de ETEREALCONQUEST e descubra um mundo de fantasia."}
              </p>
            </div>
          </div>

          <div className="bg-bunker-800 rounded-lg overflow-hidden border border-gold-900/50">
            <h2 className="text-2xl font-bold text-gold-300 p-4">
              {lang === "es" ? "Galería de imágenes" : lang === "en" ? "Image Gallery" : "Galeria de imagens"}
            </h2>
            <div className="grid grid-cols-2 gap-2 p-4">
              <div className="aspect-square relative rounded-md overflow-hidden">
                <BlobImage src={imageUrl} alt="ETEREALCONQUEST" fill className="object-cover" />
              </div>
              <div className="aspect-square relative rounded-md overflow-hidden">
                <BlobImage src={imageUrl} alt="ETEREALCONQUEST" fill className="object-cover" />
              </div>
              <div className="aspect-square relative rounded-md overflow-hidden">
                <BlobImage src={imageUrl} alt="ETEREALCONQUEST" fill className="object-cover" />
              </div>
              <div className="aspect-square relative rounded-md overflow-hidden">
                <BlobImage src={imageUrl} alt="ETEREALCONQUEST" fill className="object-cover" />
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-xl font-bold text-gold-300 mb-2">
                {lang === "es" ? "Capturas de pantalla" : lang === "en" ? "Screenshots" : "Capturas de tela"}
              </h3>
              <p className="text-gold-100/80">
                {lang === "es"
                  ? "Explora las capturas de pantalla de ETEREALCONQUEST y descubre su mundo."
                  : lang === "en"
                    ? "Explore ETEREALCONQUEST screenshots and discover its world."
                    : "Explore as capturas de tela de ETEREALCONQUEST e descubra seu mundo."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Divisor al final de la página - como elemento independiente */}
      <SectionDivider />
    </div>
  )
}
