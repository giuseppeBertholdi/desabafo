# Configuração de Variáveis de Ambiente no Netlify

## ⚠️ Problema: Limite de 4KB do AWS Lambda

O AWS Lambda (usado pelo Netlify) tem um limite de 4KB para todas as variáveis de ambiente combinadas. O arquivo JSON do Google Cloud geralmente ultrapassa esse limite.

## ✅ Solução: Variáveis de Ambiente Separadas

Em vez de usar `GOOGLE_CLOUD_CREDENTIALS` com o JSON completo, configure variáveis individuais no Netlify.

### 1. Obtenha as informações do seu arquivo de credenciais Google Cloud

Abra seu arquivo JSON de credenciais e extraia os seguintes campos:

```json
{
  "type": "service_account",
  "project_id": "seu-projeto-123",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "nome@projeto.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

### 2. Configure no Netlify

Acesse: **Site Settings → Environment Variables** e adicione:

#### Variáveis Obrigatórias:

1. **GOOGLE_CLOUD_PROJECT_ID**
   - Valor: `seu-projeto-123` (do campo `project_id`)

2. **GOOGLE_PRIVATE_KEY**
   - Valor: Cole a chave privada completa (incluindo `-----BEGIN PRIVATE KEY-----` e `-----END PRIVATE KEY-----`)
   - ⚠️ **IMPORTANTE**: Cole como está, com `\n`. O código vai converter automaticamente.

3. **GOOGLE_CLIENT_EMAIL**
   - Valor: `nome@projeto.iam.gserviceaccount.com` (do campo `client_email`)

#### Variáveis Opcionais (mas recomendadas):

4. **GOOGLE_PRIVATE_KEY_ID**
   - Valor: `abc123...` (do campo `private_key_id`)

5. **GOOGLE_CLIENT_ID**
   - Valor: `123456789` (do campo `client_id`)

6. **GOOGLE_CLIENT_CERT_URL**
   - Valor: URL completa do campo `client_x509_cert_url`

### 3. Outras Variáveis de Ambiente Necessárias

Certifique-se de que todas as outras variáveis estão configuradas:

- ✅ NEXT_PUBLIC_SUPABASE_URL
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
- ✅ SUPABASE_SERVICE_ROLE_KEY
- ✅ OPENAI_API_KEY
- ✅ STRIPE_SECRET_KEY
- ✅ STRIPE_WEBHOOK_SECRET
- ✅ STRIPE_PRICE_ID_MONTHLY
- ✅ STRIPE_PRICE_ID_YEARLY
- ✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- ✅ SPOTIFY_CLIENT_ID
- ✅ SPOTIFY_CLIENT_SECRET
- ✅ SPOTIFY_REDIRECT_URI
- ✅ NEXT_PUBLIC_APP_URL
- ✅ NODE_VERSION (opcional, padrão: 20)

### 4. Como Remover a Variável Grande

1. No Netlify, vá em **Site Settings → Environment Variables**
2. Encontre `GOOGLE_CLOUD_CREDENTIALS`
3. Clique em **Delete** para removê-la

### 5. Redeploy

Após configurar todas as variáveis:

1. Vá em **Deploys** no Netlify
2. Clique em **Trigger deploy → Clear cache and deploy site**

## 💡 Desenvolvimento Local

Para desenvolvimento local, você pode continuar usando `GOOGLE_CLOUD_CREDENTIALS` com o JSON completo no arquivo `.env.local`:

```bash
GOOGLE_CLOUD_CREDENTIALS='{"type":"service_account","project_id":"...",...}'
GOOGLE_CLOUD_PROJECT_ID=seu-projeto-123
```

O código detecta automaticamente qual método usar:
- **Produção (Netlify)**: Usa variáveis separadas
- **Desenvolvimento**: Usa JSON completo

## 🔍 Verificação

Para verificar se está funcionando:

1. Faça deploy no Netlify
2. Teste a funcionalidade de voz no aplicativo
3. Verifique os logs no Netlify para erros relacionados ao Google Cloud

## 📊 Economia de Espaço

- **Antes**: ~3.5KB (JSON completo)
- **Depois**: ~2.5KB (variáveis separadas)
- **Economia**: ~1KB + flexibilidade para adicionar mais variáveis

---

**Documentação Oficial**:
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)
- [AWS Lambda Limits](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html)

