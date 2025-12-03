# Configuração da Integração com Spotify

## 1. Configurar no Spotify Developer Dashboard

1. Acesse [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. Faça login com sua conta Spotify
3. Crie um novo app ou selecione um existente
4. Anote o **Client ID** e **Client Secret**

## 2. Configurar Redirect URI

No dashboard do Spotify, vá em **Settings** e adicione a seguinte URL de redirecionamento:

```
http://127.0.0.1:3000/callback
```

**Importante:** O Spotify não aceita `localhost`, então use `127.0.0.1` para desenvolvimento local.

Para produção, adicione também:
```
https://seu-dominio.com/callback
```

## 3. Configurar Variáveis de Ambiente

Adicione as seguintes variáveis no arquivo `.env.local`:

```env
SPOTIFY_CLIENT_ID=seu-client-id-aqui
SPOTIFY_CLIENT_SECRET=seu-client-secret-aqui
SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/callback
```

**Nota:** Se não configurar essas variáveis, o sistema usará os valores padrão fornecidos.

## 4. Executar Migração do Banco de Dados

Execute o arquivo SQL no Supabase para adicionar os campos necessários:

```sql
-- Arquivo: supabase_migration_spotify.sql
```

No Supabase Dashboard:
1. Vá em **SQL Editor**
2. Cole o conteúdo do arquivo `supabase_migration_spotify.sql`
3. Execute a query

## 5. Como Funciona

### Autenticação
- O usuário clica em "Conectar" na página de configurações
- É redirecionado para o Spotify para autorizar
- Após autorizar, retorna para `/callback`
- Os tokens são salvos no banco de dados

### Detecção de Vibe
- A cada mensagem no chat, o sistema busca:
  - Música atual tocando no Spotify
  - Últimas 5 músicas ouvidas
- Essas informações são passadas para a IA como contexto
- A IA usa essas informações para entender melhor o estado emocional do usuário

### Renovação de Token
- Os tokens do Spotify expiram após 1 hora
- O sistema renova automaticamente usando o refresh token
- Não é necessário reconectar manualmente

## 6. Permissões Solicitadas

O app solicita as seguintes permissões (scopes):
- `user-read-currently-playing`: Para ver a música atual
- `user-read-recently-played`: Para ver as últimas músicas
- `user-read-playback-state`: Para ver o estado de reprodução

## 7. Troubleshooting

### Erro: "invalid_client"
- Verifique se o Client ID e Secret estão corretos
- Certifique-se de que copiou os valores corretos do dashboard

### Erro: "redirect_uri_mismatch"
- Verifique se a URL de redirecionamento no dashboard do Spotify está exatamente igual à configurada
- Use `127.0.0.1` em vez de `localhost` para desenvolvimento

### Token expirado
- O sistema deve renovar automaticamente
- Se não renovar, o usuário precisará reconectar

### Música não aparece
- Verifique se o Spotify está tocando música
- Verifique se o usuário autorizou as permissões necessárias
- Alguns dispositivos podem não reportar a música atual

