import Script from 'next/script'

interface StructuredDataProps {
  type?: 'website' | 'game' | 'organization'
  lang?: string
}

export function StructuredData({ type = 'website', lang = 'es' }: StructuredDataProps) {
  const baseUrl = 'https://eterealconquest.com'
  
  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "ETEREALCONQUEST",
    "alternateName": "ETEREAL CONQUEST",
    "url": baseUrl,
    "description": "El mejor servidor privado de MU Online Season 6 Episode 3",
    "inLanguage": [lang, "es", "en", "pt"],
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "ETEREALCONQUEST",
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo.png`,
        "width": 512,
        "height": 512
      }
    }
  }

  const gameData = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    "name": "ETEREALCONQUEST MU Online",
    "alternateName": "MU Online Season 6 Episode 3",
    "description": "Servidor privado de MU Online con experiencia 9999x, drop 80%, PvP balanceado y eventos automáticos",
    "url": baseUrl,
    "image": `${baseUrl}/og-image.jpg`,
    "genre": ["MMORPG", "Fantasy", "Action"],
    "gamePlatform": "PC",
    "operatingSystem": "Windows",
    "applicationCategory": "Game",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1250",
      "bestRating": "5",
      "worstRating": "1"
    },
    "publisher": {
      "@type": "Organization",
      "name": "ETEREALCONQUEST"
    }
  }

  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "ETEREALCONQUEST",
    "url": baseUrl,
    "logo": `${baseUrl}/logo.png`,
    "description": "Equipo desarrollador del servidor privado ETEREALCONQUEST MU Online",
    "foundingDate": "2024",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": ["Spanish", "English", "Portuguese"]
    },
    "sameAs": [
      "https://discord.gg/2pF7h7uvRU",
      "https://www.facebook.com/eterealconquest",
      "https://www.instagram.com/eterealconquest.mu/"
    ]
  }

  const getStructuredData = () => {
    switch (type) {
      case 'game':
        return gameData
      case 'organization':
        return organizationData
      default:
        return websiteData
    }
  }

  return (
    <Script
      id={`structured-data-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getStructuredData()),
      }}
    />
  )
} 