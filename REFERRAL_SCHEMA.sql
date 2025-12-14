-- Tabela para armazenar referências (convites)
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referral_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(referrer_id, referred_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referral_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_completed_at ON referrals(completed_at);

-- RLS (Row Level Security)
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver suas próprias referências (como referrer)
CREATE POLICY "Users can view their own referrals as referrer"
  ON referrals FOR SELECT
  USING (auth.uid() = referrer_id);

-- Política: Usuários podem ver se foram referidos
CREATE POLICY "Users can view if they were referred"
  ON referrals FOR SELECT
  USING (auth.uid() = referred_id);

-- Política: Permitir leitura pública de códigos de referência (para validação)
-- Isso permite que a API valide códigos sem autenticação
CREATE POLICY "Public can read referral codes for validation"
  ON referrals FOR SELECT
  USING (true);

-- Política: Usuários podem inserir suas próprias referências
CREATE POLICY "Users can insert their own referrals"
  ON referrals FOR INSERT
  WITH CHECK (auth.uid() = referrer_id);

-- Política: Sistema pode atualizar referências (para completar quando alguém se cadastra)
CREATE POLICY "Users can update referrals where they are referred"
  ON referrals FOR UPDATE
  USING (auth.uid() = referred_id)
  WITH CHECK (auth.uid() = referred_id);

-- Função para atualizar plano quando 5 referências são completadas
CREATE OR REPLACE FUNCTION check_and_update_referral_plan()
RETURNS TRIGGER AS $$
DECLARE
  referral_count INTEGER;
BEGIN
  -- Contar quantas referências completadas o referrer tem
  SELECT COUNT(*) INTO referral_count
  FROM referrals
  WHERE referrer_id = NEW.referrer_id
    AND completed_at IS NOT NULL;
  
  -- Se chegou a 5 referências, atualizar plano para Essential
  IF referral_count >= 5 THEN
    -- Verificar se o usuário já tem um plano pago
    IF NOT EXISTS (
      SELECT 1 FROM user_subscriptions
      WHERE user_id = NEW.referrer_id
        AND status IN ('active', 'trialing')
    ) THEN
      -- Criar uma "assinatura" especial para o plano Essential ganho por referência
      INSERT INTO user_subscriptions (
        user_id,
        stripe_subscription_id,
        stripe_customer_id,
        status,
        plan_type,
        current_period_start,
        current_period_end,
        created_at,
        updated_at
      ) VALUES (
        NEW.referrer_id,
        'referral_essential_' || NEW.referrer_id::TEXT,
        'referral_customer_' || NEW.referrer_id::TEXT,
        'active',
        'essential',
        NOW(),
        NOW() + INTERVAL '1 year', -- Plano válido por 1 ano
        NOW(),
        NOW()
      )
      ON CONFLICT (user_id) DO UPDATE
      SET 
        status = 'active',
        plan_type = 'essential',
        updated_at = NOW();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para executar a função quando uma referência é completada
CREATE TRIGGER trigger_check_referral_plan
  AFTER UPDATE OF completed_at ON referrals
  FOR EACH ROW
  WHEN (NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL)
  EXECUTE FUNCTION check_and_update_referral_plan();

