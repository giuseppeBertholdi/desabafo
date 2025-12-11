import dynamicImport from 'next/dynamic'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Header from '@/components/Header'
import Hero from '@/components/Hero'

export const metadata: Metadata = {
  title: 'desabafo.io - sua IA terapeuta | terapia online e suporte emocional',
  description: 'converse humanamente com uma IA terapeuta. sempre disponível pra ouvir e ajudar. terapia online, suporte emocional, saúde mental, ansiedade, depressão. comece grátis.',
  keywords: [
    'IA terapeuta',
    'terapia online',
    'suporte emocional',
    'saúde mental',
    'ansiedade',
    'depressão',
    'desabafo',
    'chat terapeuta',
    'psicologia online',
    'bem-estar mental',
    'autocuidado',
    'terapia virtual',
    'IA conversacional',
    'assistente emocional',
    'terapia gratuita',
    'apoio emocional'
  ],
  openGraph: {
    title: 'desabafo.io - sua IA terapeuta | terapia online e suporte emocional',
    description: 'converse humanamente com uma IA terapeuta. sempre disponível pra ouvir e ajudar. comece grátis.',
    url: 'https://desabafo.io',
    siteName: 'desabafo.io',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'desabafo.io - sua IA terapeuta',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'desabafo.io - sua IA terapeuta',
    description: 'converse humanamente com uma IA terapeuta. sempre disponível pra ouvir e ajudar. comece grátis.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://desabafo.io',
  },
}

// Lazy load componentes pesados para melhorar performance inicial
const Features = dynamicImport(() => import('@/components/Features'), {
  ssr: true,
})

const Testimonials = dynamicImport(() => import('@/components/Testimonials'), {
  ssr: true,
})

const Pricing = dynamicImport(() => import('@/components/Pricing'), {
  ssr: true,
})

const FAQ = dynamicImport(() => import('@/components/FAQ'), {
  ssr: true,
})

const CTA = dynamicImport(() => import('@/components/CTA'), {
  ssr: true,
})

const Footer = dynamicImport(() => import('@/components/Footer'), {
  ssr: true,
})

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = createServerComponentClient({ cookies })
  
  // Verificar se o usuário está logado
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Se houver sessão ativa, redirecionar para /home
  if (session) {
    redirect('/home')
  }

  // Se não houver sessão, mostrar a landing page
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'desabafo.io',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'BRL',
    },
    description: 'converse humanamente com uma IA terapeuta. sempre disponível pra ouvir e ajudar.',
    url: 'https://desabafo.io',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
    },
    featureList: [
      'Chat com IA terapeuta',
      'Suporte emocional 24/7',
      'Insights sobre sentimentos',
      'Diário pessoal',
      'Modo voz (Pro)',
      'Integração com Spotify',
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="min-h-screen bg-pink-50 dark:bg-gray-900 transition-colors">
        <Header />
        <Hero />
        <Features />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTA />
        <Footer />
      </main>
    </>
  )
}

