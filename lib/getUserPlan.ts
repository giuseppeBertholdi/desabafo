import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export type PlanType = 'free' | 'essential' | 'pro'

export interface UserPlan {
  plan: PlanType
  subscriptionId?: string
  status?: string
  currentPeriodEnd?: Date
}

export async function getUserPlan(userId: string): Promise<UserPlan> {
  const supabase = createRouteHandlerClient({ cookies })
  
  try {
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select('plan_type, stripe_subscription_id, status, current_period_end')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing'])
      .maybeSingle() // Usar maybeSingle() para não dar erro se não encontrar

    // Se houver erro (ex: tabela não existe), retornar free
    if (error) {
      console.warn('Erro ao verificar plano:', error.message)
      return { plan: 'free' }
    }

    if (subscription) {
      // Usar plan_type se disponível, senão assumir 'pro' (compatibilidade)
      const planType = subscription.plan_type || 'pro'
      return {
        plan: planType === 'essential' ? 'essential' : 'pro',
        subscriptionId: subscription.stripe_subscription_id,
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end) : undefined
      }
    }
  } catch (error) {
    console.warn('Erro ao carregar plano:', error)
    // Se não encontrar assinatura, retorna free
  }

  return { plan: 'free' }
}

// Helper para verificar se usuário tem acesso a feature
export function hasFeatureAccess(plan: PlanType, feature: 'voice' | 'unlimited_sessions' | 'unlimited_journal' | 'insights'): boolean {
  // Voz apenas para Pro
  if (feature === 'voice') {
    return plan === 'pro'
  }
  
  // Insights e mensagens ilimitadas para Essential e Pro
  if (feature === 'insights' || feature === 'unlimited_sessions') {
    return plan === 'essential' || plan === 'pro'
  }
  
  // Journal ilimitado para Essential e Pro
  if (feature === 'unlimited_journal') {
    return plan === 'essential' || plan === 'pro'
  }
  
  return false
}

