# 🚀 Solução Rápida - Plano PRO

## ⚠️ Problema
Erro ao criar sessão de voz: "Modo voz disponível apenas no plano PRO"

## ✅ Solução em 3 Passos

### Passo 1: Aplicar SQL no Supabase

1. Acesse: https://app.supabase.com
2. Selecione seu projeto "desabafo"
3. Vá em **SQL Editor** (no menu lateral)
4. Clique em **New Query**
5. Cole o conteúdo do arquivo `conceder_plano_pro_manual.sql`
6. Clique em **Run** (ou pressione Ctrl+Enter)

### Passo 2: Verificar se Funcionou

Após executar o SQL, você deve ver na parte inferior:

```
NOTICE: SUCESSO: Plano PRO concedido para giuseppe.bertholdi@gmail.com!
NOTICE: User ID: (algum UUID)
```

E uma tabela mostrando:

| email | status | current_period_start | current_period_end |
|-------|--------|---------------------|-------------------|
| giuseppe.bertholdi@gmail.com | trialing | (data atual) | (data daqui 1 ano) |

✅ Se aparecer isso, está tudo certo!

### Passo 3: Testar no Site

1. **Limpe o cache** do navegador ou abra uma **aba anônima**
2. Faça **logout** e **login** novamente
3. Vá para `/chat?mode=voice`
4. Tente criar uma nova sessão de voz
5. Deve funcionar! 🎉

## 📝 O Que Mudou?

### Correção Aplicada
A API agora verifica o plano corretamente através da tabela `user_subscriptions` (onde o script `/admin/grant-pro` salva os dados).

**Antes** (errado):
```typescript
// Verificava campo "tier" em user_profiles (não existe)
const { data: profile } = await supabase
  .from('user_profiles')
  .select('tier')
  ...
```

**Depois** (correto):
```typescript
// Verifica através de user_subscriptions
const plan = await checkUserPlan(session.user.id)
// Esta função busca registros com status 'active' ou 'trialing'
```

## 🔍 Se Ainda Não Funcionar

### Debug no Console do Navegador

Abra o console (F12) e execute:

```javascript
// Verificar ID do usuário
const { data: { session } } = await supabase.auth.getSession()
console.log('User ID:', session.user.id)
console.log('Email:', session.user.email)

// Verificar assinatura
const { data: sub, error } = await supabase
  .from('user_subscriptions')
  .select('*')
  .eq('user_id', session.user.id)
  .maybeSingle()

console.log('Subscription:', sub)
console.log('Error:', error)

// Se sub for null ou error existir, há um problema!
```

### Verificar Logs da API

Abra o terminal onde o Next.js está rodando e veja se aparece:

```
User ID: ...
Verificando plano...
Plano detectado: free  // ❌ Se aparecer 'free', há problema
Plano detectado: pro   // ✅ Se aparecer 'pro', está correto
```

## 📞 Problemas Comuns

### "Tabela user_subscriptions não existe"
**Solução**: Execute o SQL do `conceder_plano_pro_manual.sql` - ele cria a tabela.

### "RLS error: new row violates row-level security"
**Solução**: Execute o SQL novamente - ele configura as políticas RLS.

### "Usuário não encontrado"
**Solução**: Verifique se você está logado com o email `giuseppe.bertholdi@gmail.com`.

### Cache do navegador
**Solução**: 
- Ctrl+Shift+R (hard refresh)
- Ou abra em aba anônima
- Ou limpe cookies do site

## 🎉 Resultado Esperado

Depois de aplicar a solução:

1. ✅ Criar sessão de voz funciona
2. ✅ Timer aparece
3. ✅ Contador mostra "50 de 50 restantes"
4. ✅ Botão do microfone habilitado
5. ✅ Sem erros 403

---

**Tempo estimado**: 2-3 minutos
**Dificuldade**: Fácil ⭐

Qualquer dúvida, veja `VERIFICAR_PLANO_PRO.md` para debug detalhado.

