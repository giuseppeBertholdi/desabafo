# 🔧 Como Corrigir o Erro: "API key not valid"

## ❌ Erro Identificado

O log mostra claramente:
```
API key not valid. Please pass a valid API key.
reason: 'API_KEY_INVALID'
```

Isso significa que a chave da API do Gemini configurada no Netlify está **inválida, expirada ou não configurada**.

## ✅ Solução: Configurar Chave Válida no Netlify

### Passo 1: Obter uma Nova Chave da API do Google Gemini

1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey) ou [Google Cloud Console](https://console.cloud.google.com/)
2. Vá em **APIs & Services** → **Credentials**
3. Clique em **Create Credentials** → **API Key**
4. Selecione o projeto correto
5. Copie a chave gerada (começa com `AIza...`)

**OU** se você já tem uma chave:
- Verifique se ela está ativa e não expirou
- Verifique se a API do Gemini está habilitada no projeto

### Passo 2: Configurar no Netlify

1. Acesse o painel do Netlify
2. Vá em **Site Settings** → **Environment Variables**
3. Procure pela variável `GEMINI_API_KEY`
4. Se existir:
   - Clique em **Edit**
   - Cole a nova chave válida
   - Clique em **Save**
5. Se não existir:
   - Clique em **Add variable**
   - Nome: `GEMINI_API_KEY`
   - Valor: Cole a chave da API (começa com `AIza...`)
   - Clique em **Save**

### Passo 3: Verificar se a API está Habilitada

No Google Cloud Console:

1. Vá em **APIs & Services** → **Library**
2. Procure por **Generative Language API** ou **Gemini API**
3. Certifique-se de que está **ENABLED**
4. Se não estiver, clique em **Enable**

### Passo 4: Fazer Redeploy

Após configurar a chave:

1. No Netlify, vá em **Deploys**
2. Clique em **Trigger deploy** → **Clear cache and deploy site**
3. Aguarde o deploy completar

### Passo 5: Testar

1. Acesse o site em produção
2. Tente enviar uma mensagem no chat
3. Verifique se funciona corretamente

## 🔍 Verificação Adicional

### Verificar se a Chave Está Configurada Corretamente

Após o deploy, verifique os logs do Netlify:

1. Vá em **Functions** → **Logs**
2. Procure por mensagens como:
   - ✅ `GEMINI_API_KEY configurada` (se adicionarmos esse log)
   - ❌ `GEMINI_API_KEY não está configurada!` (erro)
   - ❌ `API key not valid` (chave inválida)

### Testar a Chave Localmente (Opcional)

Se quiser testar antes de fazer deploy:

1. Crie/edite o arquivo `.env.local` na raiz do projeto:
```env
GEMINI_API_KEY=sua_chave_aqui
```

2. Execute localmente:
```bash
npm run dev
```

3. Teste o chat localmente

## ⚠️ Importante

- **NUNCA** compartilhe sua chave da API publicamente
- **NUNCA** commite a chave no Git (ela já está no `.gitignore`)
- A chave deve começar com `AIza...`
- Se a chave expirar ou for revogada, você precisará gerar uma nova

## 📝 Checklist

- [ ] Chave da API do Gemini gerada/obtida
- [ ] API do Gemini habilitada no Google Cloud Console
- [ ] Variável `GEMINI_API_KEY` configurada no Netlify
- [ ] Redeploy feito no Netlify
- [ ] Teste realizado e funcionando

## 🆘 Se Ainda Não Funcionar

1. Verifique os logs do Netlify para erros específicos
2. Verifique se a chave está correta (sem espaços extras)
3. Verifique se a API está habilitada no Google Cloud
4. Tente gerar uma nova chave da API
5. Verifique se há limites de quota no Google Cloud Console

## 🔗 Links Úteis

- [Google AI Studio - API Keys](https://makersuite.google.com/app/apikey)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Documentação do Gemini API](https://ai.google.dev/docs)

