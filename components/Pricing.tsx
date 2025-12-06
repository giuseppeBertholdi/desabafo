'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false)

  const plans = [
    {
      emoji: '🌱',
      name: 'grátis',
      price: '0',
      period: 'sempre',
      description: 'pra experimentar',
      features: [
        '100 mensagens de chat/mês',
        'chat por texto',
        '10 entradas de diário/mês',
        '3 insights/mês',
        'histórico de conversas',
      ],
      cta: 'começar grátis',
      popular: false,
    },
    {
      emoji: '⭐',
      name: 'pro',
      price: isAnnual ? '23' : '29,90',
      period: 'mês',
      description: 'pra usar no dia a dia',
      features: [
        'conversas ilimitadas',
        'chat por voz (privado)',
        'memória de longo prazo',
        'insights personalizados',
        'análise de sentimentos',
        'journal completo',
        'temas e contexto',
        'modo melhor amigo',
        'histórico completo',
      ],
      cta: 'começar agora',
      popular: true,
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-6 max-w-4xl mx-auto">
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

              <ul className="space-y-4 mb-8 flex-grow">
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

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-full py-3 px-6 rounded-full font-medium transition-colors ${
                  plan.popular
                    ? 'bg-pink-500 text-white hover:bg-pink-600'
                    : 'bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:border-pink-500 dark:hover:border-pink-500 hover:text-pink-600'
                }`}
              >
                {plan.cta}
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

