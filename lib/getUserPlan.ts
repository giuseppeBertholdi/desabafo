import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export type PlanType = 'free' | 'pro'

export interface UserPlan {
  plan: PlanType
  subscriptionId?: string
  status?: string
  currentPeriodEnd?: Date
}

export async function getUserPlan(userId: string): Promise<UserPlan> {
  const supabase = createRouteHandlerClient({ cookies })
  
  try {
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (subscription) {
      return {
        plan: 'pro',
        subscriptionId: subscription.stripe_subscription_id,
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end) : undefined
      }
    }
  } catch (error) {
    // Se não encontrar assinatura, retorna free
  }

  return { plan: 'free' }
}

// Helper para verificar se usuário tem acesso a feature
export function hasFeatureAccess(plan: PlanType, feature: 'voice' | 'unlimited_sessions' | 'unlimited_journal'): boolean {
  if (plan === 'pro') return true
  
  // Plano gratuito tem limitações
  return false // Todas as features premium requerem plano pro
}

