# 🔍 Verificar Plano PRO - Troubleshooting

## Problema
Erro 403: "Modo voz disponível apenas no plano PRO"

## Possíveis Causas

### 1. Tabela `user_subscriptions` não existe
Se você ainda não aplicou a migração do Stripe, a tabela pode não existir.

**Solução**: Aplicar migração do Stripe
```sql
-- No Supabase Dashboard > SQL Editor
-- Execute a migração: supabase_migration_subscriptions.sql
```

### 2. Registro não foi criado corretamente
O script `/admin/grant-pro` pode não ter criado o registro.

**Verificar no Supabase**:
```sql
-- No Supabase Dashboard > SQL Editor
SELECT * FROM user_subscriptions 
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'giuseppe.bertholdi@gmail.com'
);
```

**Resultado esperado**:
- Se retornar vazio: Precisa conceder o plano novamente
- Se retornar com `status = 'active'` ou `'trialing'`: Está correto

### 3. Status incorreto
O registro existe mas com status diferente.

**Corrigir manualmente**:
```sql
-- No Supabase Dashboard > SQL Editor
UPDATE user_subscriptions 
SET status = 'trialing',
    current_period_end = (NOW() + INTERVAL '1 year')
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'giuseppe.bertholdi@gmail.com'
);
```

## 🔧 Solução Rápida

### Opção 1: Conceder Plano PRO Novamente
Acesse: http://localhost:3000/admin/grant-pro

- Email: `giuseppe.bertholdi@gmail.com`
- Plano: `monthly`
- Clique em "Conceder Plano Pro"

### Opção 2: Criar Registro Manualmente no Supabase

```sql
-- No Supabase Dashboard > SQL Editor

-- 1. Primeiro, pegue o ID do usuário
SELECT id, email FROM auth.users WHERE email = 'giuseppe.bertholdi@gmail.com';

-- 2. Depois, insira o registro (substitua USER_ID_AQUI)
INSERT INTO user_subscriptions (
  user_id,
  stripe_subscription_id,
  stripe_customer_id,
  status,
  current_period_start,
  current_period_end,
  cancel_at_period_end
) VALUES (
  'USER_ID_AQUI', -- Substitua pelo ID do passo 1
  'sub_manual_' || gen_random_uuid()::text, -- ID fake para desenvolvimento
  'cus_manual_' || gen_random_uuid()::text, -- Customer ID fake
  'trialing', -- Status em trial
  NOW(), -- Início agora
  NOW() + INTERVAL '1 year', -- Fim em 1 ano
  false -- Não cancelar ao fim do período
)
ON CONFLICT (user_id) 
DO UPDATE SET
  status = 'trialing',
  current_period_end = NOW() + INTERVAL '1 year',
  updated_at = NOW();
```

### Opção 3: Criar Script de Verificação

Crie um arquivo `verificar-plano.ts`:

```typescript
// scripts/verificar-plano.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verificarPlano(email: string) {
  console.log(`🔍 Verificando plano para ${email}...`)
  
  // 1. Buscar usuário
  const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()
  
  if (userError) {
    console.error('❌ Erro ao buscar usuários:', userError)
    return
  }
  
  const user = users.find(u => u.email === email)
  
  if (!user) {
    console.error('❌ Usuário não encontrado')
    return
  }
  
  console.log(`✅ Usuário encontrado: ${user.id}`)
  
  // 2. Verificar assinatura
  const { data: subscription, error: subError } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()
  
  if (subError) {
    console.error('❌ Erro ao verificar assinatura:', subError)
    return
  }
  
  if (!subscription) {
    console.log('⚠️ Nenhuma assinatura encontrada')
    console.log('💡 Execute: /admin/grant-pro para conceder plano PRO')
    return
  }
  
  console.log('✅ Assinatura encontrada:')
  console.log('   - Status:', subscription.status)
  console.log('   - Início:', subscription.current_period_start)
  console.log('   - Fim:', subscription.current_period_end)
  console.log('   - Stripe ID:', subscription.stripe_subscription_id)
  
  const validStatuses = ['active', 'trialing']
  if (validStatuses.includes(subscription.status)) {
    console.log('✅ Plano PRO ATIVO!')
  } else {
    console.log(`⚠️ Status inválido: ${subscription.status}`)
    console.log('💡 Status válidos: active, trialing')
  }
}

const email = process.argv[2] || 'giuseppe.bertholdi@gmail.com'
verificarPlano(email)
```

Execute:
```bash
npx tsx scripts/verificar-plano.ts giuseppe.bertholdi@gmail.com
```

## ✅ Verificar se Funcionou

Após aplicar uma das soluções acima:

1. **Limpar cache do navegador** ou abrir em aba anônima
2. Fazer **logout** e **login** novamente
3. Ir para `/chat?mode=voice`
4. Tentar criar nova sessão

Se ainda der erro:

1. Abrir **Console do navegador** (F12)
2. Ir em **Network**
3. Tentar criar sessão novamente
4. Ver a requisição para `/api/voice/sessions`
5. Ver a resposta (deve retornar detalhes do erro)

## 🐛 Debug Adicional

### Ver Logs no Console
```typescript
// Adicione temporariamente em app/api/voice/sessions/route.ts
console.log('User ID:', session.user.id)
console.log('Verificando plano...')
const plan = await checkUserPlan(session.user.id)
console.log('Plano detectado:', plan)
```

### Verificar Diretamente no Frontend
```javascript
// Console do navegador em /chat?mode=voice
const { data: { session } } = await supabase.auth.getSession()
console.log('User ID:', session.user.id)

const { data: sub } = await supabase
  .from('user_subscriptions')
  .select('*')
  .eq('user_id', session.user.id)
  .maybeSingle()
  
console.log('Subscription:', sub)
```

## 📞 Ainda com Problema?

Se nada funcionar:

1. Verificar se o Supabase está acessível
2. Verificar variáveis de ambiente
3. Ver se há erros no log do servidor
4. Verificar se RLS está permitindo acesso

---

**Última atualização**: Dezembro 2025

