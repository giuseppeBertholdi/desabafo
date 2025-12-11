import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from "next/navigation";
import type { Metadata } from 'next'
import PricingClient from "./PricingClient";
import { getUserPlan } from '@/lib/getUserPlan'

export const metadata: Metadata = {
  title: 'Planos e Preços | desabafo.io',
  description: 'escolha o plano ideal para você. grátis, essential ou pro. terapia online com IA, suporte emocional 24/7, insights, diário e muito mais.',
  keywords: [
    'planos desabafo.io',
    'preços terapia online',
    'terapia gratuita',
    'plano essential',
    'plano pro',
    'assinatura terapia IA',
    'preços desabafo',
  ],
  openGraph: {
    title: 'Planos e Preços | desabafo.io',
    description: 'escolha o plano ideal para você. grátis, essential ou pro. terapia online com IA.',
    url: 'https://desabafo.io/pricing',
  },
  alternates: {
    canonical: 'https://desabafo.io/pricing',
  },
}

export const dynamic = 'force-dynamic'

export default async function PricingPage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Verificar plano do usuário
  const userPlan = await getUserPlan(session.user.id)

  return <PricingClient userPlan={userPlan.plan} />
}

