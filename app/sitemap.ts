import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://eterealconquest.com'
  const languages = ['es', 'en', 'pt']
  
  // Páginas principales
  const mainPages = [
    '',
    '/features',
    '/noticias',
    '/download',
    '/ranking',
    '/classes',
    '/informacion',
    '/registro',
    '/inicio-sesion',
    '/panel',
    '/descargas'
  ]

  // Generar URLs para cada idioma
  const urls: MetadataRoute.Sitemap = []

  languages.forEach(lang => {
    mainPages.forEach(page => {
      urls.push({
        url: `${baseUrl}/${lang}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'daily' : page === '/noticias' ? 'daily' : 'weekly',
        priority: page === '' ? 1 : page === '/ranking' ? 0.9 : 0.8,
      })
    })
  })

  // Agregar páginas específicas adicionales
  urls.push(
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    }
  )

  return urls
} 