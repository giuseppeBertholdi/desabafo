# ✅ Checklist de Deploy - desabafo.site

## 🎯 Configurações Necessárias (Faça em Ordem)

### 1. Netlify - Variáveis de Ambiente ⚙️

Acesse: **Netlify Dashboard → Site Settings → Environment Variables**

```env
# ===== COPIE E COLE NO NETLIFY =====

# URL Principal
NEXT_PUBLIC_APP_URL=https://desabafo.site

# Supabase (pegue do seu projeto Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui

# OpenAI
OPENAI_API_KEY=sua-key-openai

# Spotify
SPOTIFY_CLIENT_ID=seu-client-id-spotify
SPOTIFY_CLIENT_SECRET=seu-client-secret-spotify
SPOTIFY_REDIRECT_URI=https://desabafo.site/callback

# Google Cloud (SEPARADO - NÃO USE GOOGLE_CLOUD_CREDENTIALS)
GOOGLE_CLOUD_PROJECT_ID=seu-projeto-google
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
GOOGLE_CLIENT_EMAIL=email@projeto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY_ID=id-da-chave
GOOGLE_CLIENT_ID=id-do-cliente
```

**⚠️ REMOVER SE EXISTIR:**
- `GOOGLE_CLOUD_CREDENTIALS` (causa erro de limite de 4KB)

---

### 2. Supabase - URL Configuration 🔐

Acesse: **Supabase Dashboard → Authentication → URL Configuration**

**Site URL:**
```
https://desabafo.site
```

**Redirect URLs (adicione as duas):**
```
https://desabafo.site/auth/callback
https://desabafo.site/callback
```

---

### 3. Spotify Developer Dashboard 🎵

Acesse: https://developer.spotify.com/dashboard

1. Selecione seu app
2. Clique em **Settings**
3. Em **Redirect URIs**, adicione:

```
https://desabafo.site/callback
```

4. **Save**

✅ Mantenha também a de dev se necessário:
```
http://127.0.0.1:3000/callback
```

---

### 4. Configurar Domínio no Netlify 🌐

**Netlify Dashboard → Domain Settings**

1. Clique em **Add custom domain**
2. Digite: `desabafo.site`
3. Siga as instruções para configurar DNS

**O Netlify configurará HTTPS automaticamente** ✅

---

### 5. Deploy! 🚀

1. Faça commit das mudanças:
```bash
git add .
git commit -m "chore: configure production environment for desabafo.site"
git push origin main
```

2. No Netlify:
   - **Deploys → Trigger deploy**
   - Selecione: **Clear cache and deploy site**

---

## ✅ Testes Pós-Deploy

Acesse cada página e teste:

- [ ] https://desabafo.site (homepage)
- [ ] Login funciona
- [ ] Chat funciona
- [ ] Spotify conecta (em /account)
- [ ] Voz funciona (se configurado)
- [ ] Journal funciona
- [ ] HTTPS está ativo (cadeado verde)

---

## 🐛 Problemas Comuns

### ❌ "Environment variables exceed 4KB limit"
**Solução**: Remova `GOOGLE_CLOUD_CREDENTIALS` do Netlify e use as variáveis separadas

### ❌ "redirect_uri_mismatch" (Spotify)
**Solução**: Adicione `https://desabafo.site/callback` no Spotify Dashboard

### ❌ "Invalid redirect URL" (Supabase)
**Solução**: Adicione URLs no Supabase Authentication → URL Configuration

### ❌ Erro de CORS
**Solução**: Verifique se `NEXT_PUBLIC_APP_URL=https://desabafo.site`

---

## 📞 Precisa de Ajuda?

Veja o guia completo em: `PRODUCAO_DESABAFO_SITE.md`

---

**Status Atual**: Pronto para configurar ✅  
**Domínio**: desabafo.site  
**Última Atualização**: Dez 2025

