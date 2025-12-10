'use client'

import { motion } from 'framer-motion'

// Skeleton base com animação de shimmer otimizada
const Shimmer = () => (
  <div 
    className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent"
    aria-hidden="true"
  />
)

// Skeleton para mensagens de chat
export function ChatMessageSkeleton() {
  return (
    <div className="flex items-start gap-3 animate-pulse" role="status" aria-label="Carregando mensagem">
      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" aria-hidden="true" />
      <div className="flex-1 space-y-2" aria-hidden="true">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      </div>
      <span className="sr-only">Carregando mensagem...</span>
    </div>
  )
}

// Skeleton para lista de mensagens
export function ChatMessagesSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.1 }}
        >
          <ChatMessageSkeleton />
        </motion.div>
      ))}
    </div>
  )
}

// Skeleton para entrada de diário
export function JournalEntrySkeleton() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 animate-pulse">
      <Shimmer />
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
        </div>
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20" />
        </div>
      </div>
    </div>
  )
}

// Skeleton para lista de entradas de diário
export function JournalEntriesSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
        >
          <JournalEntrySkeleton />
        </motion.div>
      ))}
    </div>
  )
}

// Skeleton para sessões de chat no histórico
export function ChatSessionSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 animate-pulse">
      <Shimmer />
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
        </div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20" />
        </div>
      </div>
    </div>
  )
}

// Skeleton para lista de sessões
export function ChatSessionsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
        >
          <ChatSessionSkeleton />
        </motion.div>
      ))}
    </div>
  )
}

// Skeleton para cards de tema
export function ThemeCardSkeleton() {
  return (
    <div className="border border-gray-100 dark:border-gray-700 rounded-full px-3 py-1.5 bg-white dark:bg-gray-800 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
      </div>
    </div>
  )
}

// Skeleton para lista de temas
export function ThemesSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: i * 0.03 }}
        >
          <ThemeCardSkeleton />
        </motion.div>
      ))}
    </div>
  )
}

// Skeleton para insights
export function InsightCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-800 animate-pulse">
      <Shimmer />
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
        </div>
      </div>
    </div>
  )
}

// Skeleton para lista de insights
export function InsightsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.1 }}
        >
          <InsightCardSkeleton />
        </motion.div>
      ))}
    </div>
  )
}

// Skeleton para botão
export function ButtonSkeleton({ width = 'w-24' }: { width?: string }) {
  return (
    <div className={`h-10 ${width} bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse`} />
  )
}

// Skeleton para área de texto
export function TextAreaSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      <div className="flex justify-between">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
      </div>
    </div>
  )
}

// Skeleton para página completa
export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse" />
        <div className="space-y-4">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  )
}

