# Configuração do Stripe

## 1. Variáveis de Ambiente

Adicione ao arquivo `.env.local`:

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

NEXT_PUBLIC_APP_URL=http://localhost:3000 # Ou sua URL de produção

# Supabase Service Role (necessário para webhooks bypassarem RLS)
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui
```

## 2. Criar Produtos no Stripe Dashboard

1. Acesse [dashboard.stripe.com](https://dashboard.stripe.com)
2. Vá em **Products** > **Add product**
3. Crie dois produtos:

### Produto Mensal:
- **Name**: Desabafo Pro - Mensal
- **Price**: R$ 29,90
- **Billing period**: Monthly
- **Price ID**: Copie o Price ID gerado e adicione em `STRIPE_PRICE_ID_MONTHLY`

### Produto Anual:
- **Name**: Desabafo Pro - Anual
- **Price**: R$ 276,00 (R$ 23/mês)
- **Billing period**: Yearly
- **Price ID**: Copie o Price ID gerado e adicione em `STRIPE_PRICE_ID_YEARLY`

## 3. Configurar Webhook

1. No Stripe Dashboard, vá em **Developers** > **Webhooks**
2. Clique em **Add endpoint**
3. Configure:
   - **Endpoint URL**: `https://seu-dominio.com/api/stripe/webhook` (ou use Stripe CLI para desenvolvimento)
   - **Events to send**: Selecione:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
4. Copie o **Signing secret** (começa com `whsec_`) e adicione em `STRIPE_WEBHOOK_SECRET`

### Para desenvolvimento local (usando Stripe CLI):

```bash
# Instalar Stripe CLI
# macOS: brew install stripe/stripe-cli/stripe
# Linux: https://stripe.com/docs/stripe-cli#install

# Login
stripe login

# Forward webhooks para localhost
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

O comando acima mostrará um webhook secret que você pode usar no `.env.local` para desenvolvimento local.

## 4. Obter Service Role Key do Supabase

1. No Supabase Dashboard, vá em **Settings** > **API**
2. Copie a **service_role** key (NÃO a anon key!)
3. Adicione no `.env.local` como `SUPABASE_SERVICE_ROLE_KEY`
4. ⚠️ **IMPORTANTE**: Nunca exponha esta chave no cliente! Ela bypassa todas as políticas de segurança.

## 5. Criar Tabela no Supabase

Execute o SQL abaixo no Supabase SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription_id ON user_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);

-- RLS
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions"
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
  ON user_subscriptions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política para permitir inserção via Service Role (webhooks)
-- Nota: Service Role bypassa RLS automaticamente, mas esta política garante compatibilidade
CREATE POLICY "Service role can insert subscriptions"
  ON user_subscriptions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update subscriptions"
  ON user_subscriptions FOR UPDATE
  USING (true)
  WITH CHECK (true);
```

## 6. Limitações Implementadas

### Plano Gratuito:
- ❌ Modo voz desabilitado
- ✅ Máximo 100 respostas da IA por mês
- ✅ Chat por texto
- ✅ Insights básicos
- ✅ Histórico de conversas
- ✅ Journal básico

### Plano Pro:
- ✅ Modo voz habilitado (privado, não salvo)
- ✅ Conversas ilimitadas
- ✅ Entradas de diário ilimitadas
- ✅ Todos os recursos disponíveis
- ✅ Insights personalizados
- ✅ Análise de sentimentos

## 7. Testar

1. Use cartões de teste do Stripe:
   - Sucesso: `4242 4242 4242 4242`
   - Qualquer data futura
   - Qualquer CVC
   - Qualquer CEP

2. Fluxo completo:
   - Login → Onboarding → Pricing → Checkout → Success → Home

## Notas Importantes

- O webhook precisa estar configurado corretamente para atualizar assinaturas
- Em produção, use as chaves de produção do Stripe
- Configure o webhook URL para sua URL de produção
- Teste o fluxo completo antes de ir para produção

