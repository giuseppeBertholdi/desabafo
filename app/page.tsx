import dynamicImport from 'next/dynamic'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Header from '@/components/Header'
import Hero from '@/components/Hero'

// Lazy load componentes pesados para melhorar performance inicial
const Features = dynamicImport(() => import('@/components/Features'), {
  loading: () => <div className="h-96" />,
  ssr: true,
})

const Testimonials = dynamicImport(() => import('@/components/Testimonials'), {
  loading: () => <div className="h-96" />,
  ssr: true,
})

const Pricing = dynamicImport(() => import('@/components/Pricing'), {
  loading: () => <div className="h-96" />,
  ssr: true,
})

const FAQ = dynamicImport(() => import('@/components/FAQ'), {
  loading: () => <div className="h-96" />,
  ssr: true,
})

const CTA = dynamicImport(() => import('@/components/CTA'), {
  loading: () => <div className="h-96" />,
  ssr: true,
})

const Footer = dynamicImport(() => import('@/components/Footer'), {
  ssr: true,
})

export const dynamic = 'force-dynamic'

export default async function Home() {
  // Verificar se usuário está logado e redirecionar para /home
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  
  if (session) {
    redirect('/home')
  }
  return (
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
  )
}

