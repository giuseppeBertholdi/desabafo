-- Adicionar campos de personalização da IA na tabela user_profiles

-- Adicionar novos campos se não existirem
DO $$ 
BEGIN
  -- Idade
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'age'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN age INTEGER;
  END IF;

  -- Gênero
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'gender'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN gender TEXT;
  END IF;

  -- Profissão
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'profession'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN profession TEXT;
  END IF;

  -- Configurações de personalização da IA (JSONB para flexibilidade)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'ai_settings'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN ai_settings JSONB DEFAULT '{
      "slang_level": "moderado",
      "playfulness": "equilibrado",
      "formality": "informal",
      "empathy_level": "alto",
      "response_length": "medio"
    }'::jsonb;
  END IF;
END $$;

-- Comentários nas colunas
COMMENT ON COLUMN user_profiles.age IS 'Idade do usuário para personalização da IA';
COMMENT ON COLUMN user_profiles.gender IS 'Gênero do usuário (livre, não binário)';
COMMENT ON COLUMN user_profiles.profession IS 'Profissão do usuário para contexto';
COMMENT ON COLUMN user_profiles.ai_settings IS 'Configurações de personalização da IA: slang_level, playfulness, formality, empathy_level, response_length';

