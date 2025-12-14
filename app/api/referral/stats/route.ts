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

    // Contar referências completadas (apenas as que têm completed_at preenchido)
    const { data: completedReferralsData, error: countError } = await supabase
      .from('referrals')
      .select('id')
      .eq('referrer_id', session.user.id)
      .not('completed_at', 'is', null)

    if (countError) {
      console.error('Erro ao contar referências:', countError)
      return NextResponse.json(
        { error: 'Erro ao buscar estatísticas' },
        { status: 500 }
      )
    }

    const totalReferrals = 0 // Não precisamos do total, apenas das completadas
    const completedReferrals = completedReferralsData?.length || 0
    const remainingReferrals = Math.max(0, 5 - completedReferrals)
    
    console.log('📊 Estatísticas de referência:', {
      referrerId: session.user.id,
      referralCode: referral?.referral_code,
      completedReferrals,
      remainingReferrals
    })

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

