/**
 * Script para conceder plano PRO a um usuário
 * Uso: npx tsx scripts/grant-pro.ts <email> [planType]
 * Exemplo: npx tsx scripts/grant-pro.ts giuseppe.bertholdi@gmail.com monthly
 */

import { stripe, STRIPE_PRICE_IDS } from '../lib/stripe'
import { createSupabaseAdmin } from '../lib/supabaseAdmin'

async function grantPro(email: string, planType: 'monthly' | 'yearly' = 'monthly') {
  try {
    console.log(`🎯 Concedendo plano PRO ${planType} para ${email}...`)

    // Validar Price IDs
    const priceId = planType === 'yearly' ? STRIPE_PRICE_IDS.yearly : STRIPE_PRICE_IDS.monthly
    if (!priceId) {
      throw new Error(`STRIPE_PRICE_ID_${planType.toUpperCase()} não está configurado`)
    }

    const supabase = createSupabaseAdmin()

    // Buscar usuário pelo email
    console.log('📧 Buscando usuário no Supabase...')
    const { data: users, error: userError } = await supabase.auth.admin.listUsers()
    
    if (userError) {
      throw new Error(`Erro ao buscar usuários: ${userError.message}`)
    }

    const user = users.users.find(u => u.email === email)
    
    if (!user) {
      throw new Error(`Usuário com email ${email} não encontrado`)
    }

    console.log(`✅ Usuário encontrado: ${user.id}`)

    // Buscar ou criar customer no Stripe
    console.log('💳 Buscando/criando customer no Stripe...')
    let customer
    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1
    })

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0]
      console.log(`✅ Customer existente encontrado: ${customer.id}`)
    } else {
      // Criar novo customer
      customer = await stripe.customers.create({
        email: email,
        metadata: {
          user_id: user.id
        }
      })
      console.log(`✅ Novo customer criado: ${customer.id}`)
    }

    // Verificar se já existe assinatura ativa
    const existingSubscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 1
    })

    if (existingSubscriptions.data.length > 0) {
      const existingSub = existingSubscriptions.data[0]
      console.log(`⚠️  Usuário já possui assinatura ativa: ${existingSub.id}`)
      console.log(`   Status: ${existingSub.status}`)
      return {
        success: true,
        message: 'Usuário já possui assinatura ativa',
        subscription: existingSub
      }
    }

    // Criar assinatura no Stripe
    console.log('📝 Criando assinatura no Stripe...')
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

    console.log(`✅ Assinatura criada: ${subscription.id}`)

    // Salvar assinatura no banco de dados
    console.log('💾 Salvando assinatura no banco de dados...')
    // Para assinaturas em trial, usar trial_start e trial_end se disponíveis
    const currentPeriodStart = (subscription as any).current_period_start as number | undefined
    const currentPeriodEnd = (subscription as any).current_period_end as number | undefined
    const trialStart = (subscription as any).trial_start as number | undefined
    const trialEnd = (subscription as any).trial_end as number | undefined

    // Validar e converter datas
    let periodStartISO: string
    let periodEndISO: string

    try {
      // Se estiver em trial, usar trial_start, senão usar current_period_start
      const startTimestamp = trialStart || currentPeriodStart
      if (startTimestamp && typeof startTimestamp === 'number' && startTimestamp > 0) {
        periodStartISO = new Date(startTimestamp * 1000).toISOString()
      } else {
        periodStartISO = new Date().toISOString()
      }

      // Se estiver em trial, usar trial_end, senão usar current_period_end
      const endTimestamp = trialEnd || currentPeriodEnd
      if (endTimestamp && typeof endTimestamp === 'number' && endTimestamp > 0) {
        periodEndISO = new Date(endTimestamp * 1000).toISOString()
      } else {
        // Se não tiver end, adicionar 1 mês ao start
        const startDate = new Date(periodStartISO)
        startDate.setMonth(startDate.getMonth() + 1)
        periodEndISO = startDate.toISOString()
      }
    } catch (dateError) {
      console.error('Erro ao converter datas:', dateError)
      // Usar datas padrão se houver erro
      const now = new Date()
      periodStartISO = now.toISOString()
      const endDate = new Date(now)
      endDate.setMonth(endDate.getMonth() + 1)
      periodEndISO = endDate.toISOString()
    }

    const { error: dbError } = await supabase.from('user_subscriptions').upsert({
      user_id: user.id,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: customer.id,
      status: subscription.status,
      current_period_start: periodStartISO,
      current_period_end: periodEndISO,
      cancel_at_period_end: (subscription as any).cancel_at_period_end || false,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    })

    if (dbError) {
      console.error('⚠️  Erro ao salvar assinatura no banco:', dbError)
      throw new Error(`Erro ao salvar no banco: ${dbError.message}`)
    }

    console.log('✅ Assinatura salva no banco de dados')

    console.log('\n🎉 Plano PRO concedido com sucesso!')
    console.log(`   Email: ${email}`)
    console.log(`   Plano: ${planType}`)
    console.log(`   Subscription ID: ${subscription.id}`)
    console.log(`   Customer ID: ${customer.id}`)
    console.log(`   Status: ${subscription.status}`)

    return {
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        customer_id: customer.id
      }
    }
  } catch (error: any) {
    console.error('❌ Erro ao conceder plano PRO:', error.message)
    throw error
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const email = process.argv[2]
  const planType = (process.argv[3] || 'monthly') as 'monthly' | 'yearly'

  if (!email) {
    console.error('❌ Uso: npx tsx scripts/grant-pro.ts <email> [planType]')
    console.error('   Exemplo: npx tsx scripts/grant-pro.ts giuseppe.bertholdi@gmail.com monthly')
    process.exit(1)
  }

  grantPro(email, planType)
    .then(() => {
      console.log('\n✅ Concluído!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Falha:', error.message)
      process.exit(1)
    })
}

export { grantPro }

