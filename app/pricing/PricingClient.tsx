'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Sidebar from '@/components/Sidebar'

type PlanType = 'free' | 'pro'

interface PricingClientProps {
  userPlan?: PlanType
}

export default function PricingClient({ userPlan = 'free' }: PricingClientProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const hasProPlan = userPlan === 'pro'

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planType: plan }),
      })

      const { url, error } = await response.json()

      if (error) {
        alert(`Erro: ${error}`)
        setIsLoading(false)
        return
      }

      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Erro ao criar checkout:', error)
      alert('Erro ao processar pagamento. Tente novamente.')
      setIsLoading(false)
    }
  }

  const handleContinueFree = () => {
    router.push('/home')
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 relative transition-colors">
      {/* Logo desabafo no topo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute top-6 sm:top-8 left-6 sm:left-8 z-50"
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
        <div className="max-w-3xl w-full">
          {/* Título */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl text-gray-900 dark:text-white font-light tracking-tight mb-4">
              preços
            </h1>
          </motion.div>

          {/* Cards de preço - Minimalista */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {/* Plano Mensal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="border border-gray-200 dark:border-gray-700 rounded-2xl p-8 hover:border-gray-300 dark:hover:border-gray-600 transition-all flex flex-col"
            >
              <div className="text-center mb-6">
                <h2 className="text-xl font-light text-gray-900 dark:text-white mb-4">mensal</h2>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-4xl font-light text-gray-900 dark:text-white">R$</span>
                  <span className="text-5xl font-light text-gray-900 dark:text-white">29,90</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-light">
                  por mês
                </p>
              </div>

              {/* Benefícios */}
              <div className="mb-6 flex-grow space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-300 font-light">
                  <span className="font-semibold">chat ilimitado</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-light">
                  <span className="font-semibold">modo de voz</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-light">
                  <span className="font-semibold">histórico completo</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-light">
                  <span className="font-semibold">insights personalizados</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-light">
                  <span className="font-semibold">análise de sentimentos</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-light">
                  <span className="font-semibold">privacidade total</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-light">
                  <span className="font-semibold">disponível 24/7</span>
                </p>
              </div>

              {/* Botão */}
              {hasProPlan ? (
                <div className="w-full py-3 border border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 rounded-lg font-light text-center cursor-not-allowed">
                  você já possui o plano
                </div>
              ) : (
                <button
                  onClick={() => handleSubscribe('monthly')}
                  disabled={isLoading}
                  className="w-full py-3 border border-pink-600 text-pink-600 rounded-lg font-light hover:bg-pink-600 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  type="button"
                >
                  {isLoading ? 'processando...' : 'escolher mensal'}
                </button>
              )}
            </motion.div>

            {/* Plano Anual */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="border-2 border-gray-900 dark:border-gray-700 rounded-2xl p-8 hover:border-gray-700 dark:hover:border-gray-600 transition-all relative flex flex-col"
            >
              {/* Badge de economia */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-pink-600 text-white px-3 py-1 rounded-full text-xs font-light">
                  economize 20%
                </span>
              </div>

              <div className="text-center mb-6">
                <h2 className="text-xl font-light text-gray-900 dark:text-white mb-4">anual</h2>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-4xl font-light text-gray-900 dark:text-white">R$</span>
                  <span className="text-5xl font-light text-gray-900 dark:text-white">23,00</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-light">
                  por mês
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-light mt-1">
                  R$ 276,00 cobrado anualmente
                </p>
              </div>

              {/* Benefícios */}
              <div className="mb-6 flex-grow space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-300 font-light">
                  <span className="font-semibold">chat ilimitado</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-light">
                  <span className="font-semibold">modo de voz</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-light">
                  <span className="font-semibold">histórico completo</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-light">
                  <span className="font-semibold">insights personalizados</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-light">
                  <span className="font-semibold">análise de sentimentos</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-light">
                  <span className="font-semibold">privacidade total</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-light">
                  <span className="font-semibold">disponível 24/7</span>
                </p>
              </div>

              {/* Botão */}
              {hasProPlan ? (
                <div className="w-full py-3 border border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 rounded-lg font-light text-center cursor-not-allowed">
                  você já possui o plano
                </div>
              ) : (
                <button
                  onClick={() => handleSubscribe('yearly')}
                  disabled={isLoading}
                  className="w-full py-3 bg-pink-600 text-white rounded-lg font-light hover:bg-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  type="button"
                >
                  {isLoading ? 'processando...' : 'escolher anual'}
                </button>
              )}
            </motion.div>
          </div>

          {/* Botão para continuar grátis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mb-12"
          >
            <button
              onClick={handleContinueFree}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-light underline transition-colors cursor-pointer"
              type="button"
            >
              continuar com plano gratuito
            </button>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-light mt-2">
              chat limitado • sem insights • sem modo de voz
            </p>
          </motion.div>

          {/* Mensagem do giuseppe - Minimalista em baixo */}
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
            <p className="text-sm text-gray-500 font-light leading-relaxed mb-4">
              cada conversa aqui é tratada com cuidado e respeito. seus sentimentos são válidos.
            </p>
            <p className="text-sm text-gray-500 font-light mb-2">
              com amor,
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              fundador do desabafo.io
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

