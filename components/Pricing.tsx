'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false)
  const router = useRouter()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const handlePlanClick = (planId: string) => {
    if (planId === 'free') {
      router.push('/login')
      return
    }

    // Para planos pagos, redirecionar para página de pricing completa
    router.push('/pricing')
  }

  const plans = [
    {
      emoji: '🌱',
      name: 'grátis',
      price: '0',
      period: 'sempre',
      description: 'pra experimentar',
      features: [
        '120 mensagens por mês',
        'sem insights',
        'sem modo de voz',
        'sem Spotify',
      ],
      cta: 'começar grátis',
      popular: false,
      planId: 'free',
    },
    {
      emoji: '💎',
      name: 'essential',
      price: isAnnual ? '15' : '19,90',
      period: 'mês',
      description: 'pra quem quer mais',
      features: [
        'mensagens ilimitadas',
        'insights ilimitados',
        'conexão com Spotify',
        'memória de longo prazo',
        'análise de sentimentos',
        'journal completo',
        'temas e contexto',
        'modo melhor amigo',
        'histórico completo',
      ],
      cta: 'começar agora',
      popular: false,
      planId: 'essential',
    },
    {
      emoji: '⭐',
      name: 'pro',
      price: isAnnual ? '23' : '29,90',
      period: 'mês',
      description: 'completo e com voz',
      features: [
        'mensagens ilimitadas',
        'insights ilimitados',
        'chat por voz (privado)',
        'conexão com Spotify',
        'memória de longo prazo',
        'análise de sentimentos',
        'journal completo',
        'temas e contexto',
        'modo melhor amigo',
        'histórico completo',
      ],
      cta: 'começar agora',
      popular: true,
      planId: 'pro',
    },
  ]

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 transition-colors" id="precos">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-light text-gray-900 dark:text-white mb-3 tracking-wide">
            preços simples
          </h2>
          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-light mb-8">
            sem pegadinhas, sem surpresas
          </p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
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
                className="ml-2 px-2 py-1 bg-pink-100 text-pink-700 text-xs font-medium rounded-full"
              >
                Economize 23%
              </motion.span>
            )}
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: plan.popular ? 1.08 : 1.03 }}
              className={`relative rounded-2xl border-2 p-8 cursor-default flex flex-col ${
                plan.popular
                  ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-pink-300 dark:hover:border-pink-600'
              }`}
            >
              {plan.popular && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                  className="absolute -top-4 left-0 right-0 flex justify-center"
                >
                  <span className="bg-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                    mais popular
                  </span>
                </motion.div>
              )}
              
              <div className="mb-8">
                <div className="text-4xl mb-4">{plan.emoji}</div>
                <h3 className="text-2xl font-medium text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{plan.description}</p>
                <motion.div
                  key={plan.price}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="flex items-baseline"
                >
                  <span className="text-5xl font-normal text-gray-900 dark:text-white">R${plan.price}</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-2 font-light">/{plan.period}</span>
                </motion.div>
              </div>

              <ul className="space-y-4 mb-6 flex-grow">
                {plan.features.map((feature, featureIndex) => (
                  <motion.li
                    key={featureIndex}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
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
                    <span className="text-gray-700 dark:text-gray-300 text-sm">{feature}</span>
                  </motion.li>
                ))}
              </ul>

              {/* Seção "não está incluso" - para Free */}
              {plan.planId === 'free' && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <h4 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-3">
                    o que não está incluso:
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <svg
                        className="h-5 w-5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      <span className="text-sm font-medium text-red-700 dark:text-red-400">
                        sem insights
                      </span>
                    </div>
                    <div className="flex items-center">
                      <svg
                        className="h-5 w-5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      <span className="text-sm font-medium text-red-700 dark:text-red-400">
                        sem modo de voz
                      </span>
                    </div>
                    <div className="flex items-center">
                      <svg
                        className="h-5 w-5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      <span className="text-sm font-medium text-red-700 dark:text-red-400">
                        mensagens ilimitadas
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Seção "não está incluso" - apenas para Essential */}
              {plan.planId === 'essential' && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <h4 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">
                    o que não está incluso:
                  </h4>
                  <div className="flex items-center">
                    <svg
                      className="h-5 w-5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    <span className="text-sm font-medium text-red-700 dark:text-red-400">
                      não inclui voz
                    </span>
                  </div>
                </div>
              )}

              {/* Seção "está incluso" - para Pro (tudo verde) */}
              {plan.planId === 'pro' && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-500 dark:border-green-600 rounded-lg">
                  <h4 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-3">
                    o que está incluso:
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <svg
                        className="h-5 w-5 text-green-600 dark:text-green-400 mr-2 flex-shrink-0"
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
                      <span className="text-sm font-bold text-green-700 dark:text-green-400">
                        mensagens ilimitadas
                      </span>
                    </div>
                    <div className="flex items-center">
                      <svg
                        className="h-5 w-5 text-green-600 dark:text-green-400 mr-2 flex-shrink-0"
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
                      <span className="text-sm font-bold text-green-700 dark:text-green-400">
                        insights ilimitados
                      </span>
                    </div>
                    <div className="flex items-center">
                      <svg
                        className="h-5 w-5 text-green-600 dark:text-green-400 mr-2 flex-shrink-0"
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
                      <span className="text-sm font-bold text-green-700 dark:text-green-400">
                        inclui voz
                      </span>
                    </div>
                    <div className="flex items-center">
                      <svg
                        className="h-5 w-5 text-green-600 dark:text-green-400 mr-2 flex-shrink-0"
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
                      <span className="text-sm font-bold text-green-700 dark:text-green-400">
                        todos os recursos
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <motion.button
                onClick={() => handlePlanClick(plan.planId)}
                disabled={loadingPlan === plan.planId}
                whileHover={loadingPlan !== plan.planId ? { scale: 1.05 } : {}}
                whileTap={loadingPlan !== plan.planId ? { scale: 0.95 } : {}}
                className={`w-full py-3 px-6 rounded-full font-medium transition-colors ${
                  plan.popular
                    ? 'bg-pink-500 text-white hover:bg-pink-600'
                    : 'bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:border-pink-500 dark:hover:border-pink-500 hover:text-pink-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loadingPlan === plan.planId ? 'carregando...' : plan.cta}
              </motion.button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-gray-400 dark:text-gray-500">
            3 dias grátis em todos os planos • cancele quando quiser • sem pegadinhas
          </p>
        </motion.div>
      </div>
    </section>
  )
}

