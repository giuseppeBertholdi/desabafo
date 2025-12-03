# ✅ Configuração Completa - Autenticação Google

## 1️⃣ Verifique o arquivo .env.local

Na raiz do projeto, crie/verifique o arquivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-key-aqui
```

**Onde encontrar:**
- Acesse seu projeto no Supabase
- Settings → API
- Copie `Project URL` e `anon public key`

---

## 2️⃣ Configure o Google Cloud Console

### Criar OAuth Client ID:

1. Acesse: https://console.cloud.google.com
2. Selecione seu projeto (ou crie um novo)
3. Vá em **APIs & Services** → **Credentials**
4. Clique em **+ CREATE CREDENTIALS** → **OAuth 2.0 Client IDs**
5. Configure:
   - **Application type**: Web application
   - **Name**: Desabafo (ou qualquer nome)
   - **Authorized redirect URIs**: 
     ```
     https://SEU_PROJETO.supabase.co/auth/v1/callback
     ```
     ⚠️ **IMPORTANTE**: Substitua `SEU_PROJETO` pela URL real do seu projeto Supabase!

6. Clique em **CREATE**
7. **COPIE** o `Client ID` e `Client Secret`

---

## 3️⃣ Configure o Supabase

### No painel do Supabase:

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Authentication** → **Providers**
4. Encontre **Google** e clique em **Enable**
5. Cole:
   - **Client ID** (do Google Cloud Console)
   - **Client Secret** (do Google Cloud Console)
6. Clique em **Save**

### Configure as URLs:

1. Ainda em **Authentication**, vá em **URL Configuration**
2. Configure:
   - **Site URL**: `http://localhost:3000`
   - **Redirect URLs**: 
     ```
     http://localhost:3000/**
     ```

---

## 4️⃣ Teste o Fluxo

### Passo a passo:

1. **Pare o servidor** (Ctrl+C no terminal)

2. **Limpe os cookies do navegador**:
   - Abra DevTools (F12)
   - Application → Cookies
   - Delete todos os cookies de localhost

3. **Reinicie o servidor**:
   ```bash
   npm run dev
   ```

4. **Teste o login**:
   - Acesse: `http://localhost:3000`
   - Clique em "começar grátis"
   - Clique em "continuar com o Google"
   - Escolha sua conta Google
   - **Você deve ser redirecionado para `/dashboard`** ✅

---

## 🐛 Problemas Comuns

### "Ficou só no login"
**Causa**: Redirect URI não configurado corretamente
**Solução**: 
- Verifique se no Google Cloud Console você adicionou: `https://SEU_PROJETO.supabase.co/auth/v1/callback`
- Verifique se no Supabase você adicionou: `http://localhost:3000/**` nas Redirect URLs

### "Request rate limit reached"
**Causa**: Muitas tentativas de login
**Solução**: Aguarde 1 minuto antes de tentar novamente

### "Invalid OAuth client"
**Causa**: Client ID ou Secret incorretos
**Solução**: Verifique se copiou corretamente do Google Cloud Console para o Supabase

### Email não aparece no dashboard
**Causa**: Sessão não foi criada corretamente
**Solução**: 
1. Limpe os cookies
2. Faça logout
3. Tente fazer login novamente

---

## 📝 Checklist Final

- [ ] Arquivo `.env.local` criado com as chaves corretas
- [ ] OAuth Client ID criado no Google Cloud Console
- [ ] Redirect URI configurado: `https://SEU_PROJETO.supabase.co/auth/v1/callback`
- [ ] Google Provider habilitado no Supabase
- [ ] Client ID e Secret colados no Supabase
- [ ] Site URL: `http://localhost:3000`
- [ ] Redirect URLs: `http://localhost:3000/**`
- [ ] Servidor reiniciado
- [ ] Cookies limpos

Se todos os itens estiverem marcados, o login deve funcionar! ✅

