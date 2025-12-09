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
  onSessionStart: (sessionId: string) => void
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
    onSessionStart(sessionId)
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
    if (currentDuration >= MAX_DURATION_SECONDS && isActive) {
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
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Sessões Restantes */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-light text-gray-900 dark:text-white mb-1">
              Sessões de Voz
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-light">
              {stats?.remaining || 0} de {stats?.total || 50} restantes
            </p>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            type="button"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>

        {/* Barra de Progresso das Sessões */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-pink-400 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((stats?.used || 0) / (stats?.total || 50)) * 100}%` }}
            />
          </div>
        </div>

        {/* Timer da Sessão Atual */}
        {isActive && currentSessionId && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-xl p-4 mb-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-300 font-light">Sessão Atual</span>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-2 h-2 bg-red-500 rounded-full"
              />
            </div>
            
            {/* Timer Grande */}
            <div className="text-center mb-3">
              <div className="text-4xl font-light text-gray-900 dark:text-white tabular-nums">
                {formatTime(currentDuration)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Tempo restante: {formatTime(timeRemaining)}
              </div>
            </div>

            {/* Barra de Progresso do Tempo */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-3">
              <div
                className="bg-gradient-to-r from-pink-500 to-purple-600 h-1.5 rounded-full transition-all duration-1000"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            {/* Botão Finalizar */}
            <button
              onClick={endCurrentSession}
              className="w-full py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-light transition-all"
              type="button"
            >
              Finalizar Sessão
            </button>
          </motion.div>
        )}

        {/* Botões de Ação */}
        {!isActive && (
          <div className="space-y-2">
            {stats?.hasIncompleteSession && stats.incompleteSessionId && (
              <button
                onClick={() => continueSession(stats.incompleteSessionId!)}
                className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white rounded-lg font-light transition-all shadow-sm"
                type="button"
              >
                ↻ Continuar Última Sessão ({formatTime(stats.incompleteSessionDuration)})
              </button>
            )}
            
            <button
              onClick={createNewSession}
              disabled={stats?.remaining === 0}
              className="w-full py-3 bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-light transition-all shadow-sm"
              type="button"
            >
              {stats?.remaining === 0 ? '✓ Limite Atingido' : '+ Nova Sessão'}
            </button>
          </div>
        )}
      </div>

      {/* Histórico de Sessões */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h4 className="text-base font-light text-gray-900 dark:text-white">
                Histórico de Sessões
              </h4>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {sessions.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm font-light">
                  Nenhuma sessão ainda
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {sessions.map((session) => (
                    <div key={session.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            session.is_completed || session.ended_at 
                              ? 'bg-green-500' 
                              : 'bg-yellow-500'
                          }`} />
                          <span className="text-sm font-light text-gray-700 dark:text-gray-300">
                            {formatTime(session.duration_seconds)}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-light">
                          {formatDate(session.started_at)}
                        </span>
                      </div>
                      
                      {session.summary && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-light line-clamp-2">
                          {session.summary}
                        </p>
                      )}
                      
                      {!session.is_completed && !session.ended_at && (
                        <button
                          onClick={() => continueSession(session.id)}
                          className="mt-2 text-xs text-pink-600 dark:text-pink-400 hover:underline font-light"
                          type="button"
                        >
                          Continuar →
                        </button>
                      )}
                    </div>
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

