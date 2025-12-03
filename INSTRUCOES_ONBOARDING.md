# Instruções para Configurar o Onboarding

## 1. Executar o Schema SQL no Supabase

1. Acesse o painel do Supabase: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor** (no menu lateral)
4. Clique em **New Query**
5. Cole o conteúdo do arquivo `supabase_onboarding_schema.sql`
6. Clique em **Run** para executar

Isso criará a tabela `user_profiles` com as seguintes colunas:
- `id`: UUID único
- `user_id`: Referência ao usuário autenticado
- `nickname`: Nome/apelido do usuário
- `preferred_name`: Como prefere ser chamado
- `preferences`: JSON com interesses e preferências
- `current_state`: Estado emocional atual
- `onboarding_completed`: Boolean indicando se completou o onboarding
- `created_at` e `updated_at`: Timestamps automáticos

## 2. Como Funciona

### Fluxo do Onboarding:

1. **Novo usuário faz login** → É redirecionado para `/onboarding`
2. **Onboarding com 4 etapas**:
   - **Etapa 1**: Nome/apelido e como prefere ser chamado
   - **Etapa 2**: Seleção de temas de interesse
   - **Etapa 3**: Como está se sentindo atualmente
   - **Etapa 4**: O que está buscando na plataforma
3. **Dados salvos no Supabase** → Tabela `user_profiles`
4. **Redirecionamento para `/home`** → Usa o nickname do perfil

### Proteção de Rotas:

- Usuários que não completaram o onboarding são automaticamente redirecionados para `/onboarding`
- A verificação acontece em:
  - `/home` (página principal)
  - `/auth/callback` (após login)

## 3. Dados Coletados

O onboarding coleta:
- **Nickname**: Nome ou apelido do usuário
- **Preferred Name**: Como prefere ser chamado (você, tu, etc.)
- **Interests**: Array de temas de interesse selecionados
- **Current State**: Estado emocional atual
- **What Looking For**: Texto livre sobre o que está buscando

Todos os dados são salvos de forma segura no Supabase com RLS (Row Level Security) ativado.

