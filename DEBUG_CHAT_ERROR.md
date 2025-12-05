# Debug: Erro "Desculpe, tive um problema ao processar sua mensagem"

## 🔍 Problema Identificado

Quando o usuário envia uma mensagem no chat, aparece o erro:
> "Desculpe, tive um problema ao processar sua mensagem. Pode tentar novamente?"

## ✅ Melhorias Implementadas

### 1. **Tratamento de Erros Melhorado na API** (`app/api/chat/route.ts`)

- ✅ Verificação se `GEMINI_API_KEY` está configurada antes de processar
- ✅ Mensagens de erro mais específicas baseadas no tipo de erro:
  - **Erro de autenticação (401/403)**: "Erro de configuração da API"
  - **Rate limit (429)**: "Muitas requisições. Aguarde um momento"
  - **Erro de validação (400)**: "Mensagem inválida"
  - **Erro genérico**: Mensagem amigável com log detalhado
- ✅ Logs mais detalhados para facilitar debug em produção

### 2. **Tratamento de Erros Melhorado no Cliente** (`app/chat/ChatClient.tsx`)

- ✅ Captura de erros mais específicos da resposta da API
- ✅ Mensagens de erro contextuais baseadas no tipo de erro
- ✅ Logs detalhados no console para debug
- ✅ Tratamento de diferentes tipos de erro (rate limit, autenticação, etc.)

### 3. **Validação de Configuração**

- ✅ Verificação inicial se `GEMINI_API_KEY` está configurada
- ✅ Retorno de erro 503 (Service Unavailable) se a chave não estiver configurada
- ✅ Prevenção de erros ao inicializar o cliente Gemini sem chave

## 🔧 O Que Verificar em Produção

### ⚠️ **PROBLEMA IDENTIFICADO: Chave da API Inválida**

O erro específico encontrado foi:
```
API key not valid. Please pass a valid API key.
reason: 'API_KEY_INVALID'
```

**Solução**: Veja o guia completo em `CORRIGIR_GEMINI_API_KEY.md`

### 1. **Variáveis de Ambiente**

Certifique-se de que a variável `GEMINI_API_KEY` está configurada **CORRETAMENTE** no Netlify:

1. Acesse **Site Settings → Environment Variables** no Netlify
2. Verifique se `GEMINI_API_KEY` está configurada
3. **IMPORTANTE**: A chave deve ser válida e começar com `AIza...`
4. Se a chave estiver inválida ou expirada, gere uma nova no [Google AI Studio](https://makersuite.google.com/app/apikey)
5. Atualize a variável no Netlify e faça redeploy

### 2. **Logs do Netlify**

Após fazer deploy, verifique os logs:

1. Acesse **Functions → Logs** no Netlify
2. Procure por erros relacionados a:
   - `GEMINI_API_KEY não está configurada`
   - `Erro na API do Gemini`
   - `Rate limit da API Gemini excedido`

### 3. **Possíveis Causas do Erro**

#### A. **Chave da API não configurada**
- **Sintoma**: Erro 503 ou mensagem sobre configuração
- **Solução**: Adicionar `GEMINI_API_KEY` no Netlify

#### B. **Rate Limit da API Gemini**
- **Sintoma**: Erro 429 ou mensagem sobre muitas requisições
- **Solução**: Verificar quota da API no Google Cloud Console

#### C. **Chave da API inválida ou expirada** ⚠️ **ESTE É O PROBLEMA ATUAL**
- **Sintoma**: Erro 400 com `API key not valid` ou `API_KEY_INVALID`
- **Solução**: 
  1. Gere uma nova chave no [Google AI Studio](https://makersuite.google.com/app/apikey)
  2. Atualize `GEMINI_API_KEY` no Netlify
  3. Certifique-se de que a API do Gemini está habilitada no Google Cloud
  4. Faça redeploy
  5. Veja o guia completo em `CORRIGIR_GEMINI_API_KEY.md`

#### D. **Erro de rede ou timeout**
- **Sintoma**: Erro genérico ou timeout
- **Solução**: Verificar conectividade e timeout do Netlify Functions

#### E. **Rate limiting interno**
- **Sintoma**: Erro 429 do próprio sistema
- **Solução**: Verificar configuração de rate limiting em `lib/rateLimit.ts`

### 4. **Como Testar**

1. **Teste básico**:
   - Envie uma mensagem simples no chat
   - Verifique se a resposta aparece normalmente

2. **Teste de erro**:
   - Se o erro aparecer, abra o console do navegador (F12)
   - Procure por logs detalhados do erro
   - Verifique os logs no Netlify

3. **Teste de rate limit**:
   - Envie várias mensagens rapidamente
   - Verifique se aparece mensagem de rate limit apropriada

## 📝 Próximos Passos

1. ✅ Fazer deploy das alterações
2. ✅ Verificar se `GEMINI_API_KEY` está configurada no Netlify
3. ✅ Testar envio de mensagem
4. ✅ Verificar logs se o erro persistir
5. ✅ Ajustar configurações conforme necessário

## 🔗 Arquivos Modificados

- `app/api/chat/route.ts` - Melhorias no tratamento de erros da API
- `app/chat/ChatClient.tsx` - Melhorias no tratamento de erros no cliente

## 💡 Dica

Se o erro persistir após verificar tudo acima, os logs detalhados agora vão mostrar exatamente qual é o problema. Verifique:
- Console do navegador (F12 → Console)
- Logs do Netlify (Functions → Logs)

