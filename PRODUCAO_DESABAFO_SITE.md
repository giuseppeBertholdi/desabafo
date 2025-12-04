# 🚀 Configuração de Produção - desabafo.site

## 📋 Checklist de Configuração

### 1️⃣ **Variáveis de Ambiente no Netlify**

Acesse: **Site Settings → Environment Variables** e configure:

#### **URLs e Domínios**
```env
NEXT_PUBLIC_APP_URL=https://desabafo.site
```

#### **Supabase**
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

#### **OpenAI**
```env
OPENAI_API_KEY=sua-key-openai
```

#### **Spotify**
```env
SPOTIFY_CLIENT_ID=seu-client-id
SPOTIFY_CLIENT_SECRET=seu-client-secret
SPOTIFY_REDIRECT_URI=https://desabafo.site/callback
```

#### **Google Cloud (Usar Variáveis Separadas - NÃO use GOOGLE_CLOUD_CREDENTIALS)**
```env
GOOGLE_CLOUD_PROJECT_ID=seu-projeto-123
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
GOOGLE_CLIENT_EMAIL=nome@projeto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY_ID=abc123...
GOOGLE_CLIENT_ID=123456789
GOOGLE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/...
```

⚠️ **IMPORTANTE**: Remova `GOOGLE_CLOUD_CREDENTIALS` se existir (limite de 4KB)

#### **Stripe (NÃO MEXER POR ENQUANTO - mas documente)**
```env
# Stripe - Aguardando configuração
STRIPE_SECRET_KEY=sk_test_ou_live...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_MONTHLY=price_...
STRIPE_PRICE_ID_YEARLY=price_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_ou_live...
```

---

### 2️⃣ **Configurações no Supabase**

#### **Authentication → URL Configuration**

Acesse: **Authentication → URL Configuration** no painel do Supabase

1. **Site URL**:
   ```
   https://desabafo.site
   ```

2. **Redirect URLs** (adicione ambas):
   ```
   https://desabafo.site/auth/callback
   https://desabafo.site/callback
   ```

#### **Verificar se Google OAuth está configurado**

Se estiver usando Google OAuth:

1. Acesse: **Authentication → Providers → Google**
2. Verifique se está habilitado
3. **Authorized redirect URIs no Google Cloud Console**:
   ```
   https://SEU_PROJETO.supabase.co/auth/v1/callback
   ```

---

### 3️⃣ **Configurações no Spotify Developer Dashboard**

Acesse: [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)

1. Selecione seu app
2. Vá em **Settings**
3. Em **Redirect URIs**, adicione:
   ```
   https://desabafo.site/callback
   ```
4. Clique em **Save**

⚠️ **Mantenha também** a URL de desenvolvimento se precisar:
```
http://127.0.0.1:3000/callback
```

---

### 4️⃣ **Configurações no Google Cloud Console**

Se estiver usando Speech-to-Text ou Text-to-Speech:

1. Acesse: [console.cloud.google.com](https://console.cloud.google.com)
2. Vá em **APIs & Services → Credentials**
3. Selecione sua Service Account
4. Baixe o JSON das credenciais
5. **IMPORTANTE**: Use variáveis separadas no Netlify (veja seção 1️⃣)

---

### 5️⃣ **Configurações de DNS (no seu provedor de domínio)**

Configure o DNS do domínio `desabafo.site`:

#### **Opção A: Usando Netlify DNS (Recomendado)**
1. No Netlify: **Domain Settings → Add custom domain**
2. Adicione `desabafo.site`
3. Siga as instruções para apontar os nameservers

#### **Opção B: Usando CNAME/A Record**
1. Adicione um registro **A** apontando para o IP do Netlify
2. Ou um registro **CNAME** para `seu-site.netlify.app`

**Netlify configurará automaticamente HTTPS com Let's Encrypt**

---

### 6️⃣ **Verificar Configurações de Build no Netlify**

Em **Build & Deploy → Build Settings**:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Isso já está configurado no `netlify.toml` do projeto ✅

---

### 7️⃣ **Stripe Webhook (QUANDO CONFIGURAR STRIPE)**

**⚠️ NÃO FAZER AGORA - Apenas documente para quando for configurar:**

1. Acesse: [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
2. Clique em **Add endpoint**
3. **Endpoint URL**:
   ```
   https://desabafo.site/api/stripe/webhook
   ```
4. **Events to send**:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `customer.subscription.created`
5. Copie o **Signing secret** e adicione em `STRIPE_WEBHOOK_SECRET`

---

## 🔍 Verificação Pós-Deploy

### Checklist de Testes:

- [ ] **Homepage** carrega: https://desabafo.site
- [ ] **Login** funciona
- [ ] **Google OAuth** funciona (se configurado)
- [ ] **Chat** funciona
- [ ] **Spotify** conecta (teste em /account)
- [ ] **Voz** funciona (se configurado Google Cloud)
- [ ] **Journal** salva entradas
- [ ] **Insights** aparecem
- [ ] HTTPS está ativo (cadeado verde)
- [ ] Redirect de www para não-www funciona (ou vice-versa)

---

## 🐛 Troubleshooting

### 1. Erro de CORS
**Sintoma**: `Access-Control-Allow-Origin` error  
**Solução**: Verifique `NEXT_PUBLIC_APP_URL` e URLs de redirect no Supabase

### 2. Spotify não conecta
**Sintoma**: `redirect_uri_mismatch`  
**Solução**: 
- Verifique `SPOTIFY_REDIRECT_URI=https://desabafo.site/callback`
- Adicione essa URL no Spotify Developer Dashboard

### 3. Erro de autenticação do Supabase
**Sintoma**: `Invalid redirect URL`  
**Solução**: Adicione `https://desabafo.site/auth/callback` nas Redirect URLs do Supabase

### 4. Erro do Google Cloud
**Sintoma**: `invalid_grant` ou `unauthorized_client`  
**Solução**:
- Verifique as credenciais separadas no Netlify
- Certifique-se que `GOOGLE_PRIVATE_KEY` tem `\n` (não quebras de linha reais)

### 5. Limite de 4KB nas variáveis de ambiente
**Sintoma**: `Environment variables exceed the 4KB limit`  
**Solução**: 
- Remova `GOOGLE_CLOUD_CREDENTIALS`
- Use apenas as variáveis separadas do Google Cloud

---

## 📝 Resumo de URLs a Atualizar

| Serviço | Onde Configurar | URL Antiga | URL Nova |
|---------|----------------|------------|----------|
| **Netlify** | Environment Variables | `localhost:3000` | `https://desabafo.site` |
| **Supabase** | URL Configuration | `localhost:3000` | `https://desabafo.site` |
| **Spotify** | Developer Dashboard | `127.0.0.1:3000/callback` | `https://desabafo.site/callback` |
| **Google Cloud** | Credentials (Netlify) | N/A | Variáveis separadas |

---

## ✅ Ordem de Configuração Recomendada

1. ✅ Configurar domínio no Netlify
2. ✅ Configurar variáveis de ambiente no Netlify (exceto Stripe)
3. ✅ Atualizar Supabase URLs
4. ✅ Atualizar Spotify Redirect URI
5. ✅ Deploy e testar
6. 🔜 Configurar Stripe (DEPOIS - quando necessário)

---

**Data de Última Atualização**: Dez 2025  
**Domínio**: desabafo.site  
**Status**: Pronto para configuração ✅

