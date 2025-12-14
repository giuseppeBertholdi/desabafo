import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json({ valid: false, error: 'Código não fornecido' })
    }

    // Usar service role para validar código (não requer autenticação)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Variáveis de ambiente do Supabase não configuradas')
      return NextResponse.json({ valid: false, error: 'Erro de configuração' })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Buscar referência pelo código
    const { data: referral, error } = await supabase
      .from('referrals')
      .select('referrer_id, completed_at')
      .eq('referral_code', code)
      .maybeSingle()

    if (error) {
      console.error('Erro ao buscar referência:', error)
      return NextResponse.json({ valid: false, error: 'Erro ao validar código' })
    }

    if (!referral) {
      return NextResponse.json({ valid: false, error: 'Código inválido' })
    }

    // Verificar se já foi usado
    if (referral.completed_at) {
      return NextResponse.json({ valid: false, error: 'Código já foi usado' })
    }

    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error('Erro ao validar código:', error)
    return NextResponse.json({ valid: false, error: 'Erro ao validar código' })
  }
}

