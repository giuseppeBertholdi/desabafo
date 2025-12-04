# 🔐 Melhorias de Segurança Implementadas

## 📊 Resumo das Melhorias

✅ **Autenticação e Autorização**  
✅ **Validação de Planos (PRO vs FREE)**  
✅ **Sanitização de Entradas**  
✅ **Rate Limiting**  
✅ **Proteções Anti-Abuse**  
✅ **Validação de Idade**

---

## 🛡️ 1. Sistema de Autorização por Plano

### Arquivo: `lib/planAuthorization.ts`

**Funcionalidades:**

- ✅ Verificação automática de plano (FREE vs PRO)
- ✅ Limites mensais para plano FREE
- ✅ Sanitização de inputs (prevenir XSS e injeções)
- ✅ Validação de idade (COPPA compliance)
- ✅ Respostas padronizadas para erros de autorização

**Limites do Plano FREE:**
```
- Chat: 100 mensagens/mês
- Journal: 10 entradas/mês
- Insights: 3 análises/mês
```

**Limites do Plano PRO:**
```
- Tudo ilimitado
- Acesso exclusivo a chat por voz
- Insights personalizados
- Análise de sentimentos avançada
```

---

## 🔒 2. APIs Protegidas

### 2.1 Chat API (`/api/chat`)

**Proteções Implementadas:**

✅ Autenticação obrigatória  
✅ Limite de 100 mensagens/mês para FREE  
✅ Sanitização de todas as mensagens  
✅ Limite de 50 mensagens por contexto (anti-abuse)  
✅ Limite de 5000 caracteres por mensagem  
✅ Detecção de emergências (suicídio)  
✅ Rate limiting via middleware

**Antes:**
```typescript
// Sem validação de plano
// Sem sanitização
// Sem limites claros
```

**Depois:**
```typescript
// Validação de plano
const limitCheck = await checkMonthlyLimit(userId, 'chat_messages')
if (!limitCheck.isAuthorized) {
  return limitExceededResponse(limitCheck)
}

// Sanitização
const sanitized = messages.map(msg => ({
  ...msg,
  content: sanitizeInput(msg.content, 5000)
}))
```

---

### 2.2 Voice APIs (`/api/voice/transcribe` e `/api/voice/synthesize`)

**Proteções Implementadas:**

✅ Exclusivo para plano PRO  
✅ Autenticação obrigatória  
✅ Verificação de credenciais Google Cloud  
✅ Validação de formato de áudio

**Antes:**
```typescript
// Qualquer usuário poderia usar voz
```

**Depois:**
```typescript
// Requer plano PRO
const planCheck = await requireProPlan(userId, 'Chat por voz')
if (!planCheck.isAuthorized) {
  return unauthorizedResponse(planCheck.message, planCheck.plan)
}
```

---

### 2.3 Insights APIs

**`/api/insights/summary`:**
- ✅ Exclusivo PRO
- ✅ Autenticação verificada
- ✅ Sanitização de inputs

**`/api/insights/analyze-sentiments`:**
- ✅ Autenticação verificada
- ✅ Sanitização de mensagens
- ✅ Limite de 15 mensagens por análise
- ✅ Limite de 100 chars por mensagem

---

### 2.4 Journal APIs

**`/api/journal/suggest`:**
- ✅ Sanitização de texto
- ✅ Limite de 200 caracteres
- ✅ Validação de tamanho mínimo (10 chars)

---

## 🛡️ 3. Funções de Segurança

### 3.1 Sanitização de Entrada

```typescript
sanitizeInput(input: string, maxLength: number)
```

**Proteções:**
- Remove tags HTML
- Remove scripts e eventos JavaScript
- Remove `javascript:` URIs
- Limita tamanho do texto
- Trim de espaços

**Uso:**
```typescript
const clean = sanitizeInput(userInput, 5000)
```

---

### 3.2 Validação de Idade

```typescript
validateAge(birthDate: Date | string)
```

**Regras:**
- Mínimo 13 anos (COPPA)
- Aviso para menores de 18
- Validação de data

**Retorno:**
```typescript
{
  isValid: boolean
  age: number
  message?: string
}
```

---

### 3.3 Verificação de Plano

```typescript
checkUserPlan(userId: string): Promise<PlanType>
requireProPlan(userId: string, feature: string)
checkMonthlyLimit(userId, limitType)
```

---

## 🚨 4. Respostas de Erro Padronizadas

### 4.1 Não Autorizado (403)

