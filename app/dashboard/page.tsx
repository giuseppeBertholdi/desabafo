import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Se não houver sessão, redireciona para login
  if (!session) {
    redirect('/login')
  }

  const user = session.user
  const firstName = user.user_metadata?.name?.split(' ')[0] || user.email?.split('@')[0] || 'amigo'

  return <DashboardClient firstName={firstName} userEmail={user.email || ''} />
}

