/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Otimizações de performance
  compress: true,
  poweredByHeader: false,
  // Otimização de imagens
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Otimização de bundle
  experimental: {
    // optimizeCss disabled due to critters dependency issue
  },
  // Desabilitar erros de ESLint durante build (apenas warnings)
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Desabilitar erros de TypeScript durante build (apenas warnings)
  typescript: {
    ignoreBuildErrors: false,
  },
  // Headers de segurança e performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig

