import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Configuración más específica para tedious
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        crypto: false,
        stream: false,
        os: false,
        path: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        http2: false,
        util: false,
        assert: false,
        buffer: require.resolve("buffer/"),
      }

      // Agregar plugin para proporcionar Buffer
      const webpack = require("webpack")
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ["buffer", "Buffer"],
        }),
      )
    }
    return config
  },
}

export default nextConfig
