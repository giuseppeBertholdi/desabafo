# 🧪 Guia de Teste - Modo Voz e Webhook Stripe

## 📞 Testando o Modo Voz

### Pré-requisitos
1. ✅ Ter acesso com o email `giuseppe.bertholdi@gmail.com` (já está liberado)
2. ✅ Ter a variável `OPENAI_API_KEY` configurada no Netlify
3. ✅ Estar logado na aplicação

### Passos para Testar

#### 1. Acessar o Modo Voz
- **Opção 1**: Acesse diretamente: `https://desabafo.site/chat?mode=voice`
- **Opção 2**: Na página inicial (`/home`), clique no botão "modo voz"
- **Opção 3**: Dentro do chat, clique no botão para alternar para modo voz (se tiver plano Pro)

#### 2. Verificar Permissões
O modo voz está liberado para:
- ✅ `giuseppe.bertholdi@gmail.com` (sempre liberado)
- ✅ Usuários com plano Pro ativo

#### 3. Testar Funcionalidades

**a) Iniciar Sessão de Voz:**
- Clique no botão "Iniciar conversa por voz"
- Permita acesso ao microfone quando solicitado
- Aguarde a conexão WebRTC ser estabelecida

**b) Conversar por Voz:**
- Fale naturalmente - a IA vai transcrever sua fala
- A IA vai responder por voz também
- Você verá a transcrição do que você disse e o que a IA respondeu

**c) Verificar Logs:**
- Abra o Console do navegador (F12)
- Verifique se há erros de conexão
- Procure por mensagens relacionadas a:
  - `Realtime Mini`
  - `WebRTC`
  - `Data Channel`

#### 4. Possíveis Problemas e Soluções

**Problema: "Erro ao obter token"**
- ✅ Verificar se `OPENAI_API_KEY` está configurada
- ✅ Verificar se a chave é válida
- ✅ Verificar logs do Netlify

**Problema: "Modo voz disponível apenas no plano Pro"**
- ✅ Verificar se está logado com `giuseppe.bertholdi@gmail.com`
- ✅ Verificar se a verificação de email está correta no código

**Problema: "Erro na conexão de voz"**
- ✅ Verificar permissões do microfone no navegador
- ✅ Verificar se o navegador suporta WebRTC
- ✅ Verificar firewall/proxy que possa bloquear WebRTC

**Problema: "Áudio não está funcionando"**
- ✅ Verificar se o volume do navegador está ligado
- ✅ Verificar se não está em modo silencioso
- ✅ Testar em outro navegador (Chrome recomendado)

---

## 🔔 Testando o Webhook do Stripe (Produção)

### Pré-requisitos
1. ✅ Ter a variável `STRIPE_WEBHOOK_SECRET` configurada no Netlify
2. ✅ Ter configurado o webhook no dashboard do Stripe apontando para produção
3. ✅ Ter acesso ao dashboard do Stripe

### Configuração do Webhook no Stripe

#### 1. Acessar Dashboard do Stripe
1. Acesse: https://dashboard.stripe.com/webhooks
2. Clique em "Add endpoint"
3. Configure:
   - **Endpoint URL**: `https://desabafo.site/api/stripe/webhook`
   - **Events to send**: Selecione os eventos:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`

#### 2. Obter o Webhook Secret
1. Após criar o endpoint, copie o "Signing secret"
2. Adicione no Netlify como variável de ambiente:
   - Nome: `STRIPE_WEBHOOK_SECRET`
   - Valor: `whsec_...` (o secret que você copiou)

### Testando o Webhook

#### Método 1: Teste Real (Recomendado)
1. **Fazer uma compra de teste:**
   - Acesse `/pricing`
   - Clique em "Assinar" em qualquer plano
   - Use um cartão de teste do Stripe:
     - Número: `4242 4242 4242 4242`
     - Data: qualquer data futura
     - CVC: qualquer 3 dígitos
   - Complete o checkout

2. **Verificar no Stripe Dashboard:**
   - Acesse: https://dashboard.stripe.com/events
   - Procure pelo evento `checkout.session.completed`
   - Clique no evento e veja os detalhes
   - Verifique se o webhook foi enviado (status 200)

3. **Verificar no Netlify:**
   - Acesse os logs do Netlify
   - Procure por logs do webhook:
     - `checkout.session.completed`
     - `Assinatura criada/atualizada com sucesso`
   - Verifique se não há erros

4. **Verificar no Banco de Dados:**
   - Acesse o Supabase
   - Vá para a tabela `user_subscriptions`
   - Verifique se a assinatura foi criada/atualizada
   - Campos importantes:
     - `user_id`
     - `stripe_subscription_id`
     - `status` (deve ser "active")
     - `current_period_start` e `current_period_end`

#### Método 2: Usar Stripe CLI (Local)
```bash
# Instalar Stripe CLI
# https://stripe.com/docs/stripe-cli

# Fazer login
stripe login

# Escutar webhooks localmente e encaminhar para produção
stripe listen --forward-to https://desabafo.site/api/stripe/webhook

