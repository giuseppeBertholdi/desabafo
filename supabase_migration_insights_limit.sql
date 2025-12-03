-- Migração: Adicionar coluna para limitar mudança de período nos insights
-- Execute este SQL se você já tem a tabela user_profiles criada

-- Adicionar coluna last_insights_period_change se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'last_insights_period_change'
  ) THEN
    ALTER TABLE user_profiles 
    ADD COLUMN last_insights_period_change DATE;
  END IF;
END $$;

