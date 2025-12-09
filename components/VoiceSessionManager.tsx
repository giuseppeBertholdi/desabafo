'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/contexts/ToastContext'

interface VoiceSession {
  id: string
  user_id: string
  duration_seconds: number
  is_completed: boolean
  transcript?: string
  summary?: string
  started_at: string
  ended_at?: string
  created_at: string
}

interface SessionStats {
  total: number
  used: number
  remaining: number
  hasIncompleteSession: boolean
  incompleteSessionId: string | null
  incompleteSessionDuration: number
}

interface VoiceSessionManagerProps {
  onSessionStart: (sessionId: string, initialDuration?: number) => void
  onSessionEnd: () => void
  currentSessionId: string | null
  currentDuration: number
  isActive: boolean
}

const MAX_DURATION_SECONDS = 600 // 10 minutos

export default function VoiceSessionManager({
  onSessionStart,
  onSessionEnd,
  currentSessionId,
  currentDuration,
  isActive
}: VoiceSessionManagerProps) {
  const [sessions, setSessions] = useState<VoiceSession[]>([])
  const [stats, setStats] = useState<SessionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showHistory, setShowHistory] = useState(false)
  const { showError, showSuccess } = useToast()

  // Buscar sessões
  const fetchSessions = useCallback(async () => {
    try {
      const response = await fetch('/api/voice/sessions')
      if (!response.ok) throw new Error('Erro ao buscar sessões')
      
      const data = await response.json()
      setSessions(data.sessions)
      setStats(data.stats)
    } catch (error) {
      console.error('Erro ao buscar sessões:', error)
      showError('Erro ao carregar histórico de sessões')
    } finally {
      setLoading(false)
    }
  }, [showError])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  // Criar nova sessão
  const createNewSession = async () => {
    try {
      const response = await fetch('/api/voice/sessions', {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        if (data.hasIncompleteSession) {
          showError('Você tem uma sessão não finalizada. Continue-a primeiro.')
          return
        }
        if (data.limit) {
          showError('Você atingiu o limite de 50 sessões de voz.')
          return
        }
        throw new Error(data.error || 'Erro ao criar sessão')
      }
      
      showSuccess('Nova sessão criada!')
      await fetchSessions()
      onSessionStart(data.session.id)
    } catch (error: any) {
      console.error('Erro ao criar sessão:', error)
      showError(error.message || 'Erro ao criar sessão')
    }
  }

  // Continuar sessão incompleta
  const continueSession = async (sessionId: string) => {
    // Buscar duração atual da sessão
    const session = sessions.find(s => s.id === sessionId)
    if (session) {
      onSessionStart(sessionId, session.duration_seconds)
    } else {
      onSessionStart(sessionId)
    }
    showSuccess('Continuando sessão anterior')
  }

  // Finalizar sessão atual
  const endCurrentSession = async () => {
    if (!currentSessionId) return

    try {
      const response = await fetch('/api/voice/sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentSessionId,
          duration_seconds: currentDuration,
          is_completed: true
        })
      })

      if (!response.ok) throw new Error('Erro ao finalizar sessão')
      
      showSuccess('Sessão finalizada!')
      await fetchSessions()
      onSessionEnd()
    } catch (error) {
      console.error('Erro ao finalizar sessão:', error)
      showError('Erro ao finalizar sessão')
    }
  }

  // Atualizar duração da sessão (chamado periodicamente)
  const updateSessionDuration = async (sessionId: string, duration: number) => {
    try {
      await fetch('/api/voice/sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          duration_seconds: duration
        })
      })
    } catch (error) {
      console.error('Erro ao atualizar duração:', error)
    }
  }

  // Atualizar duração a cada 5 segundos quando ativo
  useEffect(() => {
    if (!isActive || !currentSessionId) return

    const interval = setInterval(() => {
      updateSessionDuration(currentSessionId, currentDuration)
    }, 5000)

    return () => clearInterval(interval)
  }, [isActive, currentSessionId, currentDuration])

  // Verificar se atingiu o tempo máximo
  useEffect(() => {
    if (isActive && currentDuration > 0 && currentDuration >= MAX_DURATION_SECONDS) {
      showError('Tempo máximo de 10 minutos atingido!')
      endCurrentSession()
    }
  }, [currentDuration, isActive])

  // Formatar tempo
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  const timeRemaining = MAX_DURATION_SECONDS - currentDuration
  const progressPercentage = (currentDuration / MAX_DURATION_SECONDS) * 100

  return (
    <div className="space-y-4">
      {/* Stats e Ações */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-5 sm:p-7 shadow-lg border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white">
                Sessões de Voz
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-light">
                {stats?.remaining || 0} de {stats?.total || 50} disponíveis
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all group"
            type="button"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-pink-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>

        {/* Barra de Progresso das Sessões */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Uso mensal</span>
            <span className="text-xs font-medium text-pink-600 dark:text-pink-400">
              {Math.round(((stats?.used || 0) / (stats?.total || 50)) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((stats?.used || 0) / (stats?.total || 50)) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 h-2.5 rounded-full shadow-sm"
            />
          </div>
        </div>

        {/* Timer da Sessão Atual */}
        {isActive && currentSessionId && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-gradient-to-br from-pink-50 via-purple-50 to-pink-50 dark:from-pink-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-2xl p-5 mb-5 border border-pink-200/50 dark:border-pink-800/30 overflow-hidden"
          >
            {/* Background Animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-purple-500/5 animate-pulse" />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-lg shadow-red-500/50"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Gravando</span>
                </div>
                <div className="px-3 py-1 bg-white/50 dark:bg-black/20 rounded-full backdrop-blur-sm">
                  <span className="text-xs font-medium text-pink-600 dark:text-pink-400">Ao Vivo</span>
                </div>
              </div>
              
              {/* Timer Grande */}
              <div className="text-center mb-4">
                <div className="text-5xl sm:text-6xl font-light text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-400 dark:to-purple-400 tabular-nums tracking-tight mb-2">
                  {formatTime(currentDuration)}
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Restam {formatTime(timeRemaining)}</span>
                </div>
              </div>

              {/* Barra de Progresso do Tempo */}
              <div className="relative w-full bg-gray-200/50 dark:bg-gray-700/30 rounded-full h-2 mb-4 overflow-hidden backdrop-blur-sm">
                <motion.div
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 rounded-full shadow-sm"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
              </div>

              {/* Botão Finalizar */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={endCurrentSession}
                className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-red-500/30 hover:shadow-red-500/50"
                type="button"
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 6h12v12H6z" />
                  </svg>
                  <span>Finalizar Sessão</span>
                </div>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Botões de Ação */}
        {!isActive && (
          <div className="space-y-3">
            {stats?.hasIncompleteSession && stats.incompleteSessionId && (
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => continueSession(stats.incompleteSessionId!)}
                className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-500 hover:via-orange-500 hover:to-amber-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50"
                type="button"
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Continuar Sessão ({formatTime(stats.incompleteSessionDuration)})</span>
                </div>
              </motion.button>
            )}
            
            <motion.button
              whileHover={stats?.remaining !== 0 ? { scale: 1.02, y: -1 } : {}}
              whileTap={stats?.remaining !== 0 ? { scale: 0.98 } : {}}
              onClick={createNewSession}
              disabled={stats?.remaining === 0}
              className="w-full py-3.5 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 hover:from-pink-600 hover:via-purple-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-white rounded-xl font-medium transition-all shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 disabled:shadow-none"
              type="button"
            >
              <div className="flex items-center justify-center gap-2">
                {stats?.remaining === 0 ? (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                    <span>Limite Atingido</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Nova Sessão</span>
                  </>
                )}
              </div>
            </motion.button>
          </div>
        )}
      </motion.div>

      {/* Histórico de Sessões */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl overflow-hidden shadow-lg border border-gray-200/50 dark:border-gray-700/50"
          >
            <div className="p-5 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-pink-50/50 to-purple-50/50 dark:from-pink-900/10 dark:to-purple-900/10">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 className="text-base font-medium text-gray-900 dark:text-white">
                  Histórico de Sessões
                </h4>
                <span className="ml-auto px-2 py-0.5 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 text-xs font-medium rounded-full">
                  {sessions.length}
                </span>
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {sessions.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-light">
                    Nenhuma sessão gravada ainda
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Crie sua primeira sessão de voz
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                  {sessions.map((session, index) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 hover:bg-gradient-to-r hover:from-pink-50/50 hover:to-purple-50/50 dark:hover:from-pink-900/10 dark:hover:to-purple-900/10 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full shadow-sm ${
                            session.is_completed || session.ended_at 
                              ? 'bg-green-500 shadow-green-500/50' 
                              : 'bg-amber-500 shadow-amber-500/50 animate-pulse'
                          }`} />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-base font-medium text-gray-900 dark:text-white tabular-nums">
                                {formatTime(session.duration_seconds)}
                              </span>
                              {!session.is_completed && !session.ended_at && (
                                <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-medium rounded-full">
                                  Em andamento
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-light">
                              {formatDate(session.started_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {session.summary && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-light line-clamp-2 ml-6 mb-2">
                          {session.summary}
                        </p>
                      )}
                      
                      {!session.is_completed && !session.ended_at && (
                        <motion.button
                          whileHover={{ x: 4 }}
                          onClick={() => continueSession(session.id)}
                          className="ml-6 mt-2 flex items-center gap-1 text-xs text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 font-medium group-hover:underline"
                          type="button"
                        >
                          <span>Continuar sessão</span>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </motion.button>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