```json
{
  "error": "Chat por voz disponível apenas no plano PRO",
  "plan": "free",
  "upgradeUrl": "/pricing"
}
```

### 4.2 Limite Excedido (429)

```json
{
  "error": "Você atingiu o limite de 100 chat_messages do plano gratuito este mês",
  "plan": "free",
  "limit": 100,
  "remaining": 0,
  "upgradeUrl": "/pricing"
}
```

---

## 🔐 5. Middleware e Rate Limiting

### 5.1 Middleware de Autenticação

**Arquivo:** `middleware.ts`

**Rotas Protegidas:**
- `/home`
- `/chat`
- `/history`
- `/insights`
- `/pricing`
- `/account`
- `/onboarding`

**Proteção:**
```typescript
if (!session) {
  return NextResponse.redirect(new URL('/login', req.url))
}
```

---

### 5.2 Rate Limiting

**Arquivo:** `lib/rateLimitMiddleware.ts`

**Limites por Plano:**

**FREE:**
- Chat: 10 requests/hora
- Insights: 5 requests/hora
- Journal: 10 requests/hora
- General: 100 requests/minuto

**PRO:**
- Chat: 1000 requests/hora
- Insights: 100 requests/hora
- Journal: 1000 requests/hora
- General: 1000 requests/minuto

---

## 👶 6. Proteção para Menores

### 6.1 Validação de Idade no Onboarding

**Regras:**
- Bloqueio para menores de 13 anos (COPPA)
- Aviso e recomendações para 13-17 anos
- Armazenamento seguro da data de nascimento

### 6.2 Detecção de Emergências

**Palavras-chave monitoradas:**
- Suicídio e auto-lesão
- Métodos específicos
- Intenções e sentimentos de risco
- Planos e preparação

**Resposta Automática:**
```
Mensagem de apoio com:
- CVV: 188 (24h, grátis)
- Pode Falar: 0800 888 8000
- Chat online
- Encorajamento para buscar ajuda profissional
```

---

## ✅ 7. Checklist de Segurança

### APIs
- [x] Autenticação em todas as rotas sensíveis
- [x] Validação de plano onde necessário
- [x] Sanitização de inputs
- [x] Rate limiting implementado
- [x] Limites de uso mensal
- [x] Validação de tipos e tamanhos

### Frontend
- [ ] Validação de formulários client-side
- [ ] Feedback visual de erros
- [ ] Mensagens de upgrade para PRO
- [ ] Loading states em todas as ações

### Dados
- [x] RLS (Row Level Security) no Supabase
- [x] Service Role apenas em backend
- [x] Queries filtradas por user_id
- [x] Sem exposição de dados sensíveis

### Compliance
- [x] COPPA (menores de 13)
- [x] Aviso para menores de 18
- [x] Detecção de emergências
- [x] Política de privacidade (implementar)
- [ ] Termos de uso (implementar)

---

## 📈 8. Próximas Melhorias

### Curto Prazo
- [ ] Adicionar CAPTCHA em registro
- [ ] Implementar 2FA opcional
- [ ] Log de ações suspeitas
- [ ] Alertas para múltiplas tentativas falhas

### Médio Prazo
- [ ] Auditoria de segurança completa
- [ ] Penetration testing
- [ ] Implementar CSP headers
- [ ] CORS configuração refinada

### Longo Prazo
- [ ] Certificação de segurança
- [ ] Bug bounty program
- [ ] Monitoramento em tempo real
- [ ] Machine learning para detecção de abuse

---

## 🎯 9. Testes de Segurança

### Como Testar

**1. Teste de Limite FREE:**
```bash
# Fazer 101 mensagens no chat em um mês
# Deve bloquear na 101ª mensagem
```

**2. Teste de Feature PRO:**
```bash
# Tentar acessar /api/voice/transcribe sem plano PRO
# Deve retornar 403
```

**3. Teste de Sanitização:**
```bash
# Enviar: "<script>alert('xss')</script>"
# Deve remover tags e retornar texto limpo
```

**4. Teste de Idade:**
```bash
# Cadastrar com data nascimento < 13 anos
# Deve bloquear registro
```

---

## 📞 Contato de Segurança

Se encontrar vulnerabilidades:
1. **NÃO** poste publicamente
2. Entre em contato privadamente
3. Aguarde resposta em até 48h
4. Possível recompensa para bugs críticos

---

**Última Atualização:** Dezembro 2025  
**Status:** ✅ Implementado e Funcional  
**Próxima Revisão:** Após deployment em produção

