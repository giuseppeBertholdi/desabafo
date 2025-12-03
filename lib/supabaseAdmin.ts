import { createClient } from '@supabase/supabase-js'

// Cliente Supabase com Service Role Key para bypassar RLS
// Use apenas em rotas de API server-side (webhooks, operações administrativas)
export function createSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY não está definida. Adicione no .env.local')
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

