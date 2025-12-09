-- Adicionar campo plan_type na tabela user_subscriptions
-- Para diferenciar entre 'essential' e 'pro'

-- Adicionar coluna plan_type se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_subscriptions' 
    AND column_name = 'plan_type'
  ) THEN
    ALTER TABLE user_subscriptions 
    ADD COLUMN plan_type TEXT CHECK (plan_type IN ('essential', 'pro')) DEFAULT 'pro';
    
    -- Atualizar registros existentes para 'pro' (compatibilidade)
    UPDATE user_subscriptions 
    SET plan_type = 'pro' 
    WHERE plan_type IS NULL;
  END IF;
END $$;

-- Comentário na coluna
COMMENT ON COLUMN user_subscriptions.plan_type IS 'Tipo de plano: essential (sem voz) ou pro (com voz)';

