# Sistema de Referência - Convide Amigos e Ganhe Plano Essential

## 📋 Resumo

Sistema completo de referência onde usuários podem convidar amigos. Quando 5 amigos se cadastram usando o link de convite, o usuário ganha o plano Essential de graça.

## 🗄️ Banco de Dados

### 1. Aplicar Schema SQL

Execute o arquivo `REFERRAL_SCHEMA.sql` no Supabase SQL Editor:

1. Acesse o Supabase Dashboard
2. Vá em SQL Editor
3. Cole o conteúdo de `REFERRAL_SCHEMA.sql`
4. Execute o script

Isso criará:
- Tabela `referrals` para armazenar convites
- Função `check_and_update_referral_plan()` que atualiza o plano automaticamente
- Trigger que executa a função quando uma referência é completada

## 🔗 APIs Criadas

### 1. `POST /api/referral/generate`
Gera um código de referência único para o usuário autenticado.

**Resposta:**
```json
{
  "referralCode": "ABC12345",
  "referralUrl": "https://seuapp.com/invite/ABC12345"
}
```

### 2. `GET /api/referral/stats`
Retorna estatísticas de referência do usuário autenticado.

**Resposta:**
```json
{
  "referralCode": "ABC12345",
  "referralUrl": "https://seuapp.com/invite/ABC12345",
  "totalReferrals": 3,
  "completedReferrals": 2,
  "remainingReferrals": 3
}
```

### 3. `POST /api/referral/process`
Processa uma referência quando um novo usuário se cadastra.

**Body:**
```json
{
  "referralCode": "ABC12345"
}
```

### 4. `GET /api/referral/validate?code=ABC12345`
Valida se um código de referência é válido (não usado).

## 📄 Páginas Criadas

### `/invite/[code]`
Página de landing para convites. Mostra uma mensagem de boas-vindas e botão para começar.

## 🔄 Fluxo Completo

1. **Usuário gera link de convite:**
   - Acessa `/account`
   - Clica em "gerar link de convite"
   - Copia o link

2. **Amigo recebe o link:**
   - Acessa `/invite/ABC12345`
   - Clica em "começar agora"
   - É redirecionado para `/login?ref=ABC12345`

3. **Amigo faz login:**
   - Login com Google
   - Callback `/auth/callback?ref=ABC12345` processa a referência
   - Referência é marcada como completada

4. **Quando 5 amigos se cadastram:**
   - Trigger no banco detecta que chegou a 5 referências
   - Função `check_and_update_referral_plan()` é executada
   - Plano Essential é concedido automaticamente ao usuário

## 🎨 UI no Account

A seção de referência aparece na página `/account` com:
- Barra de progresso mostrando quantos amigos já se cadastraram
- Link de convite copiável
- Mensagem de sucesso quando atinge 5 referências

## ⚙️ Configuração

### Variável de Ambiente

Adicione no `.env.local`:
```env
NEXT_PUBLIC_APP_URL=https://seuapp.com
```

Ou deixe vazio para usar `http://localhost:3000` em desenvolvimento.

## 🔒 Segurança

- Códigos de referência são únicos e não podem ser reutilizados
- Usuários não podem se referir a si mesmos
- Cada usuário só pode ser referido uma vez
- Validações no banco e na API

## 📝 Notas Importantes

1. O plano Essential é concedido por 1 ano
2. Se o usuário já tiver um plano pago, o Essential não substitui
3. O sistema funciona automaticamente via trigger no banco
4. A página `/invite/[code]` é pública (não requer autenticação)

## 🐛 Troubleshooting

### Referências não estão sendo contadas
- Verifique se o trigger foi criado corretamente
- Verifique logs do Supabase para erros na função
- Confirme que `completed_at` está sendo atualizado

### Plano não está sendo concedido
- Verifique se a função `check_and_update_referral_plan()` existe
- Verifique se o trigger está ativo
- Confirme que o campo `plan_type` existe na tabela `user_subscriptions`

### Link não está funcionando
- Verifique se `NEXT_PUBLIC_APP_URL` está configurado
- Confirme que a rota `/invite/[code]` está acessível
- Verifique se o middleware permite acesso público à rota

