import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { stripe, STRIPE_PRICE_IDS } from '@/lib/stripe'

export async function POST(request: Request) {
  try {
    const { priceId, planType, planId } = await request.json()
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

    // Determinar priceId baseado no planId e planType
    let finalPriceId = priceId
    
    if (!finalPriceId && planId) {
      // Se planId foi fornecido, usar os novos price IDs
      if (planId === 'essential') {
        finalPriceId = planType === 'yearly' 
          ? STRIPE_PRICE_IDS.essential_yearly 
          : STRIPE_PRICE_IDS.essential_monthly
      } else if (planId === 'pro') {
        finalPriceId = planType === 'yearly' 
          ? STRIPE_PRICE_IDS.pro_yearly 
          : STRIPE_PRICE_IDS.pro_monthly
      }
    }
    
    // Fallback para compatibilidade (se não tiver planId, usar antigo sistema)
    if (!finalPriceId) {
      finalPriceId = planType === 'yearly' ? STRIPE_PRICE_IDS.yearly : STRIPE_PRICE_IDS.monthly
    }
    
    if (!finalPriceId) {
      return NextResponse.json(
        { error: 'Price ID não encontrado. Verifique as variáveis de ambiente do Stripe' },
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
        plan_id: planId || 'pro', // Salvar plan_id no metadata
      },
      subscription_data: {
        metadata: {
          user_id: session.user.id,
          plan_id: planId || 'pro', // Salvar plan_id no metadata
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

