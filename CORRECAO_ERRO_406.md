# 🔧 Correção do Erro 406 - user_subscriptions

## ❌ Problema

```
Failed to load resource: the server responded with a status of 406
lphpiaqjzcociywzctrn.supabase.co/rest/v1/user_subscriptions?...
```

**Causa:** A tabela `user_subscriptions` não existe no Supabase.

---

## ✅ Solução Rápida

### Passo 1: Criar a Tabela no Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Clique em **New Query**
5. Cole o conteúdo do arquivo: `supabase_migration_subscriptions.sql`
6. Clique em **Run** (ou pressione Ctrl+Enter)

**Arquivo:** `supabase_migration_subscriptions.sql` (criado na raiz do projeto)

---

### Passo 2: Verificar se Funcionou

Execute no SQL Editor:

```sql
SELECT * FROM user_subscriptions LIMIT 1;
```

**Resultado esperado:**
- Se retornar "Success. No rows returned" = ✅ Tabela criada
- Se retornar erro = ❌ Algo deu errado

---

### Passo 3: Testar no App

1. Faça refresh na página
2. Tente enviar uma mensagem no chat
3. O erro 406 deve desaparecer

---

## 🛡️ Proteções Implementadas

### Código Atualizado (Fallback Seguro)

✅ **Antes:** Se a tabela não existisse, o app quebrava  
✅ **Depois:** Se a tabela não existir, assume plano FREE

**Arquivos Modificados:**
- `lib/planAuthorization.ts`
- `lib/getUserPlan.ts`
- `lib/getUserPlanClient.ts`

**Mudança:**
```typescript
// ANTES
.single() // Dava erro se não encontrasse

// DEPOIS
.maybeSingle() // Retorna null se não encontrar (não dá erro)

// E adiciona verificação de erro
if (error) {
  console.warn('Erro ao verificar plano:', error.message)
  return 'free' // Fallback seguro
}
```

---

## 📊 O que a Tabela Faz

A tabela `user_subscriptions` armazena:

- Assinaturas do Stripe
- Status (active, canceled, trialing, etc.)
- Período de validade
- Customer ID do Stripe

**Usado para:**
- Diferenciar plano FREE vs PRO
- Aplicar limites mensais
- Bloquear features premium

---

## 🔍 Verificações de Segurança

### RLS (Row Level Security)

✅ Usuários só veem suas próprias assinaturas  
✅ Service Role pode inserir/atualizar (webhooks do Stripe)  
✅ Políticas de segurança ativas

### Índices

✅ `user_id` (único - um usuário = uma assinatura)  
✅ `stripe_subscription_id` (busca rápida)  
✅ `stripe_customer_id` (busca rápida)  
✅ `status` (filtros rápidos)

---

## 🚨 Se o Erro Persistir

### 1. Verificar se a tabela existe

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'user_subscriptions';
```

**Deve retornar:** `user_subscriptions`

---

### 2. Verificar RLS

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'user_subscriptions';
```

**Deve retornar:** `rowsecurity = true`

---

### 3. Verificar Políticas

```sql
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'user_subscriptions';
```

**Deve retornar:** 4 políticas (SELECT, INSERT, UPDATE, DELETE)

---

### 4. Testar Acesso Manual

No SQL Editor:

```sql
-- Como usuário autenticado
SELECT * FROM user_subscriptions 
WHERE user_id = auth.uid();
```

**Deve retornar:** Suas assinaturas (ou vazio se não tiver)

---

### 5. Verificar Service Role Key

No código, certifique-se que `SUPABASE_SERVICE_ROLE_KEY` está configurada:

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

**Onde usar:**
- Webhooks do Stripe
- APIs que precisam bypassar RLS

---

## 📝 Logs Úteis

### No Console do Navegador

**Antes da correção:**
```
Failed to load resource: 406
```

**Depois da correção:**
```
(Sem erros, ou warnings informativos)
```

### No Terminal (Server)

**Se a tabela não existir:**
```
Erro ao verificar plano (tabela pode não existir): relation "user_subscriptions" does not exist
```

**Isso é OK!** O código agora trata esse erro e assume plano FREE.

---

## 🎯 Resumo

### O que foi feito:

1. ✅ Criado arquivo de migração SQL
2. ✅ Adicionado fallback seguro no código
3. ✅ Mudado `.single()` para `.maybeSingle()`
4. ✅ Adicionado logs de aviso
5. ✅ App não quebra mais se tabela não existir

### O que você precisa fazer:

1. ⏳ Executar a migração SQL no Supabase
2. ⏳ Testar o app

### Resultado esperado:

- ✅ Erro 406 desaparece
- ✅ Chat funciona normalmente
- ✅ Plano FREE funciona (todos os usuários começam como FREE)
- ✅ Quando configurar Stripe, plano PRO funcionará automaticamente

---

## 🚀 Próximos Passos

### Após criar a tabela:

1. **Testar Chat:** Enviar mensagem deve funcionar
2. **Verificar Limites:** Plano FREE tem 100 msgs/mês
3. **Configurar Stripe:** Quando pronto, webhooks vão popular a tabela
4. **Testar Upgrade:** Usuário que pagar vira PRO automaticamente

---

## 📞 Suporte

**Arquivos Criados:**
- `supabase_migration_subscriptions.sql` - SQL para criar tabela
- `CORRECAO_ERRO_406.md` - Este guia

**Arquivos Modificados:**
- `lib/planAuthorization.ts` - Fallback seguro
- `lib/getUserPlan.ts` - Fallback seguro
- `lib/getUserPlanClient.ts` - Fallback seguro

**Status:** ✅ Código corrigido, aguardando migração SQL

---

**Última Atualização:** Dezembro 2025  
**Prioridade:** 🔴 ALTA (necessário para o app funcionar)

