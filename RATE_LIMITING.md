# Rate Limiting - Documentação

## Visão Geral

O sistema de rate limiting foi implementado para proteger a aplicação contra abuso e controlar custos de API. Ele suporta:

- ✅ Rate limiting por usuário autenticado
- ✅ Rate limiting por IP para usuários não autenticados
- ✅ Diferentes limites para planos free vs pro
- ✅ Redis (produção) ou in-memory (desenvolvimento)
- ✅ Headers de rate limit nas respostas (X-RateLimit-*)

## Configuração

### Desenvolvimento (In-Memory)

Por padrão, o sistema usa um store in-memory que funciona sem configuração adicional. Ideal para desenvolvimento local.

### Produção (Redis - Upstash)

Para produção, configure o Redis do Upstash:

1. **Criar conta no Upstash:**
   - Acesse [upstash.com](https://upstash.com)
   - Crie uma conta gratuita
   - Crie um novo database Redis

2. **Configurar variáveis de ambiente:**
   ```env
   UPSTASH_REDIS_REST_URL=https://seu-redis.upstash.io
   UPSTASH_REDIS_REST_TOKEN=seu-token-aqui
   ```

3. **O sistema detectará automaticamente:**
   - Se as variáveis estiverem configuradas, usa Redis
   - Caso contrário, usa in-memory (fallback)

## Limites Configurados

### Plano Free
- **Chat**: 10 requisições/hora
- **Insights**: 5 requisições/hora
- **Journal**: 10 requisições/hora
- **Sessions**: 10 requisições/dia
- **General**: 100 requisições/minuto

### Plano Pro
- **Chat**: 1000 requisições/hora
- **Insights**: 100 requisições/hora
- **Journal**: 1000 requisições/hora
- **Sessions**: 1000 requisições/dia
- **General**: 1000 requisições/minuto

### Não Autenticado
- **General**: 20 requisições/minuto por IP

## APIs Protegidas

As seguintes APIs têm rate limiting aplicado:

- ✅ `/api/chat` - Tipo: `chat`
- ✅ `/api/insights/summary` - Tipo: `insights`
- ✅ `/api/sessions` (POST/PUT) - Tipo: `sessions`
- ✅ `/api/journal/insights` - Tipo: `journal`

## Headers de Resposta

Todas as respostas incluem headers de rate limit:

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 5
X-RateLimit-Reset: 2024-01-01T12:00:00Z
```

Quando o limite é excedido (429):

```
HTTP/1.1 429 Too Many Requests
Retry-After: 3600
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 2024-01-01T12:00:00Z
```

## Resposta de Erro

Quando o rate limit é excedido, a API retorna:

```json
{
  "error": "Rate limit excedido",
  "message": "Você excedeu o limite de 10 requisições. Tente novamente em 3600 segundos.",
  "retryAfter": 3600
}
```

## Como Usar em Novas APIs

Para aplicar rate limiting em uma nova API route:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit } from '@/lib/rateLimitMiddleware'

async function handleRequest(request: NextRequest) {
  // Sua lógica aqui
  return NextResponse.json({ success: true })
}

export async function POST(request: NextRequest) {
  return withRateLimit(request, handleRequest, {
    type: 'chat', // ou 'insights', 'journal', 'sessions', 'general'
    skipAuth: false, // true para endpoints públicos
  })
}
```

## Ajustando Limites

Para ajustar os limites, edite `lib/rateLimit.ts`:

```typescript
export const RATE_LIMITS = {
  free: {
    chat: { requests: 10, window: 60 * 60 * 1000 }, // 10 por hora
    // ...
  },
  pro: {
    chat: { requests: 1000, window: 60 * 60 * 1000 }, // 1000 por hora
    // ...
  },
}
```

## Monitoramento

Para monitorar o uso de rate limiting:

1. **Logs**: Verifique os logs do servidor para erros de rate limit
2. **Redis**: Use o dashboard do Upstash para ver chaves de rate limit
3. **Analytics**: Considere integrar com ferramentas de analytics para rastrear 429s

## Troubleshooting

### Rate limit não está funcionando

1. Verifique se as variáveis de ambiente estão configuradas
2. Verifique os logs do servidor para erros
3. O sistema usa "fail open" - em caso de erro, permite a requisição

### Limites muito restritivos

1. Ajuste os limites em `lib/rateLimit.ts`
2. Considere aumentar limites para planos pro
3. Monitore métricas de uso real

### Redis não está funcionando

1. Verifique as credenciais do Upstash
2. Verifique a conectividade de rede
3. O sistema automaticamente usa in-memory como fallback

## Segurança

- ✅ Rate limiting previne abuso de API
- ✅ Diferentes limites por plano incentivam upgrades
- ✅ Proteção por IP para usuários não autenticados
- ✅ Headers padrão para integração com ferramentas de monitoramento

## Próximos Passos

- [ ] Adicionar métricas de rate limiting
- [ ] Dashboard de monitoramento
- [ ] Alertas quando limites são excedidos frequentemente
- [ ] Rate limiting adaptativo baseado em uso


