# 🔍 Debug de Autenticação

## Passo 1: Verificar variáveis de ambiente

Confirme que o arquivo `.env.local` existe e tem este formato:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

## Passo 2: Verificar configuração no Google Cloud Console

1. Acesse https://console.cloud.google.com
2. Vá em **APIs & Services** > **Credentials**
3. Selecione seu OAuth 2.0 Client ID
4. Verifique se está configurado:
   - **Authorized redirect URIs**: `https://SEU_PROJETO.supabase.co/auth/v1/callback`

## Passo 3: Verificar configuração no Supabase

1. Acesse seu projeto no Supabase
2. Vá em **Authentication** > **Providers**
3. Configure o Google provider com:
   - **Client ID** do Google
   - **Client Secret** do Google
4. Em **URL Configuration**, adicione:
   - **Site URL**: `http://localhost:3000`
   - **Redirect URLs**: `http://localhost:3000/dashboard`
   
**IMPORTANTE**: O Supabase usa automaticamente `/auth/v1/callback` como callback. Você não precisa criar essa rota!

## Passo 4: Testar o fluxo

1. **Limpe todos os cookies do navegador**:
   - F12 → Application → Cookies → Delete All

2. **Pare e reinicie o servidor**:
   ```bash
   # Ctrl+C para parar
   npm run dev
   ```

3. **Tente fazer login novamente**

4. **Observe os logs no terminal**. Você deve ver:
   - `📍 Callback chamado, code: presente`
   - `✅ Sessão criada com sucesso para: seu@email.com`

## Erros comuns:

### "Request rate limit reached"
- Você está tentando fazer muitas requisições rapidamente
- **Solução**: Aguarde 1 minuto antes de tentar novamente

### "Invalid Refresh Token"
- Token expirado ou inválido
- **Solução**: Limpe os cookies e faça login novamente

### "code: ausente"
- O Google não está enviando o código de autorização
- **Solução**: Verifique a configuração das URLs de redirect

### Redirecionado para landing page
- O callback não está recebendo o código
- **Solução**: Verifique os logs no terminal para ver qual mensagem aparece

