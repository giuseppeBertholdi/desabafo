-- Script para conceder Plano PRO manualmente
-- Execute no Supabase Dashboard > SQL Editor

-- 1. Verificar se a tabela user_subscriptions existe
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 2. Habilitar RLS se ainda não estiver
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- 3. Criar política para permitir leitura
DROP POLICY IF EXISTS "Users can view their own subscription" ON user_subscriptions;
CREATE POLICY "Users can view their own subscription"
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- 4. Conceder Plano PRO para giuseppe.bertholdi@gmail.com
-- Primeiro, vamos pegar o user_id
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Buscar ID do usuário
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE email = 'giuseppe.bertholdi@gmail.com';
  
  IF v_user_id IS NULL THEN
    RAISE NOTICE 'ERRO: Usuário giuseppe.bertholdi@gmail.com não encontrado!';
  ELSE
    -- Inserir ou atualizar assinatura
    INSERT INTO user_subscriptions (
      user_id,
      stripe_subscription_id,
      stripe_customer_id,
      status,
      current_period_start,
      current_period_end,
      cancel_at_period_end
    ) VALUES (
      v_user_id,
      'sub_manual_' || gen_random_uuid()::text,
      'cus_manual_' || gen_random_uuid()::text,
      'trialing', -- Status em trial (não cobra)
      NOW(),
      NOW() + INTERVAL '1 year', -- Válido por 1 ano
      false
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
      status = 'trialing',
      current_period_end = NOW() + INTERVAL '1 year',
      updated_at = NOW();
    
    RAISE NOTICE 'SUCESSO: Plano PRO concedido para giuseppe.bertholdi@gmail.com!';
    RAISE NOTICE 'User ID: %', v_user_id;
  END IF;
END $$;

-- 5. Verificar se funcionou
SELECT 
  u.email,
  s.status,
  s.current_period_start,
  s.current_period_end,
  s.stripe_subscription_id
FROM user_subscriptions s
JOIN auth.users u ON u.id = s.user_id
WHERE u.email = 'giuseppe.bertholdi@gmail.com';

-- Se a query acima retornar uma linha com status = 'trialing', está tudo certo!
-- Você terá acesso ao plano PRO por 1 ano.

