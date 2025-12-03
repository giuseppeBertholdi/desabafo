-- Criar tabela para entradas do diário
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  mood TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries (user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON journal_entries (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_tags ON journal_entries USING GIN (tags);

-- Habilitar RLS (Row Level Security)
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Política: usuários só podem ver suas próprias entradas
CREATE POLICY "Users can view own journal entries"
  ON journal_entries FOR SELECT
  USING (auth.uid() = user_id);

-- Política: usuários só podem criar suas próprias entradas
CREATE POLICY "Users can create own journal entries"
  ON journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: usuários só podem atualizar suas próprias entradas
CREATE POLICY "Users can update own journal entries"
  ON journal_entries FOR UPDATE
  USING (auth.uid() = user_id);

-- Política: usuários só podem deletar suas próprias entradas
CREATE POLICY "Users can delete own journal entries"
  ON journal_entries FOR DELETE
  USING (auth.uid() = user_id);

