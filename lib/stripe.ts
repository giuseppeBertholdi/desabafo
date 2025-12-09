import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY não está definida')
}

// Validar se é chave de produção ou teste
const isProduction = process.env.STRIPE_SECRET_KEY.startsWith('sk_live_')
if (!isProduction && !process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
  console.warn('⚠️ STRIPE_SECRET_KEY não parece ser uma chave válida do Stripe')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-11-17.clover',
  typescript: true,
})

// Preços dos planos
export const STRIPE_PRICE_IDS = {
  // Essential (sem voz)
  essential_monthly: process.env.STRIPE_PRICE_ID_ESSENTIAL_MONTHLY,
  essential_yearly: process.env.STRIPE_PRICE_ID_ESSENTIAL_YEARLY,
  // Pro (com voz)
  pro_monthly: process.env.STRIPE_PRICE_ID_MONTHLY, // Mantém compatibilidade
  pro_yearly: process.env.STRIPE_PRICE_ID_YEARLY, // Mantém compatibilidade
  // Aliases para compatibilidade
  monthly: process.env.STRIPE_PRICE_ID_MONTHLY,
  yearly: process.env.STRIPE_PRICE_ID_YEARLY,
}

// Mapear price_id para plan_type
export function getPlanTypeFromPriceId(priceId: string): 'essential' | 'pro' {
  if (priceId === process.env.STRIPE_PRICE_ID_ESSENTIAL_MONTHLY || 
      priceId === process.env.STRIPE_PRICE_ID_ESSENTIAL_YEARLY) {
    return 'essential'
  }
  // Qualquer outro price_id é considerado 'pro' (compatibilidade)
  return 'pro'
}

// Validar Price IDs em produção
if (isProduction) {
  if (!STRIPE_PRICE_IDS.monthly) {
    throw new Error('STRIPE_PRICE_ID_MONTHLY não está definida (obrigatória em produção)')
  }
  if (!STRIPE_PRICE_IDS.yearly) {
    throw new Error('STRIPE_PRICE_ID_YEARLY não está definida (obrigatória em produção)')
  }
}

