'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useState, useEffect } from 'react'

export type PlanType = 'free' | 'pro'

export interface UserPlan {
  plan: PlanType
  subscriptionId?: string
  status?: string
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
        .select('*')
        .eq('user_id', session.user.id)
        .in('status', ['active', 'trialing'])
        .single()

      if (subscription && !error) {
        setPlan('pro')
      } else {
        setPlan('free')
      }
    } catch (error) {
      setPlan('free')
    } finally {
      setIsLoading(false)
    }
  }

  return { plan, isLoading, refreshPlan: loadPlan }
}

