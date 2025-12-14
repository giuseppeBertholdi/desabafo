import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Verificar se já existe um código de referência para este usuário
    const { data: existingReferral } = await supabase
      .from('referrals')
      .select('referral_code')
      .eq('referrer_id', session.user.id)
      .limit(1)
      .maybeSingle()

    if (existingReferral) {
      // Retornar código existente
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      return NextResponse.json({
        referralCode: existingReferral.referral_code,
        referralUrl: `${baseUrl}/invite/${existingReferral.referral_code}`
      })
    }

    // Gerar novo código único
    let referralCode: string
    let isUnique = false

    while (!isUnique) {
      // Gerar código de 8 caracteres alfanuméricos
      referralCode = randomBytes(4).toString('hex').toUpperCase()
      
      // Verificar se já existe
      const { data: existing } = await supabase
        .from('referrals')
        .select('id')
        .eq('referral_code', referralCode)
        .maybeSingle()

      if (!existing) {
        isUnique = true
      }
    }

    // Criar registro de referência
    const { error: insertError } = await supabase
      .from('referrals')
      .insert({
        referrer_id: session.user.id,
        referral_code: referralCode
      })

    if (insertError) {
      console.error('Erro ao criar código de referência:', insertError)
      return NextResponse.json(
        { error: 'Erro ao gerar código de referência' },
        { status: 500 }
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    return NextResponse.json({
      referralCode,
      referralUrl: `${baseUrl}/invite/${referralCode}`
    })
  } catch (error) {
    console.error('Erro ao gerar código de referência:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar código de referência' },
      { status: 500 }
    )
  }
}

