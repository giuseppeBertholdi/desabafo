'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

function PricingSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push('/login')
          return
        }

        // Tentar sincronizar assinatura manualmente (caso o webhook não tenha processado)
        try {
          await fetch('/api/stripe/sync-subscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          })
        } catch (error) {
          console.error('Erro ao sincronizar assinatura:', error)
        }

        // Aguardar um pouco para garantir que foi processado
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Verificar se a assinatura foi criada
        const { data: subscription } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('status', 'active')
          .single()

        if (subscription) {
          setIsLoading(false)
          // Redirecionar para home após 2 segundos
          setTimeout(() => {
            router.push('/home')
          }, 2000)
        } else {
          // Se ainda não processou, tentar mais uma vez após 2 segundos
          setTimeout(async () => {
            try {
              await fetch('/api/stripe/sync-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
              })
            } catch (error) {
              console.error('Erro na segunda tentativa de sincronização:', error)
            }
            router.push('/home')
          }, 2000)
        }
      } catch (error) {
        console.error('Erro ao verificar assinatura:', error)
        router.push('/home')
      }
    }

    checkSubscription()
  }, [router, supabase])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center"
      >
        {isLoading ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 border-4 border-pink-600 border-t-transparent rounded-full mx-auto mb-6"
            />
            <p className="text-lg text-gray-700 dark:text-gray-300 font-light">
              processando sua assinatura...
            </p>
          </>
        ) : (
          <>
            <div className="text-6xl mb-6">✅</div>
            <h1 className="text-3xl font-light text-gray-900 dark:text-white mb-4">
              assinatura confirmada!
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-light mb-6">
              você agora tem acesso a todos os recursos do plano pro.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 font-light">
              redirecionando para o home...
            </p>
          </>
        )}
      </motion.div>
    </div>
  )
}

export default function PricingSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="w-16 h-16 border-4 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <PricingSuccessContent />
    </Suspense>
  )
}

