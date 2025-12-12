'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '@/components/Sidebar'
import { ChatSessionsSkeleton, ChatMessagesSkeleton } from '@/components/Skeletons'

interface ChatSession {
  id: string
  title: string | null
  summary: string | null
  tema: string | null
  created_at: string
  updated_at: string
  message_count?: number
}

// Mapeamento de temas com emojis
const temasMap: Record<string, { emoji: string; nome: string }> = {
  'ansiedade': { emoji: '😰', nome: 'ansiedade' },
  'relacionamento': { emoji: '💔', nome: 'relacionamento' },
  'trabalho': { emoji: '💼', nome: 'trabalho' },
  'tristeza': { emoji: '😔', nome: 'tristeza' },
  'dúvidas': { emoji: '🤔', nome: 'dúvidas' },
  'conquistas': { emoji: '😊', nome: 'conquistas' },
  'sono': { emoji: '😴', nome: 'sono' },
  'estudos': { emoji: '🎓', nome: 'estudos' },
  'família': { emoji: '👨‍👩‍👧‍👦', nome: 'família' },
  'motivação': { emoji: '💪', nome: 'motivação' },
  'raiva': { emoji: '😤', nome: 'raiva' },
  'calma': { emoji: '😌', nome: 'calma' },
  'objetivos': { emoji: '🎯', nome: 'objetivos' },
  'amizade': { emoji: '🤝', nome: 'amizade' },
  'crescimento': { emoji: '🌱', nome: 'crescimento' },
  'solidão': { emoji: '🌙', nome: 'solidão' },
  'medo': { emoji: '😨', nome: 'medo' },
  'estresse': { emoji: '😓', nome: 'estresse' },
  'autoestima': { emoji: '💎', nome: 'autoestima' },
  'perdas': { emoji: '💔', nome: 'perdas' },
  'mudanças': { emoji: '🔄', nome: 'mudanças' },
  'decisões': { emoji: '⚖️', nome: 'decisões' },
  'futuro': { emoji: '🔮', nome: 'futuro' },
  'passado': { emoji: '📜', nome: 'passado' },
  'presente': { emoji: '✨', nome: 'presente' },
  'gratidão': { emoji: '🙏', nome: 'gratidão' },
  'esperança': { emoji: '🌟', nome: 'esperança' },
  'desânimo': { emoji: '😞', nome: 'desânimo' },
  'confusão': { emoji: '🌀', nome: 'confusão' },
  'alegria': { emoji: '😄', nome: 'alegria' },
  'orgulho': { emoji: '🏆', nome: 'orgulho' },
  'culpa': { emoji: '😔', nome: 'culpa' },
  'vergonha': { emoji: '😳', nome: 'vergonha' },
  'insegurança': { emoji: '😟', nome: 'insegurança' },
  'comparação': { emoji: '🔍', nome: 'comparação' },
  'perfeccionismo': { emoji: '💎', nome: 'perfeccionismo' },
  'procrastinação': { emoji: '⏰', nome: 'procrastinação' },
  'rotina': { emoji: '📅', nome: 'rotina' },
  'criatividade': { emoji: '🎨', nome: 'criatividade' },
  'sonhos': { emoji: '💭', nome: 'sonhos' },
  'realidade': { emoji: '🌍', nome: 'realidade' },
  'expectativas': { emoji: '📊', nome: 'expectativas' },
  'aceitação': { emoji: '🤗', nome: 'aceitação' },
  'mudança': { emoji: '🦋', nome: 'mudança' },
  'autocuidado': { emoji: '🧘', nome: 'autocuidado' },
  'limites': { emoji: '🚧', nome: 'limites' },
  'comunicação': { emoji: '💬', nome: 'comunicação' },
  'intimidade': { emoji: '💕', nome: 'intimidade' },
  'confiança': { emoji: '🤝', nome: 'confiança' },
  'traição': { emoji: '💔', nome: 'traição' },
  'perdão': { emoji: '🕊️', nome: 'perdão' },
  'ciúmes': { emoji: '👁️', nome: 'ciúmes' },
  'dependência': { emoji: '🔗', nome: 'dependência' },
  'independência': { emoji: '🦅', nome: 'independência' },
  'liberdade': { emoji: '🕊️', nome: 'liberdade' },
  'responsabilidade': { emoji: '⚖️', nome: 'responsabilidade' }
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export default function HistoryClient() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [selectedTema, setSelectedTema] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadSessions()
  }, [])

  // Verificar sessionId na URL após carregar sessões
  useEffect(() => {
    if (typeof window !== 'undefined' && sessions.length > 0) {
      const urlParams = new URLSearchParams(window.location.search)
      const sessionIdFromUrl = urlParams.get('sessionId')
      if (sessionIdFromUrl && !selectedSession) {
        // Verificar se a sessão existe na lista
        const sessionExists = sessions.some(s => s.id === sessionIdFromUrl)
        if (sessionExists) {
          setSelectedSession(sessionIdFromUrl)
          // Limpar query param da URL
          window.history.replaceState({}, '', '/history')
        }
      }
    }
  }, [sessions, selectedSession])

  useEffect(() => {
    if (selectedSession) {
      loadMessages(selectedSession)
    }
  }, [selectedSession])

  const loadSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('updated_at', { ascending: false }) // Mais novas primeiro

      if (error) throw error

      // Buscar contagem de mensagens para cada sessão
      const sessionsWithCount = await Promise.all(
        (data || []).map(async (session) => {
          const { count } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', session.id)

          return {
            ...session,
            message_count: count || 0
          }
        })
      )

      setSessions(sessionsWithCount)
    } catch (error) {
      console.error('Erro ao carregar sessões:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadMessages = async (sessionId: string) => {
    setIsLoadingMessages(true)
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error)
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'hoje'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'ontem'
    } else {
      return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
    }
  }

  const handleDeleteSession = async (sessionId: string) => {
    setIsDeleting(true)
    try {
      const response = await fetch('/api/sessions/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId })
      })

      if (!response.ok) {
        throw new Error('Erro ao deletar conversa')
      }

      // Remover da lista
      setSessions(prev => prev.filter(s => s.id !== sessionId))
      
      // Se era a sessão selecionada, limpar seleção
      if (selectedSession === sessionId) {
        setSelectedSession(null)
        setMessages([])
      }

      setShowDeleteConfirm(null)
    } catch (error) {
      console.error('Erro ao deletar conversa:', error)
      alert('Erro ao deletar conversa. Tente novamente.')
    } finally {
      setIsDeleting(false)
    }
  }

  const selectedSessionData = sessions.find(s => s.id === selectedSession)

  // Agrupar sessões por tema
  const sessionsByTema = sessions.reduce((acc, session) => {
    const tema = session.tema || 'sem tema'
    if (!acc[tema]) {
      acc[tema] = []
    }
    acc[tema].push(session)
    return acc
  }, {} as Record<string, ChatSession[]>)

  // Ordenar temas por quantidade de sessões (mais frequentes primeiro)
  const temasOrdenados = Object.keys(sessionsByTema).sort((a, b) => 
    sessionsByTema[b].length - sessionsByTema[a].length
  )

  // Filtrar sessões por tema selecionado
  const sessionsToShow = selectedTema 
    ? sessionsByTema[selectedTema] || []
    : sessions

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 relative transition-colors">
      {/* Logo desabafo no topo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute top-6 sm:top-8 left-16 sm:left-8 z-10 flex items-center"
      >
        <button
          onClick={() => router.push('/home')}
          className="text-xl sm:text-2xl font-light text-gray-900 dark:text-white tracking-tight hover:text-pink-500 transition-colors cursor-pointer"
        >
          desabafo.io
        </button>
      </motion.div>

      {/* Sidebar esquerda com ícones */}
      <Sidebar />

      {/* Conteúdo */}
      <div className="flex min-h-screen">
        {/* Lista de sessões - Sidebar esquerda */}
        <div className="w-80 border-r border-gray-100 dark:border-gray-800 pt-20 pb-8 overflow-y-auto pl-20 sm:pl-24">
          <div className="px-6 mb-6">
            <h2 className="text-xl font-light text-gray-900 dark:text-white mb-1">histórico</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-light mb-4">
              {sessions.length} {sessions.length === 1 ? 'conversa' : 'conversas'}
            </p>
            
            {/* Filtro por tema */}
            {temasOrdenados.length > 0 && (
              <div className="mb-4">
                <button
                  onClick={() => setSelectedTema(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-light transition-all cursor-pointer mb-2 ${
                    selectedTema === null
                      ? 'bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  todos os temas ({sessions.length})
                </button>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {temasOrdenados.map((tema) => {
                    const temaInfo = temasMap[tema] || { emoji: '💭', nome: tema }
                    const count = sessionsByTema[tema].length
                    return (
                      <button
                        key={tema}
                        onClick={() => setSelectedTema(tema)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-light transition-all cursor-pointer flex items-center gap-2 ${
                          selectedTema === tema
                            ? 'bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        <span>{temaInfo.emoji}</span>
                        <span className="flex-1">{temaInfo.nome}</span>
                        <span className="text-xs opacity-70">({count})</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="px-6">
              <ChatSessionsSkeleton count={6} />
            </div>
          ) : sessionsToShow.length === 0 ? (
            <div className="px-6 text-center py-12">
              <div className="text-4xl mb-3">💬</div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-light">
                nenhuma conversa ainda
              </p>
              <button
                onClick={() => router.push('/chat')}
                className="mt-4 text-sm text-pink-500 hover:text-pink-600 font-light cursor-pointer"
              >
                começar conversa →
              </button>
            </div>
          ) : (
            <div className="px-3 space-y-1">
              <AnimatePresence>
                {sessionsToShow.map((session, index) => {
                  const temaInfo = session.tema ? temasMap[session.tema] : null
                  // Inverter numeração: primeira sessão (mais recente) tem o maior número
                  const sessionNumber = sessionsToShow.length - index
                  return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className={`group relative w-full rounded-lg transition-all ${
                      selectedSession === session.id
                        ? 'bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <button
                      onClick={() => setSelectedSession(session.id)}
                      className="w-full text-left px-3 py-3 pr-10 rounded-lg transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {temaInfo && (
                            <span className="text-base flex-shrink-0">{temaInfo.emoji}</span>
                          )}
                          <p className="text-sm font-light text-gray-900 dark:text-gray-100 line-clamp-1">
                            {session.title || temaInfo?.nome || `sessão ${sessionNumber}`}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400 dark:text-gray-500 ml-2 flex-shrink-0">
                          {formatDate(session.updated_at)}
                        </span>
                      </div>
                      {session.summary && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-light line-clamp-2">
                          {session.summary}
                        </p>
                      )}
                      {session.message_count && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {session.message_count} {session.message_count === 1 ? 'mensagem' : 'mensagens'}
                        </p>
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowDeleteConfirm(session.id)
                      }}
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 z-10"
                      title="Deletar conversa"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Área de detalhes da sessão */}
        <div className="flex-1 pt-20 pb-8">
          {selectedSession ? (
            <div className="max-w-3xl mx-auto px-8">
              {/* Alerta se não tiver resumo */}
              {!selectedSessionData?.summary && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-xl flex-shrink-0">⚠️</div>
                    <div className="flex-1">
                      <p className="text-sm font-light text-yellow-800 dark:text-yellow-300 mb-1">
                        essa conversa não possui resumo
                      </p>
                      <p className="text-xs text-yellow-700 dark:text-yellow-400 font-light">
                        conversas com menos de 5 mensagens não recebem resumo automático. quando você enviar mais de 5 mensagens, um resumo será gerado automaticamente.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Header da sessão */}
              <div className="mb-8 pb-6 border-b border-gray-100 dark:border-gray-800">
                <h1 className="text-2xl font-light text-gray-900 dark:text-white mb-2">
                  {selectedSessionData?.title || (() => {
                    const index = sessionsToShow.findIndex(s => s.id === selectedSession)
                    return `sessão ${sessionsToShow.length - index}`
                  })()}
                </h1>
                <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                  <span>{formatDate(selectedSessionData?.updated_at || '')}</span>
                  {selectedSessionData?.message_count && (
                    <span>{selectedSessionData.message_count} mensagens</span>
                  )}
                </div>
                {selectedSessionData?.summary && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 font-light mt-4 leading-relaxed">
                    {selectedSessionData.summary}
                  </p>
                )}
              </div>

              {/* Mensagens */}
              <div className="space-y-6 pb-8">
                {isLoadingMessages ? (
                  <ChatMessagesSkeleton count={5} />
                ) : messages.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-sm text-gray-400 dark:text-gray-500 font-light">
                      nenhuma mensagem nesta conversa
                    </p>
                  </div>
                ) : (
                  messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start gap-3 w-full ${
                      message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-pink-400 flex-shrink-0" />
                    )}
                    <div
                      className={`max-w-[75%] min-w-0 ${
                        message.role === 'user'
                          ? 'bg-gray-100 dark:bg-gray-800 rounded-2xl px-5 py-3'
                          : ''
                      }`}
                    >
                      <p className="text-sm font-light leading-relaxed text-gray-900 dark:text-gray-100 break-words whitespace-pre-wrap overflow-wrap-anywhere hyphens-auto">
                        {message.content}
                      </p>
                      <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 block">
                        {new Date(message.created_at).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </motion.div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-5xl mb-4">💭</div>
                <p className="text-gray-500 dark:text-gray-400 font-light">
                  selecione uma conversa para ver os detalhes
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmação de deleção */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDeleteConfirm(null)
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-xl transition-colors"
          >
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">🗑️</div>
              <h2 className="text-2xl font-light text-gray-900 dark:text-white mb-2">
                tem certeza?
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-light">
                essa ação não pode ser desfeita. todas as mensagens desta conversa serão deletadas permanentemente.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                disabled={isDeleting}
                className="flex-1 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-light hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer pointer-events-auto disabled:opacity-50"
                type="button"
              >
                cancelar
              </button>
              <button
                onClick={() => handleDeleteSession(showDeleteConfirm)}
                disabled={isDeleting}
                className="flex-1 py-3 bg-red-600 text-white rounded-lg font-light hover:bg-red-700 transition-all cursor-pointer pointer-events-auto disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                {isDeleting ? 'deletando...' : 'deletar'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

