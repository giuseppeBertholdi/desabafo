import { NextResponse } from 'next/server'
import { stripe, STRIPE_PRICE_IDS } from '@/lib/stripe'
import { createSupabaseAdmin } from '@/lib/supabaseAdmin'

/**
 * Endpoint administrativo para conceder plano PRO a um usuário
 * Uso: POST /api/admin/grant-pro
 * Body: { email: string, planType?: 'monthly' | 'yearly' }
 * 
 * Para conceder ao giuseppe.bertholdi@gmail.com:
 * curl -X POST https://desabafo.site/api/admin/grant-pro \
 *   -H "Content-Type: application/json" \
 *   -d '{"email":"giuseppe.bertholdi@gmail.com","planType":"monthly"}'
 */
export async function POST(request: Request) {
  try {
    const { email, planType = 'monthly' } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      )
    }

    // Validar Price IDs
    const priceId = planType === 'yearly' ? STRIPE_PRICE_IDS.yearly : STRIPE_PRICE_IDS.monthly
    if (!priceId) {
      return NextResponse.json(
        { error: `STRIPE_PRICE_ID_${planType.toUpperCase()} não está configurado` },
        { status: 500 }
      )
    }

    const supabase = createSupabaseAdmin()

    // Buscar usuário pelo email
    const { data: users, error: userError } = await supabase.auth.admin.listUsers()
    
    if (userError) {
      console.error('Erro ao buscar usuários:', userError)
      return NextResponse.json(
        { error: 'Erro ao buscar usuário' },
        { status: 500 }
      )
    }

    const user = users.users.find(u => u.email === email)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Buscar ou criar customer no Stripe
    let customer
    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1
    })

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0]
    } else {
      // Criar novo customer
      customer = await stripe.customers.create({
        email: email,
        metadata: {
          user_id: user.id
        }
      })
    }

    // Criar assinatura no Stripe
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      metadata: {
        user_id: user.id,
        granted_by_admin: 'true'
      },
      // Não cobrar imediatamente (plano gratuito/concedido)
      trial_end: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60), // 1 ano de trial
    })

    // Salvar assinatura no banco de dados
    const currentPeriodStart = (subscription as any).current_period_start as number
    const currentPeriodEnd = (subscription as any).current_period_end as number

    const { error: dbError } = await supabase.from('user_subscriptions').upsert({
      user_id: user.id,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: customer.id,
      status: subscription.status,
      current_period_start: new Date(currentPeriodStart * 1000).toISOString(),
      current_period_end: new Date(currentPeriodEnd * 1000).toISOString(),
      cancel_at_period_end: (subscription as any).cancel_at_period_end || false,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    })

    if (dbError) {
      console.error('Erro ao salvar assinatura no banco:', dbError)
      // Não falhar completamente, mas avisar
    }

    return NextResponse.json({
      success: true,
      message: `Plano PRO ${planType} concedido com sucesso para ${email}`,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        customer_id: customer.id
      }
    })
  } catch (error: any) {
    console.error('Erro ao conceder plano PRO:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao conceder plano PRO' },
      { status: 500 }
    )
  }
}

