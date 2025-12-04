import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { createSupabaseAdmin } from '@/lib/supabaseAdmin'
import Stripe from 'stripe'

// Endpoint para sincronizar manualmente a assinatura (útil para debug)
export async function POST(request: Request) {
  try {
    // Cliente normal para autenticação
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Cliente admin para bypassar RLS ao salvar assinatura
    const supabaseAdmin = createSupabaseAdmin()

    // Buscar assinatura no Stripe pelo customer email
    const email = session.user.email
    if (!email) {
      return NextResponse.json({ error: 'Email não encontrado' }, { status: 400 })
    }

    // Buscar customer no Stripe
    const customers = await stripe.customers.list({
      email: email,
      limit: 1
    })

    if (customers.data.length === 0) {
      return NextResponse.json({ error: 'Customer não encontrado no Stripe' }, { status: 404 })
    }

    const customer = customers.data[0]

    // Buscar assinaturas ativas do customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 1
    })

    if (subscriptions.data.length === 0) {
      // Remover assinatura do banco se não existir mais no Stripe
      await supabaseAdmin
        .from('user_subscriptions')
        .delete()
        .eq('user_id', session.user.id)

      return NextResponse.json({ message: 'Nenhuma assinatura ativa encontrada', plan: 'free' })
    }

    // Get subscription from list - it should have all required fields
    const subscriptionData = subscriptions.data[0]
    
    // Retrieve full subscription details to ensure all fields are present
    const subscription = await stripe.subscriptions.retrieve(subscriptionData.id)

    // Type guard to ensure we have the subscription with required fields
    if (!subscription || typeof subscription !== 'object') {
      return NextResponse.json({ error: 'Erro ao recuperar assinatura' }, { status: 500 })
    }

    // Access properties using type-safe approach
    const currentPeriodStart = (subscription as any).current_period_start as number
    const currentPeriodEnd = (subscription as any).current_period_end as number

    if (!currentPeriodStart || !currentPeriodEnd) {
      return NextResponse.json({ error: 'Dados da assinatura incompletos' }, { status: 500 })
    }

    // Salvar/atualizar no banco usando admin para bypassar RLS
    const { error } = await supabaseAdmin.from('user_subscriptions').upsert({
      user_id: session.user.id,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: customer.id,
      status: subscription.status,
      current_period_start: new Date(currentPeriodStart * 1000).toISOString(),
      current_period_end: new Date(currentPeriodEnd * 1000).toISOString(),
      cancel_at_period_end: (subscription as any).cancel_at_period_end,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    })

    if (error) {
      console.error('Erro ao sincronizar assinatura:', error)
      return NextResponse.json({ error: 'Erro ao sincronizar assinatura' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Assinatura sincronizada com sucesso',
      plan: 'pro',
      subscription: {
        id: subscription.id,
        status: subscription.status
      }
    })
  } catch (error: any) {
    console.error('Erro ao sincronizar assinatura:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao sincronizar assinatura' },
      { status: 500 }
    )
  }
}

