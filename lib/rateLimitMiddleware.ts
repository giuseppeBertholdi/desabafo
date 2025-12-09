/**
 * Rate Limiting Middleware para API Routes
 * 
 * Wrapper para aplicar rate limiting em rotas de API do Next.js
 */

import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIP, RateLimitType } from './rateLimit'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getUserPlan } from './getUserPlan'

interface RateLimitOptions {
  type: RateLimitType
  skipAuth?: boolean // Se true, não requer autenticação
}

/**
 * Aplica rate limiting em uma API route
 * 
 * @param request - Request do Next.js
 * @param handler - Handler da rota
 * @param options - Opções de rate limiting
 * @returns Response com rate limiting aplicado
 */
export async function withRateLimit(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: RateLimitOptions
): Promise<NextResponse> {
  try {
    // Obter identificador (userId ou IP)
    let identifier: string
    let plan: 'free' | 'essential' | 'pro' | 'unauthenticated' = 'unauthenticated'

    if (!options.skipAuth) {
      // Tentar obter usuário autenticado
      try {
        const supabase = createRouteHandlerClient({ cookies })
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user?.id) {
          identifier = session.user.id
          // Obter plano do usuário
          const userPlan = await getUserPlan(session.user.id)
          plan = userPlan.plan
        } else {
          // Não autenticado - usar IP
          identifier = getClientIP(request)
        }
      } catch (error) {
        // Erro ao obter sessão - usar IP
        identifier = getClientIP(request)
      }
    } else {
      // Endpoint público - usar IP
      identifier = getClientIP(request)
    }

    // Verificar rate limit
    const rateLimitResult = await checkRateLimit(identifier, options.type, plan)

    // Adicionar headers de rate limit
    const headers = new Headers()
    headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString())
    headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
    headers.set('X-RateLimit-Reset', new Date(rateLimitResult.reset).toISOString())

    // Se excedeu o limite, retornar erro 429
    if (!rateLimitResult.success) {
      headers.set('Retry-After', rateLimitResult.retryAfter?.toString() || '60')
      
      return NextResponse.json(
        {
          error: 'Rate limit excedido',
          message: `Você excedeu o limite de ${rateLimitResult.limit} requisições. Tente novamente em ${rateLimitResult.retryAfter} segundos.`,
          retryAfter: rateLimitResult.retryAfter,
        },
        {
          status: 429,
          headers,
        }
      )
    }

    // Executar handler
    const response = await handler(request)

    // Adicionar headers de rate limit na resposta
    response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString())
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
    response.headers.set('X-RateLimit-Reset', new Date(rateLimitResult.reset).toISOString())

    return response
  } catch (error) {
    console.error('Erro no rate limiting middleware:', error)
    // Em caso de erro, permitir a requisição (fail open)
    return handler(request)
  }
}

/**
 * Helper para criar um handler com rate limiting
 */
export function createRateLimitedHandler(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: RateLimitOptions
) {
  return async (request: NextRequest) => {
    return withRateLimit(request, handler, options)
  }
}


