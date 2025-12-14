import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json({ valid: false, error: 'Código não fornecido' })
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Buscar referência pelo código
    const { data: referral, error } = await supabase
      .from('referrals')
      .select('referrer_id, completed_at')
      .eq('referral_code', code)
      .maybeSingle()

    if (error || !referral) {
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

