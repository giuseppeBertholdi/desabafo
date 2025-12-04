import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from "next/navigation";
import HomeClient from "./HomeClient";

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Se não houver sessão, redireciona para login
  if (!session) {
    redirect('/login')
  }

  // Verificar se completou o onboarding
  let profile = null
  try {
    const { data } = await supabase
      .from('user_profiles')
      .select('onboarding_completed, nickname, preferred_name')
      .eq('user_id', session.user.id)
      .single()
    profile = data
  } catch (error) {
    // Se a tabela não existir ou houver erro, redirecionar para onboarding
    redirect('/onboarding')
  }

  // Se não completou o onboarding, redirecionar
  if (!profile || !profile.onboarding_completed) {
    redirect('/onboarding')
  }

  const user = session.user
  // Usar nickname do perfil se disponível, senão usar metadata ou email
  const firstName = profile.nickname || 
                    user.user_metadata?.name?.split(' ')[0] || 
                    user.email?.split('@')[0] || 
                    'amigo'

  return <HomeClient firstName={firstName} userEmail={user.email || ''} />
}

