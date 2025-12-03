# Configuração de Autenticação com Supabase

## 1. Criar conta no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma conta gratuita
3. Crie um novo projeto

## 2. Configurar variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto com:

```env
NEXT_PUBLIC_SUPABASE_URL=sua-url-do-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-do-supabase
```

**Onde encontrar essas informações:**
- No painel do Supabase, vá em `Settings` > `API`
- Copie a `Project URL` e a `anon` key

## 3. Configurar autenticação com Google

### No Google Cloud Console:

1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Crie um novo projeto ou selecione um existente
3. Vá em `APIs & Services` > `Credentials`
4. Clique em `Create Credentials` > `OAuth 2.0 Client ID`
5. Configure:
   - Application type: `Web application`
   - Authorized redirect URIs: `https://SEU_PROJETO.supabase.co/auth/v1/callback`
6. Copie o `Client ID` e `Client Secret`

### No Supabase:

1. Vá em `Authentication` > `Providers`
2. Ative o provider `Google`
3. Cole o `Client ID` e `Client Secret` do Google
4. Salve as configurações

## 4. Configurar URL de callback

No arquivo `.env.local`, o callback já está configurado para:
```
${window.location.origin}/auth/callback
```

Isso significa que após o login, o usuário será redirecionado para `/dashboard`.

## 5. Testar o login

1. Execute o projeto: `npm run dev`
2. Clique em "começar grátis" na landing page
3. Você será redirecionado para a página de login
4. Clique em "continuar com o Google"
5. Faça login com sua conta Google
6. Você será redirecionado para o dashboard

## Estrutura criada:

- `/login` - Página de login com Google
- `/auth/callback` - Rota de callback após autenticação
- `/dashboard` - Área protegida (apenas para usuários autenticados)
- `middleware.ts` - Protege rotas que precisam de autenticação

## Notas importantes:

- O middleware protege automaticamente todas as rotas que começam com `/dashboard`
- Usuários não autenticados serão redirecionados para `/login`
- Todos os botões "começar grátis" agora levam para a página de login

