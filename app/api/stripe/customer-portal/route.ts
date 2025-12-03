import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { stripe } from '@/lib/stripe'

/**
 * Cria uma sessão do Customer Portal da Stripe
 * Permite que o usuário gerencie sua assinatura (cancelar, atualizar método de pagamento, etc)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Buscar customer ID do Stripe
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', session.user.id)
      .in('status', ['active', 'trialing', 'past_due'])
      .single()

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'Nenhuma assinatura ativa encontrada' },
        { status: 404 }
      )
    }

    // Criar sessão do Customer Portal
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/account`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error('Erro ao criar sessão do Customer Portal:', error)
    return NextResponse.json(
      { error: 'Erro ao acessar portal de gerenciamento' },
      { status: 500 }
    )
  }
}


