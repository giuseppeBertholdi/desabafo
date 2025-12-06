import dynamic from 'next/dynamic'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Header from '@/components/Header'
import Hero from '@/components/Hero'

// Lazy load componentes pesados para melhorar performance inicial
const Features = dynamic(() => import('@/components/Features'), {
  ssr: true,
})

const Testimonials = dynamic(() => import('@/components/Testimonials'), {
  ssr: true,
})

const Pricing = dynamic(() => import('@/components/Pricing'), {
  ssr: true,
})

const FAQ = dynamic(() => import('@/components/FAQ'), {
  ssr: true,
})

const CTA = dynamic(() => import('@/components/CTA'), {
  ssr: true,
})

const Footer = dynamic(() => import('@/components/Footer'), {
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

