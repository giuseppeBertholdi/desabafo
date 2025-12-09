-- Tabela para rastrear uso de minutos de voz por usuário
CREATE TABLE IF NOT EXISTS voice_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  minutes_used DECIMAL(10, 2) NOT NULL DEFAULT 0,
  month_year TEXT NOT NULL, -- Formato: "2024-12" para rastrear por mês
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, month_year)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_voice_usage_user_id ON voice_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_usage_month_year ON voice_usage(month_year);
CREATE INDEX IF NOT EXISTS idx_voice_usage_user_month ON voice_usage(user_id, month_year);

-- RLS (Row Level Security) - Políticas de segurança
ALTER TABLE voice_usage ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes (se houver) para evitar erros
DROP POLICY IF EXISTS "Users can view their own voice usage" ON voice_usage;
DROP POLICY IF EXISTS "Users can create their own voice usage" ON voice_usage;
DROP POLICY IF EXISTS "Users can update their own voice usage" ON voice_usage;

-- Política: usuários só podem ver seu próprio uso
CREATE POLICY "Users can view their own voice usage"
  ON voice_usage FOR SELECT
  USING (auth.uid() = user_id);

-- Política: usuários podem criar seu próprio registro de uso
CREATE POLICY "Users can create their own voice usage"
  ON voice_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: usuários só podem atualizar seu próprio uso
CREATE POLICY "Users can update their own voice usage"
  ON voice_usage FOR UPDATE
  USING (auth.uid() = user_id);

-- Remover trigger existente (se houver) para evitar erros
DROP TRIGGER IF EXISTS update_voice_usage_updated_at ON voice_usage;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_voice_usage_updated_at
  BEFORE UPDATE ON voice_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentários na tabela
COMMENT ON TABLE voice_usage IS 'Rastreia o uso de minutos de voz por usuário por mês';
COMMENT ON COLUMN voice_usage.minutes_used IS 'Total de minutos usados no mês';
COMMENT ON COLUMN voice_usage.month_year IS 'Mês e ano no formato YYYY-MM';

