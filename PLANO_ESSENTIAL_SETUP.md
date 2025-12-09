# Configuração do Plano Essential

## Resumo das Mudanças

Foi criado um novo plano intermediário chamado **Essential** que oferece:
- ✅ Mensagens ilimitadas
- ✅ Insights ilimitados
- ❌ Sem acesso ao chat de voz (apenas Pro tem voz)

## Estrutura dos Planos

### Free
- 120 mensagens por mês
- Sem insights
- Sem modo de voz

### Essential (NOVO)
- Mensagens ilimitadas
- Insights ilimitados
- Sem modo de voz

### Pro
- Mensagens ilimitadas
- Insights ilimitados
- Chat por voz (privado)

## Configuração no Stripe

### 1. Criar Products e Prices no Stripe

Você precisa criar 4 novos Price IDs no Stripe:

1. **Essential Monthly** - R$ 19,90/mês
2. **Essential Yearly** - R$ 15,00/mês (cobrado anualmente)
3. **Pro Monthly** - R$ 29,90/mês (já existe)
4. **Pro Yearly** - R$ 23,00/mês (já existe)

### 2. Adicionar Variáveis de Ambiente

Adicione as seguintes variáveis de ambiente no Netlify (ou seu provedor):

```env
# Essential Plan
STRIPE_PRICE_ID_ESSENTIAL_MONTHLY=price_xxxxx
STRIPE_PRICE_ID_ESSENTIAL_YEARLY=price_xxxxx

# Pro Plan (já existentes)
STRIPE_PRICE_ID_MONTHLY=price_xxxxx
STRIPE_PRICE_ID_YEARLY=price_xxxxx
```

### 3. Executar Migração SQL

Execute o arquivo `supabase_migration_add_plan_type.sql` no Supabase SQL Editor para adicionar o campo `plan_type` na tabela `user_subscriptions`.

## Arquivos Modificados

1. **`supabase_migration_add_plan_type.sql`** - Nova migração para adicionar campo `plan_type`
2. **`lib/getUserPlanClient.ts`** - Atualizado para suportar 3 planos
3. **`lib/getUserPlan.ts`** - Atualizado para suportar 3 planos
4. **`lib/planAuthorization.ts`** - Lógica de limites atualizada
5. **`lib/stripe.ts`** - Adicionado suporte para Essential price IDs
6. **`components/Pricing.tsx`** - Landing page com 3 planos
7. **`app/pricing/PricingClient.tsx`** - Página de pricing completa com 3 planos
8. **`app/api/stripe/checkout/route.ts`** - Suporte para planId
9. **`app/api/stripe/webhook/route.ts`** - Salva plan_type baseado no price_id
10. **`app/home/HomeClient.tsx`** - Voz apenas para Pro
11. **`app/chat/ChatClient.tsx`** - Voz apenas para Pro
12. **`app/insights/InsightsClient.tsx`** - Insights para Essential e Pro
13. **`app/api/insights/summary/route.ts`** - Insights para Essential e Pro

## Verificações de Acesso

- **Voz**: Apenas `pro`
- **Insights**: `essential` e `pro`
- **Mensagens ilimitadas**: `essential` e `pro`
- **Mensagens limitadas**: Apenas `free` (120/mês)

## Próximos Passos

1. Criar os produtos no Stripe Dashboard
2. Adicionar as variáveis de ambiente
3. Executar a migração SQL
4. Testar o fluxo de checkout para ambos os planos
5. Verificar se o webhook está salvando o `plan_type` corretamente

