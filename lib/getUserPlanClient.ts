'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useState, useEffect } from 'react'

export type PlanType = 'free' | 'essential' | 'pro'

export interface UserPlan {
  plan: PlanType
  subscriptionId?: string
  status?: string
  planType?: 'essential' | 'pro' // Tipo específico da assinatura (se houver)
}

export function useUserPlan() {
  const [plan, setPlan] = useState<PlanType>('free')
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadPlan()
  }, [])

  const loadPlan = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setPlan('free')
        setIsLoading(false)
        return
      }

      const { data: subscription, error } = await supabase
        .from('user_subscriptions')
        .select('plan_type, status')
        .eq('user_id', session.user.id)
        .in('status', ['active', 'trialing'])
        .maybeSingle() // Usar maybeSingle() para não dar erro se não encontrar

      // Se houver erro (ex: tabela não existe), assumir plano free
      if (error) {
        console.warn('Erro ao verificar plano:', error.message)
        setPlan('free')
      } else if (subscription) {
        // Usar plan_type se disponível, senão assumir 'pro' (compatibilidade)
        const planType = subscription.plan_type || 'pro'
        setPlan(planType === 'essential' ? 'essential' : 'pro')
      } else {
        setPlan('free')
      }
    } catch (error) {
      console.warn('Erro ao carregar plano:', error)
      setPlan('free')
    } finally {
      setIsLoading(false)
    }
  }

  return { plan, isLoading, refreshPlan: loadPlan }
}

