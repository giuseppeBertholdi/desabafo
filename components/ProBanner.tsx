'use client'

import { memo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useUserPlan } from '@/lib/getUserPlanClient'

const ProBanner = memo(function ProBanner() {
  const router = useRouter()
  const { plan, isLoading } = useUserPlan()

  // Só mostrar para usuários free
  if (isLoading || plan !== 'free') {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="fixed top-3 right-4 sm:right-6 z-50"
    >
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => router.push('/pricing')}
        className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-medium rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer"
        type="button"
        aria-label="Experimente o plano Pro"
      >
        experimente o pro
      </motion.button>
    </motion.div>
  )
})

export default ProBanner

