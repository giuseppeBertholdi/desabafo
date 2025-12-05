import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { stripe, STRIPE_PRICE_IDS } from '@/lib/stripe'

export async function POST(request: Request) {
  try {
    const { priceId, planType } = await request.json()
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Validar URL base
    if (!process.env.NEXT_PUBLIC_APP_URL) {
      return NextResponse.json(
        { error: 'NEXT_PUBLIC_APP_URL não está configurada' },
        { status: 500 }
      )
    }

    // Usar priceId fornecido ou o padrão baseado no planType
    const finalPriceId = priceId || (planType === 'yearly' ? STRIPE_PRICE_IDS.yearly : STRIPE_PRICE_IDS.monthly)
    
    if (!finalPriceId) {
      return NextResponse.json(
        { error: 'Price ID não encontrado. Verifique as variáveis de ambiente STRIPE_PRICE_ID_MONTHLY e STRIPE_PRICE_ID_YEARLY' },
        { status: 500 }
      )
    }

    // Criar sessão de checkout no Stripe
    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: session.user.email || undefined,
      line_items: [
        {
          price: finalPriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        user_id: session.user.id,
      },
      subscription_data: {
        metadata: {
          user_id: session.user.id,
        },
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error: any) {
    console.error('Erro ao criar checkout:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao criar sessão de checkout' },
      { status: 500 }
    )
  }
}

