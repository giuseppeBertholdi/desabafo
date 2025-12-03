-- Adicionar campo tema na tabela chat_sessions
ALTER TABLE chat_sessions
ADD COLUMN IF NOT EXISTS tema TEXT;

-- Criar índice para melhor performance nas consultas por tema
CREATE INDEX IF NOT EXISTS idx_chat_sessions_tema 
ON chat_sessions(user_id, tema) 
WHERE tema IS NOT NULL;

