import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import OnboardingClient from './OnboardingClient'

export const dynamic = 'force-dynamic'

export default async function Onboarding() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Se não houver sessão, redireciona para login
  if (!session) {
    redirect('/login')
  }

  // Verificar se já completou o onboarding
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('onboarding_completed')
    .eq('user_id', session.user.id)
    .single()

  if (profile?.onboarding_completed) {
    redirect('/home')
  }

  return <OnboardingClient />
}

