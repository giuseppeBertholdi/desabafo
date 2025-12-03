/**
 * Rate Limiting Utility
 * 
 * Suporta:
 * - Rate limiting por usuário autenticado
 * - Rate limiting por IP
 * - Diferentes limites para planos free vs pro
 * - Redis (produção) ou in-memory (desenvolvimento)
 */

import { Redis } from '@upstash/redis'

// Configuração de limites por plano
export const RATE_LIMITS = {
  free: {
    chat: { requests: 10, window: 60 * 60 * 1000 }, // 10 por hora
    insights: { requests: 5, window: 60 * 60 * 1000 }, // 5 por hora
    journal: { requests: 10, window: 60 * 60 * 1000 }, // 10 por hora
    sessions: { requests: 10, window: 24 * 60 * 60 * 1000 }, // 10 por dia
    general: { requests: 100, window: 60 * 1000 }, // 100 por minuto
  },
  pro: {
    chat: { requests: 1000, window: 60 * 60 * 1000 }, // 1000 por hora
    insights: { requests: 100, window: 60 * 60 * 1000 }, // 100 por hora
    journal: { requests: 1000, window: 60 * 60 * 1000 }, // 1000 por hora
    sessions: { requests: 1000, window: 24 * 60 * 60 * 1000 }, // 1000 por dia
    general: { requests: 1000, window: 60 * 1000 }, // 1000 por minuto
  },
  unauthenticated: {
    general: { requests: 20, window: 60 * 1000 }, // 20 por minuto por IP
  },
} as const

export type RateLimitType = keyof typeof RATE_LIMITS.free

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
  retryAfter?: number
}

// In-memory store para desenvolvimento (fallback se Redis não estiver configurado)
class InMemoryStore {
  private store: Map<string, { count: number; reset: number }> = new Map()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Limpar entradas expiradas a cada 5 minutos
    this.cleanupInterval = setInterval(() => {
      const now = Date.now()
      for (const [key, value] of this.store.entries()) {
        if (value.reset < now) {
          this.store.delete(key)
        }
      }
    }, 5 * 60 * 1000)
  }

  async get(key: string): Promise<number | null> {
    const entry = this.store.get(key)
    if (!entry) return null
    
    if (entry.reset < Date.now()) {
      this.store.delete(key)
      return null
    }
    
    return entry.count
  }

  async set(key: string, count: number, ttl: number): Promise<void> {
    const reset = Date.now() + ttl
    this.store.set(key, { count, reset })
  }

  async increment(key: string, ttl: number): Promise<number> {
    const current = await this.get(key)
    const newCount = (current || 0) + 1
    await this.set(key, newCount, ttl)
    return newCount
  }

  destroy() {
    clearInterval(this.cleanupInterval)
    this.store.clear()
  }
}

// Interface para store (Redis ou in-memory)
interface Store {
  get(key: string): Promise<number | null>
  set(key: string, value: number, ttl: number): Promise<void>
  increment(key: string, ttl: number): Promise<number>
}

// Wrapper para Redis do Upstash
class RedisStore implements Store {
  private redis: Redis

  constructor() {
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  }

  async get(key: string): Promise<number | null> {
    try {
      const value = await this.redis.get<number>(key)
      return value ?? null
    } catch (error) {
      console.error('Erro ao obter do Redis:', error)
      return null
    }
  }

  async set(key: string, value: number, ttl: number): Promise<void> {
    try {
      const ttlSeconds = Math.ceil(ttl / 1000)
      await this.redis.set(key, value, { ex: ttlSeconds })
    } catch (error) {
      console.error('Erro ao definir no Redis:', error)
    }
  }

  async increment(key: string, ttl: number): Promise<number> {
    try {
      const count = await this.redis.incr(key)
      // Definir TTL na primeira vez
      if (count === 1) {
        const ttlSeconds = Math.ceil(ttl / 1000)
        await this.redis.expire(key, ttlSeconds)
      }
      return count
    } catch (error) {
      console.error('Erro ao incrementar no Redis:', error)
      // Retornar 1 em caso de erro para não bloquear requisições
      return 1
    }
  }
}

// Singleton para in-memory store
let inMemoryStore: InMemoryStore | null = null

function getStore(): Store {
  // Tentar usar Redis se as variáveis de ambiente estiverem configuradas
  if (
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    return new RedisStore()
  }

  // Fallback para in-memory store
  if (!inMemoryStore) {
    inMemoryStore = new InMemoryStore()
  }
  return inMemoryStore
}

/**
 * Verifica rate limit para um identificador (userId ou IP)
 */
export async function checkRateLimit(
  identifier: string,
  type: RateLimitType,
  plan: 'free' | 'pro' | 'unauthenticated' = 'unauthenticated'
): Promise<RateLimitResult> {
  const limits = RATE_LIMITS[plan][type] || RATE_LIMITS.unauthenticated.general
  const key = `ratelimit:${plan}:${type}:${identifier}`
  const store = getStore()

  try {
    // Incrementar contador
    const count = await store.increment(key, limits.window)

    const remaining = Math.max(0, limits.requests - count)
    const reset = Date.now() + limits.window
    const success = count <= limits.requests

    return {
      success,
      limit: limits.requests,
      remaining,
      reset,
      retryAfter: success ? undefined : Math.ceil((reset - Date.now()) / 1000),
    }
  } catch (error) {
    console.error('Erro ao verificar rate limit:', error)
    // Em caso de erro, permitir a requisição (fail open)
    return {
      success: true,
      limit: limits.requests,
      remaining: limits.requests - 1,
      reset: Date.now() + limits.window,
    }
  }
}

/**
 * Obtém informações de rate limit sem incrementar
 */
export async function getRateLimitInfo(
  identifier: string,
  type: RateLimitType,
  plan: 'free' | 'pro' | 'unauthenticated' = 'unauthenticated'
): Promise<Omit<RateLimitResult, 'retryAfter'>> {
  const limits = RATE_LIMITS[plan][type] || RATE_LIMITS.unauthenticated.general
  const key = `ratelimit:${plan}:${type}:${identifier}`
  const store = getStore()

  try {
    const count = (await store.get(key)) || 0
    const remaining = Math.max(0, limits.requests - count)
    const reset = Date.now() + limits.window

    return {
      success: count <= limits.requests,
      limit: limits.requests,
      remaining,
      reset,
    }
  } catch (error) {
    console.error('Erro ao obter info de rate limit:', error)
    return {
      success: true,
      limit: limits.requests,
      remaining: limits.requests,
      reset: Date.now() + limits.window,
    }
  }
}

/**
 * Helper para obter IP do request
 */
export function getClientIP(request: Request): string {
  // Tentar obter IP de headers comuns de proxy
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  // Fallback (não funciona em serverless, mas é melhor que nada)
  return 'unknown'
}

