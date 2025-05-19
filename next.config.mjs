/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Desactivar optimizaciones que podrían causar problemas
  reactStrictMode: false,
  // Asegurarse de que las rutas de admin funcionen correctamente
  async rewrites() {
    return [
      {
        source: '/admin/:path*',
        destination: '/admin/:path*',
      },
    ]
  },
  // Permitir imágenes de cualquier dominio
  images: {
    domains: ['localhost', 'v0.blob.com', 'hebbkx1anhila5yf.public.blob.vercel-storage.com'],
  },
}

export default nextConfig
