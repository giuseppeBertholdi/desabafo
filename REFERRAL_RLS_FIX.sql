-- Script para corrigir políticas RLS da tabela referrals
-- Execute este script se você já criou a tabela mas está recebendo erro 42501

-- Remover políticas antigas se existirem (opcional, pode dar erro se não existirem)
DROP POLICY IF EXISTS "Users can insert their own referrals" ON referrals;
DROP POLICY IF EXISTS "Users can update referrals where they are referred" ON referrals;

-- Política: Usuários podem inserir suas próprias referências
CREATE POLICY "Users can insert their own referrals"
  ON referrals FOR INSERT
  WITH CHECK (auth.uid() = referrer_id);

-- Política: Sistema pode atualizar referências (para completar quando alguém se cadastra)
-- Nota: Esta política permite que o próprio usuário referido atualize a referência
-- ou podemos usar service role na API para atualizar
CREATE POLICY "Users can update referrals where they are referred"
  ON referrals FOR UPDATE
  USING (auth.uid() = referred_id OR auth.uid() = referrer_id)
  WITH CHECK (auth.uid() = referred_id OR auth.uid() = referrer_id);

-- Política: Permitir leitura pública de códigos de referência (para validação)
-- Isso permite que a API valide códigos sem autenticação
CREATE POLICY "Public can read referral codes for validation"
  ON referrals FOR SELECT
  USING (true);

