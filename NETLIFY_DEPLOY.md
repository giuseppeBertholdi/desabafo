# Guia de Deploy no Netlify

## 1. Variáveis de Ambiente

⚠️ **IMPORTANTE**: Variáveis de ambiente NÃO devem estar no repositório Git. Elas devem ser configuradas no Netlify Dashboard.

### Configurar no Netlify:

1. Acesse seu site no Netlify Dashboard
2. Vá em **Site settings** > **Environment variables**
3. Adicione as seguintes variáveis:

#### Variáveis Obrigatórias:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=sua-url-do-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima

# Supabase Service Role (para webhooks)
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_live_sua_chave_secreta_producao
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_sua_chave_publica_producao
STRIPE_WEBHOOK_SECRET=whsec_seu_webhook_secret_producao
STRIPE_PRICE_ID_MONTHLY=price_seu_price_id_mensal
STRIPE_PRICE_ID_YEARLY=price_seu_price_id_anual

# Google Gemini (para chat)
GEMINI_API_KEY=sua_chave_gemini

# OpenAI (para chat por voz)
OPENAI_API_KEY=sua_chave_openai

# URL da aplicação
NEXT_PUBLIC_APP_URL=https://seu-dominio.netlify.app

# Upstash Redis (para rate limiting)
UPSTASH_REDIS_REST_URL=sua_url_redis
UPSTASH_REDIS_REST_TOKEN=seu_token_redis
```

### Variáveis Opcionais:

```env
# Google Cloud (se usar TTS/STT)
GOOGLE_APPLICATION_CREDENTIALS=caminho_para_credenciais_json

# Spotify (se usar integração)
SPOTIFY_CLIENT_ID=seu_client_id
SPOTIFY_CLIENT_SECRET=seu_client_secret
```

## 2. Configuração do Build

### Build Settings no Netlify:

- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Node version**: 18.x ou 20.x (recomendado)

### Netlify.toml (opcional):

Crie um arquivo `netlify.toml` na raiz do projeto:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## 3. Configurar Webhook do Stripe

1. No Stripe Dashboard, vá em **Developers** > **Webhooks**
2. Adicione endpoint: `https://seu-dominio.netlify.app/api/stripe/webhook`
3. Selecione eventos:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copie o **Signing secret** e adicione em `STRIPE_WEBHOOK_SECRET` no Netlify

## 4. Configurar Domínio Customizado (opcional)

1. No Netlify Dashboard, vá em **Domain settings**
2. Adicione seu domínio customizado
3. Configure os DNS conforme instruções do Netlify
4. Atualize `NEXT_PUBLIC_APP_URL` com seu domínio customizado

## 5. Verificar Deploy

Após o deploy, verifique:

- ✅ Site carrega corretamente
- ✅ Login funciona
- ✅ Chat funciona
- ✅ Checkout do Stripe funciona
- ✅ Webhooks do Stripe funcionam
- ✅ Variáveis de ambiente estão configuradas

## 6. Troubleshooting

### Build falha com erros de ESLint:

- Os erros críticos foram corrigidos
- Warnings não impedem o build
- Se necessário, ajuste `.eslintrc.json`

### Variáveis de ambiente não funcionam:

- Verifique se estão configuradas no Netlify Dashboard
- Reinicie o deploy após adicionar variáveis
- Use `NEXT_PUBLIC_` prefix para variáveis do cliente

### Webhook não funciona:

- Verifique a URL do webhook no Stripe
- Confirme que `STRIPE_WEBHOOK_SECRET` está correto
- Verifique logs do Netlify para erros

## 7. Checklist de Produção

- [ ] Todas as variáveis de ambiente configuradas
- [ ] Usar chaves de PRODUÇÃO (não test)
- [ ] Webhook do Stripe configurado
- [ ] Domínio customizado configurado (se aplicável)
- [ ] SSL/HTTPS ativado
- [ ] Testar fluxo completo de checkout
- [ ] Verificar logs de erro no Netlify
- [ ] Configurar monitoramento (opcional)

