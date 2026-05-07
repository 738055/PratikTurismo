/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'aypnzthhjekaodearxdb.supabase.co' },
    ],
  },
  serverExternalPackages: ['@react-pdf/renderer'],
  transpilePackages: ['@supabase/auth-helpers-nextjs'],

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
        ],
      },
    ];
  },

  // SEO 301 Redirects
  async redirects() {
    return [
      // 1. TOP PRODUTOS DO ANALYTICS ANTIGO (preservar Link Juice)
      // ⚠️  Confira se as slugs de destino existem no banco antes de subir em produção
      { source: '/produto/city-tour-argentina-puerto-iguazu', destination: '/tours/city-tour-argentina', permanent: true },
      { source: '/produto/cafe-da-manha-no-hotel-das-cataratas-belmond', destination: '/tours/cafe-da-manha-belmond', permanent: true },
      { source: '/produto/almoco-cataratas-argentinas-el-fortin-buffet-parrilla', destination: '/tours/almoco-cataratas-argentinas', permanent: true },

      // 2. MAPEAMENTOS ESPECÍFICOS EXISTENTES
      { source: '/produto/transfer-para-compras-no-paraguai', destination: '/tours/compras-no-paraguai-a-noite-tour-privativo', permanent: true },
      { source: '/produto/voo-de-helicoptero-sobre-as-cataratas', destination: '/tours/ingresso--passeio-de-helicoptero', permanent: true },
      { source: '/produto/cataratas-do-iguacu-argentino', destination: '/tours/cataratas-argentinas-passeio-completo', permanent: true },
      { source: '/produto/cataratas-do-iguacu-brasil', destination: '/tours/cataratas-brasileiras-passeio-completo', permanent: true },
      { source: '/produto/combo-cataratas-brasil', destination: '/tours/cataratas-brasil-argentina-no-mesmo-dia-experiencia-completa', permanent: true },

      // 3. REGRAS GERAIS
      { source: '/shop', destination: '/tours/search', permanent: true },
      { source: '/shop/page/:page*', destination: '/tours/search', permanent: true },
      { source: '/ingressos', destination: '/tickets/search', permanent: true },
      { source: '/produto-tag/:slug*', destination: '/categories', permanent: true },

      // 4. FALLBACK DINÂMICO (deve ficar por último)
      { source: '/produto/:slug', destination: '/tours/:slug', permanent: true },
    ];
  },
};

export default nextConfig;
