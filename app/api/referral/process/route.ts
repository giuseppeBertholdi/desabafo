import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { referralCode } = await request.json()

    if (!referralCode) {
      return NextResponse.json(
        { error: 'Código de referência não fornecido' },
        { status: 400 }
      )
    }

    // Buscar referência pelo código
    const { data: referral, error: referralError } = await supabase
      .from('referrals')
      .select('referrer_id, referred_id, completed_at')
      .eq('referral_code', referralCode)
      .maybeSingle()

    if (referralError || !referral) {
      return NextResponse.json(
        { error: 'Código de referência inválido' },
        { status: 404 }
      )
    }

    // Verificar se o usuário não está tentando se referir a si mesmo
    if (referral.referrer_id === session.user.id) {
      return NextResponse.json(
        { error: 'Você não pode usar seu próprio código de referência' },
        { status: 400 }
      )
    }

    // Verificar se já foi referido por alguém
    const { data: alreadyReferred } = await supabase
      .from('referrals')
      .select('id')
      .eq('referred_id', session.user.id)
      .maybeSingle()

    if (alreadyReferred) {
      return NextResponse.json(
        { error: 'Você já foi referido por outro usuário' },
        { status: 400 }
      )
    }

    // Verificar se esta referência já foi completada
    if (referral.completed_at) {
      return NextResponse.json(
        { error: 'Este código de referência já foi usado' },
        { status: 400 }
      )
    }

    // Atualizar referência com o ID do usuário referido e marcar como completada
    const { error: updateError } = await supabase
      .from('referrals')
      .update({
        referred_id: session.user.id,
        completed_at: new Date().toISOString()
      })
      .eq('referral_code', referralCode)

    if (updateError) {
      console.error('Erro ao processar referência:', updateError)
      return NextResponse.json(
        { error: 'Erro ao processar referência' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao processar referência:', error)
    return NextResponse.json(
      { error: 'Erro ao processar referência' },
      { status: 500 }
    )
  }
}

