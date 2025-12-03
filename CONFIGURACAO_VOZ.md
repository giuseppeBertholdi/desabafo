# Configuração do Modo Voz

O modo voz utiliza as APIs do Google Cloud para transcrever e sintetizar voz.

## Requisitos

1. Conta no Google Cloud Platform
2. Projeto criado no GCP
3. APIs habilitadas:
   - Cloud Speech-to-Text API
   - Cloud Text-to-Speech API
4. Credenciais de serviço (Service Account)

## Passo a Passo

### 1. Criar Projeto no Google Cloud

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Anote o **Project ID**

### 2. Habilitar APIs

1. No menu, vá em **APIs & Services** > **Library**
2. Procure e habilite:
   - **Cloud Speech-to-Text API**
   - **Cloud Text-to-Speech API**

### 3. Criar Service Account

1. Vá em **IAM & Admin** > **Service Accounts**
2. Clique em **Create Service Account**
3. Dê um nome (ex: `desabafo-voice`)
4. Clique em **Create and Continue**
5. Selecione a role: **Cloud Speech Client** e **Cloud TTS Client**
6. Clique em **Done**

### 4. Gerar Chave JSON

1. Clique na service account criada
2. Vá na aba **Keys**
3. Clique em **Add Key** > **Create new key**
4. Selecione **JSON**
5. Baixe o arquivo JSON

### 5. Configurar Variáveis de Ambiente

Adicione ao arquivo `.env.local`:

```env
GOOGLE_CLOUD_PROJECT_ID=seu-project-id
GOOGLE_CLOUD_CREDENTIALS={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}
```

**Importante**: 
- O `GOOGLE_CLOUD_CREDENTIALS` deve ser o conteúdo completo do arquivo JSON convertido para uma string JSON válida (uma linha).
- **NÃO** adicione quebras de linha dentro do JSON
- Se o arquivo JSON tiver quebras de linha, você precisa convertê-lo para uma única linha
- Exemplo de conversão: use `jq -c .` no terminal ou uma ferramenta online para minificar o JSON

**Dica**: Se você está tendo problemas com o formato, você pode:
1. Abrir o arquivo JSON baixado
2. Copiar todo o conteúdo
3. Usar uma ferramenta online como https://jsonformatter.org/json-minify para minificar
4. Colar o resultado (tudo em uma linha) no `.env.local`

### 6. Instalar Dependências

```bash
npm install @google-cloud/speech @google-cloud/text-to-speech
```

## Custos

### Speech-to-Text
- Primeiros 60 minutos/mês: **GRÁTIS**
- Após: ~$0.006 por 15 segundos (modelo padrão)
- Modelo `latest_long`: ~$0.009 por 15 segundos

### Text-to-Speech
- Primeiros 1-4 milhões de caracteres/mês: **GRÁTIS** (dependendo da voz)
- Voz Neural (pt-BR-Neural2-C): ~$16 por 1 milhão de caracteres após o free tier

**Dica**: Para reduzir custos, limite o tamanho das respostas de texto antes de sintetizar (já implementado: máximo 5000 caracteres).

## Segurança

⚠️ **NUNCA** commite o arquivo JSON de credenciais no Git!

O arquivo `.env.local` já está no `.gitignore` por padrão.

## Testando

1. Inicie o servidor: `npm run dev`
2. Acesse `/home` e clique em "modo voz"
3. Permita o acesso ao microfone quando solicitado
4. Clique no botão de gravação e fale
5. A resposta será transcrita, processada e reproduzida em áudio

## Troubleshooting

### Erro: "Não foi possível acessar o microfone"
- Verifique as permissões do navegador
- Certifique-se de estar usando HTTPS (ou localhost)

### Erro: "Erro ao transcrever áudio"
- Verifique se as APIs estão habilitadas
- Verifique se as credenciais estão corretas
- Verifique se há créditos no projeto GCP

### Erro: "Erro ao gerar áudio"
- Verifique se a API Text-to-Speech está habilitada
- Verifique os limites de quota do projeto

