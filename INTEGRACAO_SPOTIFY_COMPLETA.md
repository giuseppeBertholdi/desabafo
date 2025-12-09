# 🎵 Integração Spotify - Completa e Implementada

## ✅ O que foi implementado

### 1. Widget Visual na Home (`/home`)
- **Capa do álbum** com animação de rotação suave (360° em 20s)
- **Indicador "ouvindo agora"** com 3 barrinhas verdes animadas
- **Nome da música, artista e álbum** em destaque
- **Logo do Spotify** no canto direito
- **Fundo com gradiente verde** + blur da capa como background
- **Design responsivo** para mobile e desktop
- **Aparece automaticamente** quando o usuário está ouvindo música

### 2. Botões de Conexão na Conta (`/account`)
- **Card visual** com gradiente verde do Spotify
- **Botão "Conectar Spotify"** com logo
- **Botão "Desconectar"** quando já conectado
- **Status visual** mostrando se está conectado ou não
- **Descrição** explicando que a IA usa as músicas para entender a vibe

### 3. Integração com a IA
- A IA recebe automaticamente:
  - Música atual tocando
  - Últimas 5 músicas ouvidas
- Usa essas informações para:
  - Entender o estado emocional do usuário
  - Personalizar as respostas
  - Criar contexto mais empático

### 4. API Routes (Backend)
- `/api/spotify/auth` - Gera URL de autorização
- `/api/spotify/callback` - Recebe callback e salva tokens
- `/api/spotify/current` - Busca música atual
- `/api/spotify/recent` - Busca músicas recentes
- Renovação automática de tokens a cada hora

### 5. Banco de Dados
- Campos no `user_profiles`:
  - `spotify_access_token`
  - `spotify_refresh_token`
  - `spotify_token_expires_at`
  - `spotify_state`

## 📋 Como Configurar no Spotify Developer Dashboard

### Passo 1: Criar o App
1. Acesse: https://developer.spotify.com/dashboard
2. Faça login com sua conta Spotify
3. Clique em "Create app"

### Passo 2: Preencher o Formulário

**App name**
```
desabafo
```

**App description**
```
desabafo.io é uma plataforma de bem-estar emocional que usa IA para conversas terapêuticas. Integramos com o Spotify para entender melhor o estado emocional do usuário através das músicas que está ouvindo, criando uma experiência mais personalizada e empática.
```

**Website**
```
https://desabafo.io
```
ou
```
https://main--desabafoio.netlify.app
```

**Redirect URIs** (⚠️ IMPORTANTE: adicione AMBAS)
```
http://127.0.0.1:3000/api/spotify/callback
https://main--desabafoio.netlify.app/api/spotify/callback
```
(ou use `https://desabafo.io/api/spotify/callback` se tiver domínio próprio)

**Which API/SDKs are you planning to use?**
- ✅ Marque apenas: **Web API**
- ❌ NÃO marque: Ads API, Web Playback SDK, iOS, Android

### Passo 3: Copiar Credenciais
1. No dashboard do app criado, copie o **Client ID**
2. Clique em "Show client secret" e copie o **Client Secret**

### Passo 4: Configurar no Netlify
Vá em: **Site Settings → Environment Variables → Add a variable**

Adicione:
```
SPOTIFY_CLIENT_ID = (cole o Client ID)
SPOTIFY_CLIENT_SECRET = (cole o Client Secret)
SPOTIFY_REDIRECT_URI = https://main--desabafoio.netlify.app/api/spotify/callback
```

### Passo 5: Redesploy
Faça um novo deploy no Netlify para aplicar as variáveis de ambiente.

## 🎨 Como Funciona para o Usuário

### Conectar Spotify
1. Usuário vai em `/account`
2. Vê o card do Spotify com botão "conectar Spotify"
3. Clica no botão
4. É redirecionado para o Spotify para autorizar
5. Após autorizar, volta para `/account`
6. Status muda para "conectado!"

### Ver Música na Home
1. Com Spotify conectado, usuário vai em `/home`
2. Se estiver ouvindo música no Spotify, aparece o widget
3. Widget mostra:
   - Capa do álbum girando
   - Nome da música
   - Artista
   - Álbum
   - Indicador "ouvindo agora"

### IA Usa as Músicas
1. Usuário conversa no chat
2. IA automaticamente busca:
   - Música atual
   - Últimas 5 músicas
3. IA usa essas informações para:
   - Entender se a pessoa está triste, animada, etc.
   - Adaptar o tom da conversa
   - Fazer referências musicais relevantes

## 🔐 Segurança

- **State parameter** para prevenir CSRF
- **Tokens criptografados** no banco de dados
- **Renovação automática** de tokens
- **RLS (Row Level Security)** no Supabase
- **Usuário pode desconectar** a qualquer momento

## 🎯 Permissões Solicitadas (Scopes)

- `user-read-currently-playing` - Ver música atual
- `user-read-recently-played` - Ver músicas recentes
- `user-read-playback-state` - Ver estado de reprodução

## 📱 Responsividade

- Widget funciona perfeitamente em mobile e desktop
- Botões adaptam tamanho para telas pequenas
- Textos truncados para não quebrar layout
- Animações otimizadas para performance

## 🚀 Próximos Passos

Após configurar no Spotify Dashboard e adicionar as variáveis no Netlify:

1. ✅ Fazer deploy
2. ✅ Testar conexão em `/account`
3. ✅ Tocar música no Spotify
4. ✅ Ver widget aparecer em `/home`
5. ✅ Conversar no chat e ver a IA usar contexto musical

## 🎉 Pronto!

A integração está 100% implementada e pronta para uso. Só falta configurar as credenciais do Spotify!

