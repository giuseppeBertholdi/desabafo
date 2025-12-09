'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Sidebar from '@/components/Sidebar'

type PlanType = 'free' | 'essential' | 'pro'

interface PricingClientProps {
  userPlan?: PlanType
}

export default function PricingClient({ userPlan = 'free' }: PricingClientProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [isAnnual, setIsAnnual] = useState(false)

  const plans = [
    {
      id: 'free',
      emoji: '🌱',
      name: 'grátis',
      price: '0',
      period: 'sempre',
      description: 'pra experimentar',
      features: [
        '120 mensagens por mês',
        'sem insights',
        'sem modo de voz',
      ],
      cta: 'já estou usando',
      popular: false,
    },
    {
      id: 'essential',
      emoji: '💎',
      name: 'essential',
      price: isAnnual ? '15' : '19,90',
      period: 'mês',
      description: 'pra quem quer mais',
      features: [
        'mensagens ilimitadas',
        'insights ilimitados',
        'memória de longo prazo',
        'análise de sentimentos',
        'journal completo',
        'temas e contexto',
        'modo melhor amigo',
        'histórico completo',
      ],
      cta: 'escolher essential',
      popular: true,
    },
    {
      id: 'pro',
      emoji: '⭐',
      name: 'pro',
      price: isAnnual ? '23' : '29,90',
      period: 'mês',
      description: 'completo e com voz',
      features: [
        'mensagens ilimitadas',
        'insights ilimitados',
        'chat por voz (privado)',
        'memória de longo prazo',
        'análise de sentimentos',
        'journal completo',
        'temas e contexto',
        'modo melhor amigo',
        'histórico completo',
      ],
      cta: 'escolher pro',
      popular: false,
    },
  ]

  const handleSubscribe = async (planId: 'essential' | 'pro', period: 'monthly' | 'yearly') => {
    setIsLoading(`${planId}-${period}`)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          planId,
          planType: period,
        }),
      })

      const { url, error } = await response.json()

      if (error) {
        alert(`Erro: ${error}`)
        setIsLoading(null)
        return
      }

      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Erro ao criar checkout:', error)
      alert('Erro ao processar pagamento. Tente novamente.')
      setIsLoading(null)
    }
  }

  const handlePlanClick = (planId: string) => {
    if (planId === 'free') {
      router.push('/home')
      return
    }

    const period = isAnnual ? 'yearly' : 'monthly'
    handleSubscribe(planId as 'essential' | 'pro', period)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 relative transition-colors">
      {/* Logo desabafo no topo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute top-6 sm:top-8 left-16 sm:left-8 z-50 flex items-center"
      >
        <button
          onClick={() => router.push('/home')}
          className="text-xl sm:text-2xl font-light text-gray-900 dark:text-white tracking-tight hover:text-pink-500 transition-colors cursor-pointer"
        >
          desabafo.io
        </button>
      </motion.div>

      {/* Sidebar */}
      <Sidebar />

      {/* Conteúdo */}
      <div className="flex flex-col items-center justify-center min-h-screen px-6 sm:px-8 py-20 relative z-10">
        <div className="max-w-6xl w-full">
          {/* Título */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl text-gray-900 dark:text-white font-light tracking-tight mb-4">
              preços
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 font-light">
              escolha o plano ideal para você
            </p>
          </motion.div>

          {/* Toggle Mensal/Anual */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center justify-center gap-4 mb-12"
          >
            <span className={`text-sm ${!isAnnual ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
              Mensal
            </span>
            <motion.button
              onClick={() => setIsAnnual(!isAnnual)}
              whileTap={{ scale: 0.95 }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isAnnual ? 'bg-pink-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <motion.span
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="inline-block h-4 w-4 rounded-full bg-white"
                style={{ x: isAnnual ? 20 : 4 }}
              />
            </motion.button>
            <span className={`text-sm ${isAnnual ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
              Anual
            </span>
            {isAnnual && (
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="ml-2 px-2 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 text-xs font-medium rounded-full"
              >
                Economize até 25%
              </motion.span>
            )}
          </motion.div>

          {/* Cards de preço */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12">
            {plans.map((plan, index) => {
              const isCurrentPlan = userPlan === plan.id
              const isPaidPlan = plan.id === 'essential' || plan.id === 'pro'
              const isDisabled = isCurrentPlan || (isPaidPlan && isLoading !== null)

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={!isDisabled ? { y: -8, scale: plan.popular ? 1.05 : 1.02 } : {}}
                  className={`relative rounded-2xl border-2 p-8 flex flex-col ${
                    plan.popular
                      ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20 shadow-lg'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-pink-300 dark:hover:border-pink-600'
                  } ${isDisabled ? 'opacity-75' : ''}`}
                >
                  {plan.popular && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute -top-4 left-0 right-0 flex justify-center"
                    >
                      <span className="bg-pink-500 text-white px-4 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                        mais popular
                      </span>
                    </motion.div>
                  )}

                  <div className="mb-6">
                    <div className="text-4xl mb-4">{plan.emoji}</div>
                    <h3 className="text-2xl font-light text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 font-light">{plan.description}</p>
                    <motion.div
                      key={plan.price}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                      className="flex items-baseline"
                    >
                      <span className="text-5xl font-light text-gray-900 dark:text-white">R${plan.price}</span>
                      <span className="text-gray-500 dark:text-gray-400 ml-2 font-light">/{plan.period}</span>
                    </motion.div>
                  </div>

                  <ul className="space-y-3 mb-8 flex-grow">
                    {plan.features.map((feature, featureIndex) => (
                      <motion.li
                        key={featureIndex}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 + featureIndex * 0.05 }}
                        className="flex items-start"
                      >
                        <svg
                          className="h-5 w-5 text-pink-500 mr-3 mt-0.5 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-gray-700 dark:text-gray-300 text-sm font-light">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>

                  {isCurrentPlan ? (
                    <div className="w-full py-3 border border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 rounded-full font-light text-center cursor-not-allowed">
                      seu plano atual
                    </div>
                  ) : (
                    <motion.button
                      onClick={() => handlePlanClick(plan.id)}
                      disabled={isDisabled}
                      whileHover={!isDisabled ? { scale: 1.05 } : {}}
                      whileTap={!isDisabled ? { scale: 0.95 } : {}}
                      className={`w-full py-3 px-6 rounded-full font-light transition-colors ${
                        plan.popular
                          ? 'bg-pink-500 text-white hover:bg-pink-600'
                          : 'bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:border-pink-500 dark:hover:border-pink-500 hover:text-pink-600'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isLoading === `${plan.id}-${isAnnual ? 'yearly' : 'monthly'}` 
                        ? 'processando...' 
                        : plan.cta}
                    </motion.button>
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* Mensagem do giuseppe */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="max-w-xl mx-auto text-center"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400 font-light leading-relaxed mb-2">
              o desabafo.io nasceu da minha própria necessidade de ter um espaço seguro para expressar o que sinto, sem julgamentos.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-light leading-relaxed mb-2">
              não é terapia, não é coaching. é só um lugar onde você pode desabafar livremente, 24 horas por dia, e ser ouvido de verdade.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-light leading-relaxed mb-4">
              cada conversa aqui é tratada com cuidado e respeito. seus sentimentos são válidos.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-light mb-2">
              com amor,
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              giuseppe
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-light mt-1">
              fundador do desabafo.io
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
