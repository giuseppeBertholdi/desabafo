import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from "next/navigation";
import ChatClient from "./ChatClient";

export const dynamic = 'force-dynamic'

export default async function ChatPage({ searchParams }: { searchParams: { tema?: string; mode?: string } }) {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Se não houver sessão, redireciona para login
  if (!session) {
    redirect('/login')
  }

  // Buscar nickname do perfil
  let nickname = null
  try {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('nickname')
      .eq('user_id', session.user.id)
      .single()
    nickname = profile?.nickname
  } catch (error) {
    // Se não encontrar, usar fallback
  }

  const user = session.user
  const firstName = nickname || 
                    user.user_metadata?.name?.split(' ')[0] || 
                    user.email?.split('@')[0] || 
                    'amigo'

  return <ChatClient firstName={firstName} tema={searchParams.tema} voiceMode={searchParams.mode === 'voice'} />
}

