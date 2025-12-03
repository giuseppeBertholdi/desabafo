import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { createSupabaseAdmin } from '@/lib/supabaseAdmin'
import Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error('Erro ao verificar webhook:', err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  // Usar Service Role para bypassar RLS
  const supabase = createSupabaseAdmin()

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.user_id

      if (userId && session.subscription) {
        try {
          // Buscar detalhes da assinatura
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

          // Salvar/atualizar assinatura no banco
          const { error } = await supabase.from('user_subscriptions').upsert({
            user_id: userId,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: subscription.customer as string,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          })

          if (error) {
            console.error('Erro ao salvar assinatura no checkout.session.completed:', error)
          }
        } catch (error) {
          console.error('Erro ao processar checkout.session.completed:', error)
        }
      }
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      let userId = subscription.metadata?.user_id

      // Se não tiver user_id no metadata, buscar pela assinatura existente
      if (!userId) {
        try {
          const { data: existing } = await supabase
            .from('user_subscriptions')
            .select('user_id')
            .eq('stripe_subscription_id', subscription.id)
            .single()
          
          if (existing) {
            userId = existing.user_id
          }
        } catch (error) {
          console.error('Erro ao buscar user_id da assinatura:', error)
        }
      }

      if (userId) {
        try {
          // Usar upsert para garantir que cria se não existir
          const { error } = await supabase.from('user_subscriptions').upsert({
            user_id: userId,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: subscription.customer as string,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'stripe_subscription_id'
          })

          if (error) {
            console.error('Erro ao atualizar assinatura no customer.subscription.updated:', error)
          }
        } catch (error) {
          console.error('Erro ao processar customer.subscription.updated:', error)
        }
      } else {
        console.warn('customer.subscription.updated: user_id não encontrado para subscription', subscription.id)
      }
      break
    }

    case 'customer.subscription.created': {
      const subscription = event.data.object as Stripe.Subscription
      let userId = subscription.metadata?.user_id

      // Se não tiver user_id no metadata, buscar pela assinatura existente ou pelo customer
      if (!userId) {
        try {
          // Tentar buscar pela assinatura existente
          const { data: existing } = await supabase
            .from('user_subscriptions')
            .select('user_id')
            .eq('stripe_subscription_id', subscription.id)
            .single()
          
          if (existing) {
            userId = existing.user_id
          } else if (subscription.customer) {
            // Tentar buscar pelo customer
            const customer = await stripe.customers.retrieve(subscription.customer as string)
            if (customer && !customer.deleted && 'metadata' in customer) {
              userId = customer.metadata?.user_id
            }
          }
        } catch (error) {
          console.error('Erro ao buscar user_id no customer.subscription.created:', error)
        }
      }

      if (userId) {
        try {
          const { error } = await supabase.from('user_subscriptions').upsert({
            user_id: userId,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: subscription.customer as string,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'stripe_subscription_id'
          })

          if (error) {
            console.error('Erro ao criar assinatura no customer.subscription.created:', error)
          } else {
            console.log('Assinatura criada/atualizada com sucesso:', subscription.id, 'para user:', userId)
          }
        } catch (error) {
          console.error('Erro ao processar customer.subscription.created:', error)
        }
      } else {
        console.warn('customer.subscription.created: user_id não encontrado para subscription', subscription.id)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      let userId = subscription.metadata?.user_id

      // Se não tiver user_id, buscar pela assinatura existente
      if (!userId) {
        try {
          const { data: existing } = await supabase
            .from('user_subscriptions')
            .select('user_id')
            .eq('stripe_subscription_id', subscription.id)
            .single()
          
          if (existing) {
            userId = existing.user_id
          }
        } catch (error) {
          console.error('Erro ao buscar user_id no customer.subscription.deleted:', error)
        }
      }

      if (userId) {
        try {
          const { error } = await supabase.from('user_subscriptions').update({
            status: 'canceled',
            updated_at: new Date().toISOString()
          }).eq('stripe_subscription_id', subscription.id)

          if (error) {
            console.error('Erro ao cancelar assinatura:', error)
          }
        } catch (error) {
          console.error('Erro ao processar customer.subscription.deleted:', error)
        }
      }
      break
    }

    default:
      console.log(`Evento não tratado: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