# Em outro terminal, disparar evento de teste
stripe trigger checkout.session.completed
```

#### Método 3: Testar Eventos Específicos

**Testar `customer.subscription.updated`:**
1. No Stripe Dashboard, vá para uma assinatura
2. Modifique algo (ex: cancelar no final do período)
3. Verifique se o webhook foi disparado
4. Verifique se o status foi atualizado no banco

**Testar `customer.subscription.deleted`:**
1. No Stripe Dashboard, cancele uma assinatura
2. Verifique se o webhook foi disparado
3. Verifique se o status mudou para "canceled" no banco

### Verificando Logs

#### Logs do Netlify
1. Acesse: https://app.netlify.com/sites/[seu-site]/functions
2. Vá para a função `api/stripe/webhook`
3. Veja os logs em tempo real
4. Procure por:
   - ✅ `Assinatura criada/atualizada com sucesso`
   - ❌ `Erro ao salvar assinatura`
   - ❌ `Webhook Error`

#### Logs do Stripe
1. Acesse: https://dashboard.stripe.com/webhooks
2. Clique no seu endpoint
3. Veja a aba "Recent deliveries"
4. Verifique:
   - Status code (deve ser 200)
   - Response time
   - Última tentativa

### Eventos Tratados pelo Webhook

O webhook trata os seguintes eventos:

1. **`checkout.session.completed`**
   - Quando: Usuário completa o checkout
   - Ação: Cria/atualiza assinatura no banco
   - Verificar: `user_subscriptions` deve ter nova entrada

2. **`customer.subscription.created`**
   - Quando: Nova assinatura é criada
   - Ação: Cria/atualiza assinatura no banco
   - Verificar: Status deve ser "active" ou "trialing"

3. **`customer.subscription.updated`**
   - Quando: Assinatura é modificada (plano, status, etc)
   - Ação: Atualiza dados da assinatura no banco
   - Verificar: Campos atualizados corretamente

4. **`customer.subscription.deleted`**
   - Quando: Assinatura é cancelada
   - Ação: Atualiza status para "canceled"
   - Verificar: Status mudou para "canceled"

### Troubleshooting

**Problema: Webhook não está sendo recebido**
- ✅ Verificar se a URL está correta no Stripe
- ✅ Verificar se o endpoint está acessível (não bloqueado por firewall)
- ✅ Verificar se o `STRIPE_WEBHOOK_SECRET` está configurado

**Problema: "Webhook Error: Invalid signature"**
- ✅ Verificar se o `STRIPE_WEBHOOK_SECRET` está correto
- ✅ Verificar se está usando o secret correto (produção vs teste)
- ✅ Verificar se o secret não foi alterado

**Problema: "user_id não encontrado"**
- ✅ Verificar se o `user_id` está sendo passado no metadata do checkout
- ✅ Verificar o código de criação do checkout em `/api/stripe/checkout/route.ts`

**Problema: Assinatura não aparece no banco**
- ✅ Verificar logs do Netlify para erros
- ✅ Verificar se a tabela `user_subscriptions` existe
- ✅ Verificar permissões RLS do Supabase
- ✅ Verificar se está usando `createSupabaseAdmin()` no webhook

### Checklist de Teste Completo

#### Modo Voz
- [ ] Consegue acessar `/chat?mode=voice`
- [ ] Permissão de microfone é solicitada
- [ ] Conexão WebRTC é estabelecida
- [ ] Fala é transcrita corretamente
- [ ] IA responde por voz
- [ ] Transcrições aparecem na tela
- [ ] Pode alternar entre modo texto e voz
- [ ] Funciona com `giuseppe.bertholdi@gmail.com`
- [ ] Funciona com usuário Pro

#### Webhook Stripe
- [ ] Webhook configurado no Stripe Dashboard
- [ ] `STRIPE_WEBHOOK_SECRET` configurado no Netlify
- [ ] `checkout.session.completed` cria assinatura no banco
- [ ] `customer.subscription.created` cria assinatura no banco
- [ ] `customer.subscription.updated` atualiza assinatura no banco
- [ ] `customer.subscription.deleted` cancela assinatura no banco
- [ ] Logs aparecem no Netlify
- [ ] Status code 200 no Stripe Dashboard

---

## 🔍 Comandos Úteis

### Verificar Variáveis de Ambiente no Netlify
```bash
# Via Netlify CLI
netlify env:list
```

### Testar Webhook Localmente
```bash
# Usar Stripe CLI para encaminhar eventos
stripe listen --forward-to http://localhost:3000/api/stripe/webhook

# Disparar evento de teste
stripe trigger checkout.session.completed
```

### Verificar Logs em Tempo Real
```bash
# Netlify CLI
netlify functions:log

# Ou acesse diretamente no dashboard
```

---

## 📝 Notas Importantes

1. **Modo Voz**: Requer conexão estável de internet e permissões de microfone
2. **Webhook**: Pode levar alguns segundos para processar eventos
3. **Testes**: Sempre teste em produção antes de lançar para usuários
4. **Logs**: Mantenha logs ativos para debug
5. **Segurança**: Nunca exponha o `STRIPE_WEBHOOK_SECRET` publicamente

---

## 🆘 Suporte

Se encontrar problemas:
1. Verifique os logs do Netlify
2. Verifique os logs do Stripe Dashboard
3. Verifique o console do navegador (para modo voz)
4. Entre em contato: giuseppe.bertholdi@gmail.com

