import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import JournalClient from './JournalClient'

export const dynamic = 'force-dynamic'

export default async function Journal() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Buscar nickname do perfil
  let firstName = 'amigo'
  try {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('nickname')
      .eq('user_id', session.user.id)
      .single()

    if (profile?.nickname) {
      firstName = profile.nickname
    } else {
      firstName = session.user.user_metadata?.name?.split(' ')[0] || session.user.email?.split('@')[0] || 'amigo'
    }
  } catch (error) {
    firstName = session.user.user_metadata?.name?.split(' ')[0] || session.user.email?.split('@')[0] || 'amigo'
  }

  return <JournalClient firstName={firstName} />
}

