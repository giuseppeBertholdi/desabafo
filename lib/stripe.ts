import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY não está definida')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
})

// Preços dos planos
export const STRIPE_PRICE_IDS = {
  monthly: process.env.STRIPE_PRICE_ID_MONTHLY || 'price_1SVbVVQpCkU9JLjuAuaIpLF6',
  yearly: process.env.STRIPE_PRICE_ID_YEARLY || 'price_1SVbXZQpCkU9JLjuHbUrDAUz',
}

