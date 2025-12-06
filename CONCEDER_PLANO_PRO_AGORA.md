# 🎯 Conceder Plano Pro para giuseppe.bertholdi@gmail.com

## Opção 1: Via Script Shell (Mais Fácil) ⚡

Execute no terminal:

```bash
bash CONCEDER_PLANO_PRO.sh
```

Ou execute diretamente:

```bash
curl -X POST "https://desabafo.site/api/admin/grant-pro" \
  -H "Content-Type: application/json" \
  -d '{"email":"giuseppe.bertholdi@gmail.com","planType":"monthly"}'
```

## Opção 2: Via Navegador (Mais Simples) 🌐

Abra este link no navegador (vai dar erro, mas você pode usar o console):

Ou use este comando no console do navegador (F12):

```javascript
fetch('https://desabafo.site/api/admin/grant-pro', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'giuseppe.bertholdi@gmail.com', planType: 'monthly' })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

## Opção 3: Via Terminal Local (Se tiver acesso ao servidor)

```bash
npx tsx scripts/grant-pro.ts giuseppe.bertholdi@gmail.com monthly
```

---

## ✅ Verificar se Funcionou

1. Faça login com `giuseppe.bertholdi@gmail.com`
2. Acesse `/home`
3. Verifique se aparece "Plano Pro" ou se o botão de modo voz está habilitado
4. Ou acesse diretamente `/chat?mode=voice`

---

## 🔍 Verificar no Banco de Dados

Se quiser verificar diretamente no Supabase:

1. Acesse o Supabase Dashboard
2. Vá para a tabela `user_subscriptions`
3. Procure pelo `user_id` do seu email
4. Verifique se `status` está como `active` ou `trialing`

---

## ⚠️ Nota

O plano será concedido com **1 ano de trial** (não será cobrado). Após isso, você pode renovar manualmente se necessário.

