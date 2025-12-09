# Configuração das Credenciais do Google Cloud

## Mudança Implementada

As credenciais do Google Cloud foram movidas de uma variável de ambiente (`GOOGLE_CLOUD_CREDENTIALS`) para um arquivo (`google-cloud-credentials.json`) para evitar exceder o limite de tamanho das variáveis de ambiente no Netlify.

## Arquivos Criados

1. **`google-cloud-credentials.json`** - Arquivo com as credenciais reais (adicionado ao `.gitignore`)
2. **`google-cloud-credentials.example.json`** - Arquivo de exemplo para documentação

## Ordem de Prioridade

O sistema agora tenta obter as credenciais na seguinte ordem:

1. **Arquivo `google-cloud-credentials.json`** (desenvolvimento local)
   - Lê o arquivo na raiz do projeto
   - Ideal para desenvolvimento local

2. **Variáveis individuais** (produção - Netlify)
   - `GOOGLE_PRIVATE_KEY`
   - `GOOGLE_CLIENT_EMAIL`
   - `GOOGLE_CLOUD_PROJECT_ID`
   - `GOOGLE_PRIVATE_KEY_ID` (opcional)
   - `GOOGLE_CLIENT_ID` (opcional)
   - `GOOGLE_CLIENT_CERT_URL` (opcional)

3. **Variável `GOOGLE_CLOUD_CREDENTIALS`** (fallback)
   - JSON completo como string
   - Mantido para compatibilidade

## Configuração Local

1. Copie o arquivo de exemplo:
   ```bash
   cp google-cloud-credentials.example.json google-cloud-credentials.json
   ```

2. Preencha o arquivo `google-cloud-credentials.json` com suas credenciais reais.

3. O arquivo já está no `.gitignore`, então não será commitado.

## Configuração no Netlify (Produção)

Para produção, continue usando as variáveis individuais no Netlify:

- `GOOGLE_PRIVATE_KEY` - A chave privada (com `\n` para quebras de linha)
- `GOOGLE_CLIENT_EMAIL` - Email da service account
- `GOOGLE_CLOUD_PROJECT_ID` - ID do projeto

**Importante:** Você pode remover a variável `GOOGLE_CLOUD_CREDENTIALS` do Netlify, pois não é mais necessária.

## Segurança

- ✅ O arquivo `google-cloud-credentials.json` está no `.gitignore`
- ✅ Nunca commite credenciais reais no repositório
- ✅ Use o arquivo de exemplo para documentação
- ✅ Em produção, use variáveis de ambiente individuais

