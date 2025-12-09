'use client'

import { motion } from 'framer-motion'

interface VoiceUsageBarProps {
  minutesUsed: number
  maxMinutes: number
  isLimitReached: boolean
}

export default function VoiceUsageBar({ minutesUsed, maxMinutes, isLimitReached }: VoiceUsageBarProps) {
  const percentage = Math.min(100, (minutesUsed / maxMinutes) * 100)
  const remainingMinutes = Math.max(0, maxMinutes - minutesUsed)

  // Cores baseadas no uso
  const getColor = () => {
    if (isLimitReached) return 'from-red-500 to-red-600'
    if (percentage >= 90) return 'from-orange-400 to-orange-500'
    if (percentage >= 75) return 'from-yellow-400 to-yellow-500'
    return 'from-pink-400 to-pink-500'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto mb-6"
    >
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 shadow-md border border-gray-200 dark:border-gray-700">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎤</span>
            <span className="text-sm font-light text-gray-700 dark:text-gray-300">
              uso de voz este mês
            </span>
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {minutesUsed.toFixed(1)} / {maxMinutes} min
          </span>
        </div>

        {/* Barra de progresso */}
        <div className="relative w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`h-full bg-gradient-to-r ${getColor()} rounded-full`}
          />
        </div>

        {/* Mensagem de status */}
        {isLimitReached ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-2 mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
          >
            <span className="text-base">⚠️</span>
            <div className="flex-1">
              <p className="text-xs text-red-800 dark:text-red-200 font-light leading-relaxed">
                <strong className="font-medium">limite atingido:</strong> você usou todos os seus 500 minutos de voz deste mês. 
                O limite será renovado no início do próximo mês.
              </p>
            </div>
          </motion.div>
        ) : percentage >= 90 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-2 mt-3 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl"
          >
            <span className="text-base">⚠️</span>
            <div className="flex-1">
              <p className="text-xs text-orange-800 dark:text-orange-200 font-light leading-relaxed">
                <strong className="font-medium">quase no limite:</strong> restam apenas {remainingMinutes.toFixed(1)} minutos de voz este mês.
              </p>
            </div>
          </motion.div>
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400 font-light text-center">
            {remainingMinutes.toFixed(0)} minutos restantes este mês
          </p>
        )}
      </div>
    </motion.div>
  )
}

