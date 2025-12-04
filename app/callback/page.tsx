'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'

function SpotifyCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
      router.push(`/account?error=${encodeURIComponent(error)}`)
      return
    }

    if (code && state) {
      // A API de callback já processa e redireciona, então apenas redirecionar
      window.location.href = `/api/spotify/callback?code=${code}&state=${state}`
    } else {
      router.push('/account?error=missing_params')
    }
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400 font-light">
          conectando com spotify...
        </p>
      </motion.div>
    </div>
  )
}

export default function SpotifyCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <SpotifyCallbackContent />
    </Suspense>
  )
}

