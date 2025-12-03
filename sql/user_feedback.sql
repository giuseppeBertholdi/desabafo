-- Tabela para armazenar feedback dos usuários
CREATE TABLE IF NOT EXISTS user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  feedback TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_created_at ON user_feedback(created_at DESC);

-- RLS (Row Level Security)
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem inserir seus próprios feedbacks
CREATE POLICY "Users can insert their own feedback"
  ON user_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Nota: Para visualizar todos os feedbacks no Supabase Dashboard:
-- 1. Use a Service Role Key (bypassa RLS)
-- 2. Ou desative temporariamente o RLS para visualização
-- 3. Ou crie uma política de SELECT para admins (se necessário)

