# Configuração do App Spotify - desabafo.io

## 📝 Como Preencher o Formulário do Spotify Dashboard

Acesse: https://developer.spotify.com/dashboard e clique em "Create app"

## Como Preencher o Formulário

### Informações Básicas

**App name** (obrigatório)
```
desabafo
```

**App description** (obrigatório)
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

### Redirect URIs (obrigatório)

⚠️ **ATENÇÃO**: Use `/api/spotify/callback` (não apenas `/callback`)

Adicione AMBAS as URLs:

1. **Desenvolvimento:**
```
http://127.0.0.1:3000/api/spotify/callback
```

2. **Produção (escolha uma):**

Se você tem domínio próprio:
```
https://desabafo.io/api/spotify/callback
```

OU se está usando Netlify:
```
https://main--desabafoio.netlify.app/api/spotify/callback
```

**IMPORTANTE**: 
- Use `127.0.0.1` (não `localhost`) para desenvolvimento
- Use exatamente `/api/spotify/callback` no final
- Clique em "Add" após cada URL

### Android packages
**Deixe vazio** (não é um app Android)

### iOS app bundles
**Deixe vazio** (não é um app iOS)

### Which API/SDKs are you planning to use?

Marque apenas:
- ✅ **Web API**

**NÃO marque:**
- ❌ Ads API
- ❌ Web Playback SDK
- ❌ iOS
- ❌ Android

## Como Funciona (Já Implementado!)

A integração já está 100% implementada! Quando conectada:

### 🏠 Na Página Home
- Widget visual mostra a música atual
- Exibe capa do álbum girando
- Nome da música, artista e álbum
- Indicador animado "ouvindo agora"
- Logo do Spotify

### 💬 No Chat
- 🎵 Captura música atual do usuário automaticamente
- 📊 Analisa últimas 5 músicas ouvidas
- 🤖 A IA usa isso para entender a vibe/humor do usuário
- 💬 Personaliza as respostas baseado no contexto musical

### 🔄 Renovação Automática
- Tokens renovados automaticamente a cada hora
- Usuário não precisa reconectar

## 🎨 Visual do Widget

O widget aparece na home mostrando:
- Capa do álbum com animação de rotação suave
- Indicador verde "ouvindo agora" com animação pulsante
- Nome da música, artista e álbum
- Fundo com gradiente verde inspirado no Spotify
- Logo do Spotify no canto
- Design responsivo (mobile e desktop)

## 📱 Como o Usuário Usa

1. Vai em `/account`
2. Clica em "Conectar Spotify" (será adicionado)
3. Autoriza o app no Spotify
4. Volta para o desabafo.io
5. A música atual aparece na home automaticamente
6. A IA usa essas informações nas conversas!

## Após Criar o App

1. Copie o **Client ID** e **Client Secret**
2. Adicione no Netlify (ou `.env.local` para desenvolvimento):

```env
SPOTIFY_CLIENT_ID=seu_client_id_aqui
SPOTIFY_CLIENT_SECRET=seu_client_secret_aqui
SPOTIFY_REDIRECT_URI=https://desabafo.io/api/spotify/callback
```

## Como Funciona a Integração

### O que o Spotify faz:

1. **Captura a vibe do usuário** através da música atual
2. **Analisa músicas recentes** (últimas 5)
3. **Contextualiza a conversa** baseado no estado emocional das músicas
4. **Personaliza respostas** da IA considerando o gosto musical

### Permissões Necessárias (Scopes):

- `user-read-currently-playing` - Música atual
- `user-read-recently-played` - Músicas recentes
- `user-read-playback-state` - Estado de reprodução

### Exemplo de Contexto Gerado:

```
CONTEXTO DA VIBE (SPOTIFY):
- Música atual: "Bohemian Rhapsody" de Queen
- Últimas músicas: "Stairway to Heaven" de Led Zeppelin, "Hotel California" de Eagles

Use essas informações para entender melhor o estado emocional e a vibe da pessoa.
```

## Arquivos Relacionados

- `app/api/spotify/auth/route.ts` - Gera URL de autorização
- `app/api/spotify/callback/route.ts` - Recebe callback e salva tokens
- `app/api/spotify/current/route.ts` - Busca música atual
- `app/api/spotify/recent/route.ts` - Busca músicas recentes
- `app/api/chat/route.ts` - Integra contexto do Spotify no prompt da IA
- `supabase_migration_spotify.sql` - Schema para salvar tokens

## Testando a Integração

1. Faça login no desabafo.io
2. Vá em `/account`
3. Conecte sua conta Spotify
4. Inicie uma conversa no chat
5. A IA vai automaticamente considerar suas músicas no contexto!

## Importante

⚠️ **Não esqueça de:**
- Adicionar ambas as URLs de redirect (desenvolvimento e produção)
- Salvar Client ID e Client Secret como variáveis de ambiente
- Atualizar `SPOTIFY_REDIRECT_URI` para apontar para sua URL de produção

