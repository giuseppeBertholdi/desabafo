import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from "next/navigation";
import PricingClient from "./PricingClient";
import { getUserPlan } from '@/lib/getUserPlan'

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

