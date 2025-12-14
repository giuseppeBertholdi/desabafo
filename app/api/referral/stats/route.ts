import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Buscar código de referência do usuário
    const { data: referral } = await supabase
      .from('referrals')
      .select('referral_code')
      .eq('referrer_id', session.user.id)
      .limit(1)
      .maybeSingle()

    if (!referral) {
      return NextResponse.json({
        referralCode: null,
        referralUrl: null,
        totalReferrals: 0,
        completedReferrals: 0,
        remainingReferrals: 5
      })
    }

    // Contar referências totais e completadas
    const { data: allReferrals, error: countError } = await supabase
      .from('referrals')
      .select('completed_at')
      .eq('referrer_id', session.user.id)

    if (countError) {
      console.error('Erro ao contar referências:', countError)
      return NextResponse.json(
        { error: 'Erro ao buscar estatísticas' },
        { status: 500 }
      )
    }

    const totalReferrals = allReferrals?.length || 0
    const completedReferrals = allReferrals?.filter(r => r.completed_at !== null).length || 0
    const remainingReferrals = Math.max(0, 5 - completedReferrals)

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    return NextResponse.json({
      referralCode: referral.referral_code,
      referralUrl: `${baseUrl}/invite/${referral.referral_code}`,
      totalReferrals,
      completedReferrals,
      remainingReferrals
    })
  } catch (error) {
    console.error('Erro ao buscar estatísticas de referência:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    )
  }
}

