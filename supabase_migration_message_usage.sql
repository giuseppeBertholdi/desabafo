-- Tabela para rastrear uso de mensagens por usuário
CREATE TABLE IF NOT EXISTS message_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  messages_sent INTEGER NOT NULL DEFAULT 0,
  month_year TEXT NOT NULL, -- Formato: "2024-12" para rastrear por mês
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, month_year)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_message_usage_user_id ON message_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_message_usage_month_year ON message_usage(month_year);
CREATE INDEX IF NOT EXISTS idx_message_usage_user_month ON message_usage(user_id, month_year);

-- RLS (Row Level Security) - Políticas de segurança
ALTER TABLE message_usage ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes (se houver) para evitar erros
DROP POLICY IF EXISTS "Users can view their own message usage" ON message_usage;
DROP POLICY IF EXISTS "Users can create their own message usage" ON message_usage;
DROP POLICY IF EXISTS "Users can update their own message usage" ON message_usage;

-- Política: usuários só podem ver seu próprio uso
CREATE POLICY "Users can view their own message usage"
  ON message_usage FOR SELECT
  USING (auth.uid() = user_id);

-- Política: usuários podem criar seu próprio registro de uso
CREATE POLICY "Users can create their own message usage"
  ON message_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: usuários só podem atualizar seu próprio uso
CREATE POLICY "Users can update their own message usage"
  ON message_usage FOR UPDATE
  USING (auth.uid() = user_id);

-- Remover trigger existente (se houver) para evitar erros
DROP TRIGGER IF EXISTS update_message_usage_updated_at ON message_usage;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_message_usage_updated_at
  BEFORE UPDATE ON message_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentários na tabela
COMMENT ON TABLE message_usage IS 'Rastreia o uso de mensagens enviadas por usuário por mês';
COMMENT ON COLUMN message_usage.messages_sent IS 'Total de mensagens enviadas no mês';
COMMENT ON COLUMN message_usage.month_year IS 'Mês e ano no formato YYYY-MM';

