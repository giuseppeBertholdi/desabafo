-- Migração para criar tabela de sessões de voz
-- Esta tabela rastreia as sessões de voz dos usuários do plano pro

CREATE TABLE IF NOT EXISTS voice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Informações da sessão
  duration_seconds INTEGER NOT NULL DEFAULT 0, -- Duração total em segundos (máximo 600 = 10 min)
  is_completed BOOLEAN NOT NULL DEFAULT false, -- Se a sessão foi finalizada
  
  -- Transcrição e resumo
  transcript TEXT, -- Transcrição da conversa
  summary TEXT, -- Resumo gerado pela IA
  
  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_voice_sessions_user_id ON voice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_created_at ON voice_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_is_completed ON voice_sessions(is_completed);

-- RLS (Row Level Security)
ALTER TABLE voice_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Users can view their own voice sessions"
  ON voice_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own voice sessions"
  ON voice_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own voice sessions"
  ON voice_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own voice sessions"
  ON voice_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_voice_sessions_updated_at
  BEFORE UPDATE ON voice_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Função para contar sessões ativas (não completas) do usuário
CREATE OR REPLACE FUNCTION count_user_voice_sessions(p_user_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM voice_sessions
  WHERE user_id = p_user_id
  AND (is_completed = true OR ended_at IS NOT NULL);
$$ LANGUAGE SQL STABLE;

-- Função para obter a última sessão não finalizada
CREATE OR REPLACE FUNCTION get_last_incomplete_voice_session(p_user_id UUID)
RETURNS UUID AS $$
  SELECT id
  FROM voice_sessions
  WHERE user_id = p_user_id
  AND is_completed = false
  AND ended_at IS NULL
  ORDER BY created_at DESC
  LIMIT 1;
$$ LANGUAGE SQL STABLE;

