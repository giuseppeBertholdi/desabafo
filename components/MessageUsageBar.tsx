'use client'

import { motion } from 'framer-motion'

interface MessageUsageBarProps {
  messagesSent: number
  maxMessages: number
  percentage: number
  isLimitReached: boolean
}

export default function MessageUsageBar({ 
  messagesSent, 
  maxMessages, 
  percentage, 
  isLimitReached 
}: MessageUsageBarProps) {
  // Cores baseadas no uso (estilo calmi.so)
  const getColor = () => {
    if (isLimitReached) return 'bg-red-500'
    if (percentage >= 90) return 'bg-orange-500'
    if (percentage >= 75) return 'bg-yellow-500'
    return 'bg-pink-500'
  }

  const getBgColor = () => {
    if (isLimitReached) return 'bg-red-50 dark:bg-red-900/20'
    if (percentage >= 90) return 'bg-orange-50 dark:bg-orange-900/20'
    if (percentage >= 75) return 'bg-yellow-50 dark:bg-yellow-900/20'
    return 'bg-pink-50 dark:bg-pink-900/20'
  }

  const getBorderColor = () => {
    if (isLimitReached) return 'border-red-200 dark:border-red-800'
    if (percentage >= 90) return 'border-orange-200 dark:border-orange-800'
    if (percentage >= 75) return 'border-yellow-200 dark:border-yellow-800'
    return 'border-pink-200 dark:border-pink-800'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <div className={`${getBgColor()} ${getBorderColor()} rounded-2xl p-6 border-2`}>
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">💬</span>
            <span className="text-sm font-light text-gray-700 dark:text-gray-300">
              mensagens enviadas
            </span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-light text-gray-900 dark:text-white">
              {percentage.toFixed(0)}%
            </span>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-light">
              {messagesSent} / {maxMessages}
            </p>
          </div>
        </div>

        {/* Barra de progresso - Estilo calmi.so */}
        <div className="relative w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className={`h-full ${getColor()} rounded-full`}
          />
        </div>

        {/* Mensagem de status */}
        {isLimitReached ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-2 mt-3 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl"
          >
            <span className="text-base">⚠️</span>
            <div className="flex-1">
              <p className="text-xs text-red-800 dark:text-red-200 font-light leading-relaxed">
                <strong className="font-medium">limite atingido:</strong> você usou todas as suas {maxMessages} mensagens deste mês. 
                O limite será renovado no início do próximo mês.
              </p>
            </div>
          </motion.div>
        ) : percentage >= 90 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-2 mt-3 p-3 bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700 rounded-xl"
          >
            <span className="text-base">⚠️</span>
            <div className="flex-1">
              <p className="text-xs text-orange-800 dark:text-orange-200 font-light leading-relaxed">
                <strong className="font-medium">quase no limite:</strong> você já usou {percentage.toFixed(0)}% das suas mensagens deste mês.
              </p>
            </div>
          </motion.div>
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400 font-light text-center">
            {maxMessages - messagesSent} mensagens restantes este mês
          </p>
        )}
      </div>
    </motion.div>
  )
}

