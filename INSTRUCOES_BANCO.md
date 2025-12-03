# Instruções para Configurar o Banco de Dados

## 1. Acesse o Supabase

1. Vá para o seu projeto no Supabase
2. Acesse o **SQL Editor** no menu lateral

## 2. Execute o SQL

1. Copie todo o conteúdo do arquivo `supabase_schema.sql`
2. Cole no SQL Editor
3. Clique em **Run** para executar

## 3. Verificar se funcionou

Após executar, você deve ver:
- ✅ Tabela `chat_sessions` criada
- ✅ Tabela `chat_messages` criada
- ✅ Índices criados
- ✅ Políticas RLS (Row Level Security) ativadas
- ✅ Trigger para atualizar `updated_at` criado

## 4. Estrutura das Tabelas

### `chat_sessions`
- `id` (UUID) - ID único da sessão
- `user_id` (UUID) - ID do usuário (referência a auth.users)
- `title` (TEXT) - Título da conversa (opcional)
- `summary` (TEXT) - Resumo da conversa gerado pela IA
- `created_at` (TIMESTAMP) - Data de criação
- `updated_at` (TIMESTAMP) - Data da última atualização

### `chat_messages`
- `id` (UUID) - ID único da mensagem
- `session_id` (UUID) - ID da sessão (referência a chat_sessions)
- `role` (TEXT) - 'user' ou 'assistant'
- `content` (TEXT) - Conteúdo da mensagem
- `created_at` (TIMESTAMP) - Data de criação

## 5. Segurança

As políticas RLS garantem que:
- ✅ Usuários só veem suas próprias sessões
- ✅ Usuários só podem criar sessões para si mesmos
- ✅ Usuários só podem ver mensagens de suas próprias sessões

## Pronto! 🎉

Agora o sistema está pronto para salvar e recuperar conversas!

