-- Adicionar campos do Spotify na tabela user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS spotify_access_token TEXT,
ADD COLUMN IF NOT EXISTS spotify_refresh_token TEXT,
ADD COLUMN IF NOT EXISTS spotify_token_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS spotify_state TEXT;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_spotify_token 
ON user_profiles(user_id) 
WHERE spotify_access_token IS NOT NULL;

