# Variáveis de Ambiente do Stripe

Adicione estas variáveis ao seu arquivo `.env.local`:

```env
# Stripe
# Obtenha suas chaves em: https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY=sk_test_SUA_CHAVE_SECRETA_AQUI
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_SUA_CHAVE_PUBLICA_AQUI

# Webhook Secret
# Obtenha em: https://dashboard.stripe.com/test/webhooks
STRIPE_WEBHOOK_SECRET=whsec_SEU_WEBHOOK_SECRET_AQUI

# Price IDs
# Crie os produtos no Stripe Dashboard e copie os Price IDs
STRIPE_PRICE_ID_MONTHLY=price_SEU_PRICE_ID_MENSAL_AQUI
STRIPE_PRICE_ID_YEARLY=price_SEU_PRICE_ID_ANUAL_AQUI

# URL da aplicação
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Em produção: NEXT_PUBLIC_APP_URL=https://seu-dominio.com

# Supabase Service Role Key (necessário para webhooks)
# Obtenha em: Supabase Dashboard > Settings > API > service_role key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui
```

## Próximos Passos

1. **Criar produtos no Stripe Dashboard:**
   - Acesse https://dashboard.stripe.com/test/products
   - Crie produto "Desabafo Pro - Mensal" (R$ 29,90/mês)
   - Crie produto "Desabafo Pro - Anual" (R$ 276/ano)
   - Copie os Price IDs e adicione nas variáveis acima

2. **Configurar Webhook:**
   - Acesse https://dashboard.stripe.com/test/webhooks
   - Adicione endpoint: `https://seu-dominio.com/api/stripe/webhook`
   - Selecione eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copie o Signing Secret e adicione em `STRIPE_WEBHOOK_SECRET`

3. **Criar tabela no Supabase:**
   - Execute o SQL do arquivo `STRIPE_SETUP.md`

