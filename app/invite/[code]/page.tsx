'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function InvitePage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [isValidating, setIsValidating] = useState(true)
  const [isValid, setIsValid] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const validateCode = async () => {
      const code = params.code as string
      
      if (!code) {
        setError('Código de convite inválido')
        setIsValidating(false)
        return
      }

      // Verificar se o código existe
      try {
        const response = await fetch(`/api/referral/validate?code=${code}`)
        const data = await response.json()
        
        if (response.ok && data.valid) {
          setIsValid(true)
          // Salvar código no localStorage para usar no login
          localStorage.setItem('referralCode', code)
        } else {
          setError(data.error || 'Código de convite inválido')
        }
      } catch (err) {
        console.error('Erro ao validar código:', err)
        setError('Erro ao validar código de convite')
      } finally {
        setIsValidating(false)
      }
    }

    validateCode()
  }, [params.code])

  const handleGetStarted = () => {
    const code = params.code as string
    // Redirecionar para login com código de referência
    router.push(`/login?ref=${code}`)
  }

  if (isValidating) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">validando convite...</p>
        </div>
      </div>
    )
  }

  if (error || !isValid) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="text-6xl mb-6">😕</div>
          <h1 className="text-3xl font-light text-gray-900 dark:text-white mb-4">
            código inválido
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {error || 'este código de convite não é válido ou já foi usado.'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-8 py-3 bg-pink-600 text-white rounded-full font-light hover:bg-pink-700 transition-all"
          >
            voltar ao início
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-2xl"
      >
        <div className="text-7xl mb-8">🎉</div>
        <h1 className="text-4xl sm:text-5xl font-light text-gray-900 dark:text-white mb-6">
          você foi convidado!
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 font-light">
          alguém te convidou para usar o desabafo.io
        </p>
        <p className="text-base text-gray-500 dark:text-gray-500 mb-12 font-light">
          crie sua conta e comece a conversar com a Luna, nossa IA que está sempre aqui para você
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGetStarted}
          className="px-12 py-4 bg-pink-600 text-white rounded-full font-light hover:bg-pink-700 transition-all text-lg shadow-lg hover:shadow-xl"
        >
          começar agora
        </motion.button>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-8 font-light">
          ao criar sua conta, você ajuda seu amigo a ganhar o plano Essential
        </p>
      </motion.div>
    </div>
  )
}

