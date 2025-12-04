# 🔧 Correção do Loop de Login

## ❌ Problema

Após fazer login com Google, você é redirecionado de volta para a página de login, criando um loop infinito.

**URL atual:** `https://main--desabafos.netlify.app/login`

---

## ✅ Solução

### 1️⃣ Configurar URLs no Supabase (URGENTE!)

Acesse: https://supabase.com/dashboard → Seu Projeto → **Authentication → URL Configuration**

#### Site URL
```
https://main--desabafos.netlify.app
```

#### Redirect URLs (adicione AMBAS)
```
https://main--desabafos.netlify.app/auth/callback
https://main--desabafos.netlify.app/**
```

**⚠️ IMPORTANTE:** A segunda URL com `/**` permite que o Supabase redirecione para qualquer rota do seu app.

---

### 2️⃣ Criar Tabela user_profiles (Se não existir)

Execute no **SQL Editor** do Supabase:

```sql
-- Criar tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  nickname TEXT,
  preferred_name TEXT,
  interests TEXT[],
  current_state TEXT,
  what_looking_for TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_onboarding_completed ON user_profiles(onboarding_completed);

-- Habilitar RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Política: usuários podem ver seu próprio perfil
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Política: usuários podem criar seu próprio perfil
CREATE POLICY "Users can create their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: usuários podem atualizar seu próprio perfil
CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

**Arquivo disponível:** `supabase_onboarding_schema.sql`

---

### 3️⃣ Criar Tabela user_subscriptions

Execute no **SQL Editor** do Supabase:

**Arquivo:** `supabase_migration_subscriptions.sql` (cole todo o conteúdo)

---

### 4️⃣ Verificar Google OAuth no Supabase

1. Vá em **Authentication → Providers → Google**
2. Verifique se está **Enabled**
3. Copie o **Client ID** e **Client Secret**

#### No Google Cloud Console

Acesse: https://console.cloud.google.com/apis/credentials

1. Selecione suas credenciais OAuth
2. Em **Authorized redirect URIs**, adicione:

```
https://lphpiaqjzcociywzctrn.supabase.co/auth/v1/callback
```

**Substitua** `lphpiaqjzcociywzctrn` pelo ID do seu projeto Supabase.

**Como encontrar o ID:**
- URL do Supabase: `https://[SEU_ID].supabase.co`

---

### 5️⃣ Fazer Deploy das Correções

```bash
git add .
git commit -m "fix: corrige loop de login e adiciona fallbacks seguros"
git push origin main
```

O Netlify vai fazer deploy automaticamente.

---

## 🔍 O que foi Corrigido no Código

### Antes ❌

```typescript
// Dava erro se tabela não existisse
const { data: profile } = await supabase
  .from('user_profiles')
  .select('onboarding_completed')
  .eq('user_id', session.user.id)
  .single() // ❌ Causa erro 406

// Sem tratamento de erro adequado
```

### Depois ✅

```typescript
// Usa maybeSingle() e trata erros
const { data: profile, error: profileError } = await supabase
  .from('user_profiles')
  .select('onboarding_completed')
  .eq('user_id', session.user.id)
  .maybeSingle() // ✅ Não causa erro

// Trata erro específico de tabela não existente
if (profileError && profileError.code === 'PGRST116') {
  // Redireciona para onboarding
}

// Logs para debug
console.error('Erro:', error)
```

---

## 📊 Fluxo Esperado Após Correção

```
1. Usuário clica em "Continuar com Google"
   ↓
2. Google OAuth (autorização)
   ↓
3. Redirect para: /auth/callback?code=...
   ↓
4. Callback processa código
   ↓
5. Verifica se completou onboarding
   ↓
6a. NÃO completou → Redirect para /onboarding
6b. SIM completou → Redirect para /home
```

---

## 🧪 Como Testar

### 1. Limpar Cache e Cookies

**Chrome/Edge:**
1. F12 (DevTools)
2. Application → Storage → Clear site data
3. Fechar DevTools

### 2. Tentar Login Novamente

1. Acesse: https://main--desabafos.netlify.app/login
2. Clique em "Continuar com Google"
3. Autorize o app
4. Você deve ser redirecionado para:
   - `/onboarding` (primeira vez)
   - `/home` (se já completou onboarding)

### 3. Verificar Console

Abra DevTools (F12) e veja a aba **Console**:

**Se funcionar:** ✅
```
(Nenhum erro, ou apenas warnings informativos)
```

**Se ainda falhar:** ❌
```
Failed to load resource: 406
```

Se ainda aparecer 406, execute as migrações SQL!

---

## 🚨 Troubleshooting

### Erro: "redirect_uri_mismatch"

**Causa:** Google OAuth não tem a URL autorizada

**Solução:**
1. Google Cloud Console → Credentials
2. Adicionar: `https://[SEU_ID].supabase.co/auth/v1/callback`

---

### Erro: "Invalid Redirect URL"

**Causa:** Supabase não tem a URL autorizada

**Solução:**
1. Supabase → Authentication → URL Configuration
2. Adicionar URLs do Netlify

---

### Erro 406: "user_profiles" not found

**Causa:** Tabela não existe

**Solução:**
1. Execute o SQL de `supabase_onboarding_schema.sql`
2. Verifique: `SELECT * FROM user_profiles LIMIT 1;`

---

### Erro 406: "user_subscriptions" not found

**Causa:** Tabela não existe

**Solução:**
1. Execute o SQL de `supabase_migration_subscriptions.sql`
2. Verifique: `SELECT * FROM user_subscriptions LIMIT 1;`

---

## ✅ Checklist de Configuração

### Supabase
- [ ] Site URL configurada (`https://main--desabafos.netlify.app`)
- [ ] Redirect URLs configuradas (2 URLs)
- [ ] Google OAuth habilitado
- [ ] Tabela `user_profiles` criada
- [ ] Tabela `user_subscriptions` criada
- [ ] RLS habilitado em ambas as tabelas

### Google Cloud
- [ ] Redirect URI configurada (`https://[ID].supabase.co/auth/v1/callback`)
- [ ] Client ID e Secret configurados no Supabase

### Netlify
- [ ] Deploy realizado
- [ ] Variáveis de ambiente configuradas
- [ ] `NEXT_PUBLIC_SUPABASE_URL` correto
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` correto

---

## 📞 Ordem de Execução

**Faça nesta ordem:**

1. ✅ **Configurar URLs no Supabase** (mais importante!)
2. ✅ **Executar SQL das tabelas**
3. ✅ **Verificar Google OAuth**
4. ✅ **Fazer deploy do código corrigido**
5. ✅ **Limpar cache do navegador**
6. ✅ **Testar login**

---

## 🎯 Resultado Esperado

Após todas as configurações:

✅ Login com Google funciona  
✅ Redirecionamento correto (/onboarding ou /home)  
✅ Sem erros 406  
✅ Sem loop de login  
✅ App funcional

---

**Arquivos Criados:**
- `CORRECAO_LOGIN_LOOP.md` - Este guia
- Código do callback corrigido

**Prioridade:** 🔴 CRÍTICA (app não funciona sem isso)

**Última Atualização:** Dezembro 2025

