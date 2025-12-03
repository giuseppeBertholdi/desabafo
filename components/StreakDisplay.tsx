'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface StreakData {
  type: 'chat' | 'journal'
  current_streak: number
  longest_streak: number
  last_activity_date: string
  isAtRisk?: boolean
  daysSinceLastActivity?: number
}

interface StreakDisplayProps {
  type: 'chat' | 'journal'
  compact?: boolean
}

export default function StreakDisplay({ type, compact = false }: StreakDisplayProps) {
  const [streak, setStreak] = useState<StreakData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showCelebration, setShowCelebration] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadStreak()
  }, [type])

  const loadStreak = async () => {
    try {
      const response = await fetch('/api/streaks')
      if (response.ok) {
        const { streaks } = await response.json()
        const userStreak = streaks?.find((s: StreakData) => s.type === type)
        setStreak(userStreak || null)
        
        // Mostrar celebração se for um novo recorde ou milestone
        if (userStreak && userStreak.current_streak > 0) {
          const milestones = [7, 14, 30, 50, 100, 200, 365]
          if (milestones.includes(userStreak.current_streak)) {
            setShowCelebration(true)
            setTimeout(() => setShowCelebration(false), 3000)
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar streak:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'}`}>
        <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
        <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    )
  }

  // Sempre mostrar, mesmo com streak 0
  const currentStreak = streak?.current_streak || 0

  const isAtRisk = streak?.isAtRisk || false
  const flameIntensity = Math.min(currentStreak / 30, 1) // Intensidade baseada no streak

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'}`}
      >
        {/* Ícone de chama */}
          <motion.div
            animate={{
              scale: isAtRisk && currentStreak > 0 ? [1, 1.1, 1] : 1,
              filter: currentStreak > 0 
                ? (isAtRisk 
                  ? `brightness(${1 + flameIntensity * 0.3}) drop-shadow(0 0 ${4 * flameIntensity}px rgba(255, 140, 0, ${0.6 * flameIntensity}))`
                  : `brightness(${1 + flameIntensity * 0.2}) drop-shadow(0 0 ${3 * flameIntensity}px rgba(255, 140, 0, ${0.4 * flameIntensity}))`)
                : 'brightness(0.5) grayscale(0.5)'
            }}
            transition={{
              duration: isAtRisk && currentStreak > 0 ? 1.5 : 2,
              repeat: isAtRisk && currentStreak > 0 ? Infinity : 0,
              ease: 'easeInOut'
            }}
            className={`relative ${compact ? 'w-5 h-5' : 'w-6 h-6'} flex items-center justify-center`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className={`${compact ? 'w-5 h-5' : 'w-6 h-6'} ${
                currentStreak === 0
                  ? 'text-gray-300 dark:text-gray-600'
                  : isAtRisk 
                  ? 'text-orange-500 dark:text-orange-400' 
                  : currentStreak >= 30
                  ? 'text-red-500 dark:text-red-400'
                  : currentStreak >= 14
                  ? 'text-orange-500 dark:text-orange-400'
                  : 'text-yellow-500 dark:text-yellow-400'
              } transition-colors`}
            >
            <path
              d="M12 2C10.5 2 9 3 9 5C9 6 9.5 7 10 8C10.5 9 11 10 11 11C11 12.5 9.5 14 8 14C8 15 8.5 16 9 17C9.5 18 10 19 10 20C10 21.5 11.5 22 12.5 22C13.5 22 15 21.5 15 20C15 19 14.5 18 14 17C13.5 16 13 15 13 14C13 12.5 14.5 11 16 11C16 10 15.5 9 15 8C14.5 7 14 6 14 5C14 3 12.5 2 12 2Z"
              fill="currentColor"
            />
          </svg>
          
          {/* Efeito de brilho para streaks altos */}
          {currentStreak >= 30 && (
            <motion.div
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="absolute inset-0 rounded-full bg-yellow-400/30 blur-sm"
            />
          )}
        </motion.div>

        {/* Número do streak */}
        <span className={`font-medium ${
          currentStreak === 0
            ? 'text-gray-400 dark:text-gray-500'
            : isAtRisk 
            ? 'text-orange-600 dark:text-orange-400' 
            : 'text-gray-700 dark:text-gray-300'
        }`}>
          {currentStreak}
        </span>

        {/* Indicador de risco */}
        {isAtRisk && currentStreak > 0 && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-xs text-orange-600 dark:text-orange-400 font-light"
          >
            {!compact && 'quase perdendo!'}
          </motion.span>
        )}
      </motion.div>

      {/* Celebração de milestone */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -20 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl border border-pink-200 dark:border-pink-800 max-w-sm mx-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="text-6xl text-center mb-4"
              >
                🔥
              </motion.div>
              <h3 className="text-2xl font-light text-center text-gray-900 dark:text-white mb-2">
                {currentStreak} dias seguidos!
              </h3>
              <p className="text-sm text-center text-gray-600 dark:text-gray-400 font-light">
                você está incrível! continue assim 💪
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

