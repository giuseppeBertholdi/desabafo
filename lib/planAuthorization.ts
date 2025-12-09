/**
 * Plan Authorization Middleware
 * 
 * Verifica se o usuário tem o plano necessário para acessar uma feature
 * e aplica limitações baseadas no plano
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export type PlanType = 'free' | 'essential' | 'pro'

export interface PlanValidationResult {
  isAuthorized: boolean
  plan: PlanType
  message?: string
  remainingUsage?: number
  limit?: number
}

/**
 * Verificar plano do usuário
 */
export async function checkUserPlan(userId: string): Promise<PlanType> {
  const supabase = createRouteHandlerClient({ cookies })
  
  try {
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select('plan_type, status')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing'])
      .maybeSingle() // Usar maybeSingle() em vez de single() para não dar erro se não encontrar

    // Se houver erro (ex: tabela não existe), retornar free
    if (error) {
      console.warn('Erro ao verificar plano (tabela pode não existir):', error.message)
      return 'free'
    }

    if (!subscription) {
      return 'free'
    }

    // Usar plan_type se disponível, senão assumir 'pro' (compatibilidade)
    const planType = subscription.plan_type || 'pro'
    return planType === 'essential' ? 'essential' : 'pro'
  } catch (error) {
    console.warn('Erro ao verificar plano:', error)
    return 'free'
  }
}

/**
 * Middleware para verificar acesso a features PRO
 */
export async function requireProPlan(userId: string, feature: string): Promise<PlanValidationResult> {
  const plan = await checkUserPlan(userId)
  
  if (plan === 'pro') {
    return {
      isAuthorized: true,
      plan,
    }
  }

  return {
    isAuthorized: false,
    plan,
    message: `${feature} disponível apenas no plano PRO`
  }
}

/**
 * Verificar limite de uso mensal (para plano FREE)
 */
export async function checkMonthlyLimit(
  userId: string,
  limitType: 'chat_messages' | 'journal_entries' | 'insights_generated'
): Promise<PlanValidationResult> {
  const plan = await checkUserPlan(userId)
  
  // Plano Essential e Pro não têm limites de mensagens/insights
  if (plan === 'essential' || plan === 'pro') {
    if (limitType === 'chat_messages' || limitType === 'insights_generated') {
      return {
        isAuthorized: true,
        plan,
      }
    }
  }

  // Plano FREE tem limites
  const limits = {
    chat_messages: 120, // 120 mensagens/mês (apenas free)
    journal_entries: 10, // 10 entradas/mês (apenas free)
    insights_generated: 3, // 3 insights/mês (apenas free)
  }

  // Essential e Pro não têm limites de mensagens ou insights
  if (plan === 'essential' || plan === 'pro') {
    if (limitType === 'chat_messages' || limitType === 'insights_generated') {
      return {
        isAuthorized: true,
        plan,
      }
    }
  }

  const limit = limits[limitType]
  const supabase = createRouteHandlerClient({ cookies })
  
  try {
    // Calcular início do mês atual e formato "YYYY-MM"
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    
    // Contar uso no mês atual baseado no tipo
    let count = 0
    
    if (limitType === 'chat_messages') {
      // Usar a nova tabela message_usage para rastreamento preciso
      const { data: usageData } = await supabase
        .from('message_usage')
        .select('messages_sent')
        .eq('user_id', userId)
        .eq('month_year', monthYear)
        .single()
      
      count = usageData?.messages_sent || 0
    } else if (limitType === 'journal_entries') {
      const { count: entryCount } = await supabase
        .from('journal_entries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', startOfMonth.toISOString())
      
      count = entryCount || 0
    } else if (limitType === 'insights_generated') {
      const { count: insightCount } = await supabase
        .from('chat_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .not('insights', 'is', null)
        .gte('created_at', startOfMonth.toISOString())
      
      count = insightCount || 0
    }

    const remaining = Math.max(0, limit - count)
    
    return {
      isAuthorized: count < limit,
      plan,
      message: count >= limit ? `Você atingiu o limite de ${limit} ${limitType.replace('_', ' ')} do plano gratuito este mês` : undefined,
      remainingUsage: remaining,
      limit,
    }
  } catch (error) {
    console.error('Erro ao verificar limite:', error)
    // Em caso de erro, negar acesso por segurança
    return {
      isAuthorized: false,
      plan,
      message: 'Erro ao verificar limite de uso',
    }
  }
}

/**
 * Sanitizar entrada de texto (prevenir XSS e injeções)
 */
export function sanitizeInput(input: string, maxLength: number = 10000): string {
  if (!input || typeof input !== 'string') return ''
  
  // Remover tags HTML
  let sanitized = input.replace(/<[^>]*>/g, '')
  
  // Remover scripts e eventos
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
  sanitized = sanitized.replace(/javascript:/gi, '')
  
  // Limitar tamanho
  sanitized = sanitized.substring(0, maxLength)
  
  // Trim
  sanitized = sanitized.trim()
  
  return sanitized
}

/**
 * Validar idade (proteção para menores)
 */
export function validateAge(birthDate: Date | string): { isValid: boolean; age: number; message?: string } {
  try {
    const birth = new Date(birthDate)
    const today = new Date()
    
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }

    // Mínimo 13 anos (COPPA compliance)
    if (age < 13) {
      return {
        isValid: false,
        age,
        message: 'Você precisa ter pelo menos 13 anos para usar o Desabafo'
      }
    }

    // Aviso para menores de 18
    if (age < 18) {
      return {
        isValid: true,
        age,
        message: 'Como você é menor de 18 anos, recomendamos usar o app com supervisão de um responsável'
      }
    }

    return { isValid: true, age }
  } catch (error) {
    return {
      isValid: false,
      age: 0,
      message: 'Data de nascimento inválida'
    }
  }
}

/**
 * Helper para criar resposta de não autorizado
 */
export function unauthorizedResponse(message: string, plan?: PlanType) {
  return NextResponse.json(
    {
      error: message,
      plan,
      upgradeUrl: '/pricing'
    },
    { status: 403 }
  )
}

/**
 * Helper para criar resposta de limite excedido
 */
export function limitExceededResponse(result: PlanValidationResult) {
  return NextResponse.json(
    {
      error: result.message,
      plan: result.plan,
      limit: result.limit,
      remaining: result.remainingUsage,
      upgradeUrl: '/pricing'
    },
    { status: 429 }
  )
}

