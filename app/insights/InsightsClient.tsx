'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '@/components/Sidebar'
import { useUserPlan } from '@/lib/getUserPlanClient'
import MarkdownRenderer from '@/components/MarkdownRenderer'

interface InsightsData {
  totalMessages: number
  totalSessions: number
  avgMessagesPerSession: number
  sentimentDistribution: {
    feliz: number
    calmo: number
    esperançoso: number
    grato: number
    triste: number
    ansioso: number
    frustrado: number
    irritado: number
    preocupado: number
    [key: string]: number
  }
  summary: string
}

export default function InsightsClient() {
  const [period, setPeriod] = useState<'7d' | '15d' | '30d' | 'all'>('30d')
  const [initialPeriod] = useState<'7d' | '15d' | '30d' | 'all'>('30d')
  const [data, setData] = useState<InsightsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showSummaryUpgradeModal, setShowSummaryUpgradeModal] = useState(false)
  const [hasChangedPeriod, setHasChangedPeriod] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { plan, isLoading: isLoadingPlan } = useUserPlan()

  // Cache simples baseado em localStorage
  const getCachedData = (period: string) => {
    try {
      const cached = localStorage.getItem(`insights_${period}`)
      if (cached) {
        const { data: cachedData, timestamp } = JSON.parse(cached)
        // Cache válido por 5 minutos
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          return cachedData
        }
      }
    } catch (e) {
      // Ignorar erros de cache
    }
    return null
  }

  const setCachedData = (period: string, data: InsightsData) => {
    try {
      localStorage.setItem(`insights_${period}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }))
    } catch (e) {
      // Ignorar erros de cache
    }
  }

  const loadInsights = async () => {
    setIsLoading(true)
    
    // Verificar cache primeiro
    const cached = getCachedData(period)
    if (cached) {
      setData(cached)
      setIsLoading(false)
      return
    }

    try {
      // Calcular data de início baseado no período
      const now = new Date()
      let startDate: Date | null = null

      switch (period) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case '15d':
          startDate = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)
          break
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case 'all':
          startDate = null
          break
      }

      // Buscar sessões do usuário
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      let sessionsQuery = supabase
        .from('chat_sessions')
        .select('id, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (startDate) {
        sessionsQuery = sessionsQuery.gte('created_at', startDate.toISOString())
      }

      const { data: sessions, error: sessionsError } = await sessionsQuery

      if (sessionsError) throw sessionsError

      // Buscar mensagens das sessões do usuário
      const sessionIds = sessions?.map(s => s.id) || []
      let messages: any[] = []
      
      if (sessionIds.length > 0) {
        let messagesQuery = supabase
          .from('chat_messages')
          .select('id, content, role, created_at, session_id')
          .in('session_id', sessionIds)

        if (startDate) {
          messagesQuery = messagesQuery.gte('created_at', startDate.toISOString())
        }

        const { data: messagesData, error: messagesError } = await messagesQuery

        if (messagesError) throw messagesError
        messages = messagesData || []
      }

      // Calcular estatísticas
      const totalMessages = messages?.length || 0
      const totalSessions = sessions?.length || 0
      const avgMessagesPerSession = totalSessions > 0 ? Math.round(totalMessages / totalSessions) : 0

      // Analisar sentimentos com IA
      const sentimentDistribution = await analyzeSentiments(messages || [])

      // Gerar resumo apenas para usuários PRO
      let summary = ''
      if (plan === 'pro') {
        summary = await generateSummary(sessions || [], messages || [], period)
      }
      // Para usuários free, não gerar resumo

      const insightsData = {
        totalMessages,
        totalSessions,
        avgMessagesPerSession,
        sentimentDistribution,
        summary
      }
      
      setData(insightsData)
      setCachedData(period, insightsData) // Salvar no cache
    } catch (error) {
      console.error('Erro ao carregar insights:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkPeriodChangeStatus()
    if (!isLoadingPlan) {
      loadInsights()
    }
  }, [isLoadingPlan])

  useEffect(() => {
    if (!isLoadingPlan) {
      loadInsights()
    }
  }, [period, plan])

  const checkPeriodChangeStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('last_insights_period_change')
        .eq('user_id', user.id)
        .single()

      if (profile?.last_insights_period_change) {
        const lastChange = new Date(profile.last_insights_period_change)
        const today = new Date()
        const isSameDay = lastChange.toDateString() === today.toDateString()
        setHasChangedPeriod(isSameDay)
      }
    } catch (error) {
      console.error('Erro ao verificar status de mudança de período:', error)
    }
  }

  const handlePeriodChange = async (newPeriod: '7d' | '15d' | '30d' | 'all') => {
    // Se já é o período atual, não fazer nada
    if (newPeriod === period) return

    // Se voltou para o período inicial, sempre permitir
    if (newPeriod === initialPeriod) {
      setPeriod(newPeriod)
      return
    }

    // Se já mudou o período hoje (e não está voltando para o inicial), mostrar modal
    if (hasChangedPeriod) {
      setShowUpgradeModal(true)
      return
    }

    // Se é a primeira mudança do dia, permitir e atualizar no banco
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('user_profiles')
          .update({ 
            last_insights_period_change: new Date().toISOString().split('T')[0] 
          })
          .eq('user_id', user.id)
        
        setHasChangedPeriod(true)
        setPeriod(newPeriod)
      }
    } catch (error) {
      console.error('Erro ao atualizar mudança de período:', error)
      // Em caso de erro, ainda permitir a mudança
      setPeriod(newPeriod)
    }
  }

  const analyzeSentiments = async (messages: any[]) => {
    const userMessages = messages.filter(m => m.role === 'user')
    
    if (userMessages.length === 0) {
      return {
        feliz: 0, calmo: 0, esperançoso: 0, grato: 0,
        triste: 0, ansioso: 0, frustrado: 0, irritado: 0, preocupado: 0
      }
    }

    // Se tiver poucas mensagens, usar análise local (mais rápido)
    if (userMessages.length <= 5) {
      // Usar fallback local para poucas mensagens
    } else {
      try {
        // Usar IA apenas para muitas mensagens, limitando quantidade
        const response = await fetch('/api/insights/analyze-sentiments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: userMessages.slice(0, 15).map(m => m.content) // Limitar a 15 mensagens
          })
        })

        if (response.ok) {
          const { distribution } = await response.json()
          return distribution
        }
      } catch (error) {
        console.error('Erro ao analisar sentimentos com IA:', error)
      }
    }

    // Fallback: análise básica melhorada
    const sentiments = {
      feliz: 0,
      calmo: 0,
      esperançoso: 0,
      grato: 0,
      triste: 0,
      ansioso: 0,
      frustrado: 0,
      irritado: 0,
      preocupado: 0
    }

    // Palavras-chave expandidas e mais específicas
    const emotionKeywords: { [key: string]: string[] } = {
      feliz: ['feliz', 'alegre', 'bom', 'ótimo', 'excelente', 'conquista', 'sucesso', 'satisfeito', 'realizado', 'animado', 'empolgado'],
      calmo: ['calmo', 'tranquilo', 'paz', 'sereno', 'relaxado', 'equilibrado', 'centrado'],
      esperançoso: ['esperança', 'esperançoso', 'otimista', 'confiante', 'positivo', 'futuro', 'sonho', 'meta'],
      grato: ['gratidão', 'grato', 'agradecido', 'gratidão', 'reconhecimento', 'valorizar', 'apreciar'],
      triste: ['triste', 'tristeza', 'deprimido', 'chateado', 'mal', 'ruim', 'difícil', 'desanimado', 'melancólico', 'vazio'],
      ansioso: ['ansioso', 'ansiedade', 'nervoso', 'estresse', 'pressão', 'medo', 'tensão', 'inquieto', 'preocupado'],
      frustrado: ['frustrado', 'frustração', 'decepcionado', 'insatisfeito', 'bloqueado', 'impedido', 'sem saída'],
      irritado: ['irritado', 'raiva', 'bravo', 'irritação', 'nervoso', 'chateado', 'revoltado', 'indignado'],
      preocupado: ['preocupado', 'preocupação', 'preocupar', 'inquietação', 'incerteza', 'dúvida', 'medo']
    }

    userMessages.forEach(message => {
      const content = message.content.toLowerCase()
      let classified = false
      let maxMatches = 0
      let dominantEmotion = 'calmo'

      // Contar matches para cada emoção
      Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
        const matches = keywords.filter(word => content.includes(word)).length
        if (matches > maxMatches) {
          maxMatches = matches
          dominantEmotion = emotion
          classified = true
        }
      })

      if (classified && maxMatches > 0) {
        sentiments[dominantEmotion as keyof typeof sentiments]++
      } else {
        // Se não encontrou nada específico, analisar contexto
        if (content.length < 20) {
          sentiments.calmo++
        } else if (content.includes('?')) {
          sentiments.preocupado++
        } else {
          sentiments.calmo++
        }
      }
    })

    // Normalizar para porcentagens
    const total = Object.values(sentiments).reduce((a, b) => a + b, 0)
    if (total === 0) {
      return {
        feliz: 11, calmo: 11, esperançoso: 11, grato: 11,
        triste: 11, ansioso: 11, frustrado: 11, irritado: 11, preocupado: 11
      }
    }

    const percentages = {
      feliz: Math.round((sentiments.feliz / total) * 100),
      calmo: Math.round((sentiments.calmo / total) * 100),
      esperançoso: Math.round((sentiments.esperançoso / total) * 100),
      grato: Math.round((sentiments.grato / total) * 100),
      triste: Math.round((sentiments.triste / total) * 100),
      ansioso: Math.round((sentiments.ansioso / total) * 100),
      frustrado: Math.round((sentiments.frustrado / total) * 100),
      irritado: Math.round((sentiments.irritado / total) * 100),
      preocupado: Math.round((sentiments.preocupado / total) * 100)
    }

    // Ajustar para garantir soma = 100%
    const sum = Object.values(percentages).reduce((a, b) => a + b, 0)
    if (sum !== 100) {
      const diff = 100 - sum
      const maxKey = Object.entries(percentages).reduce((a, b) => percentages[a[0] as keyof typeof percentages] > percentages[b[0] as keyof typeof percentages] ? a : b)[0]
      percentages[maxKey as keyof typeof percentages] += diff
    }

    return percentages
  }

  const generateSummary = async (sessions: any[], messages: any[], period: string) => {
    try {
      const periodText = period === '7d' ? 'últimos 7 dias' : 
                        period === '15d' ? 'últimos 15 dias' :
                        period === '30d' ? 'último mês' : 'todo o período'

      // Usar mais mensagens para análise detalhada
      const sampleMessages = messages
        .filter(m => m.role === 'user')
        .slice(0, 50) // Aumentar para 50 mensagens
        .map(m => m.content) // Usar mensagens completas
        .join('\n\n---\n\n')

      const response = await fetch('/api/insights/summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          totalSessions: sessions.length,
          totalMessages: messages.length,
          period: periodText,
          sampleMessages
        })
      })

      if (response.ok) {
        const { summary } = await response.json()
        return summary
      }
    } catch (error) {
      console.error('Erro ao gerar resumo:', error)
    }

    // Fallback mais rápido sem IA
    return `Você teve ${sessions.length} conversas com ${messages.length} mensagens no ${period === '7d' ? 'últimos 7 dias' : period === '15d' ? 'últimos 15 dias' : period === '30d' ? 'último mês' : 'todo o período'}.`
  }

  const getPeriodLabel = () => {
    switch (period) {
      case '7d': return 'últimos 7 dias'
      case '15d': return 'últimos 15 dias'
      case '30d': return 'último mês'
      case 'all': return 'todo o período'
    }
  }

  const sentimentColors: { [key: string]: string } = {
    feliz: '#10b981',      // green - positivo
    calmo: '#06b6d4',      // cyan - neutro positivo
    esperançoso: '#8b5cf6', // purple - positivo
    grato: '#f59e0b',      // amber - positivo
    triste: '#3b82f6',     // blue - negativo
    ansioso: '#ef4444',    // red - negativo
    frustrado: '#f97316',  // orange - negativo
    irritado: '#dc2626',   // red dark - negativo
    preocupado: '#6366f1'  // indigo - negativo
  }

  const sentimentLabels: { [key: string]: string } = {
    feliz: 'feliz',
    calmo: 'calmo',
    esperançoso: 'esperançoso',
    grato: 'grato',
    triste: 'triste',
    ansioso: 'ansioso',
    frustrado: 'frustrado',
    irritado: 'irritado',
    preocupado: 'preocupado'
  }

  // Calcular gráfico radar/teia
  const calculateRadar = (distribution: InsightsData['sentimentDistribution'] | null | undefined) => {
    if (!distribution) return null

    const center = 150
    const maxRadius = 120
    // Ordem: positivo -> neutro -> negativo (sentido horário)
    const axes = ['feliz', 'esperançoso', 'grato', 'calmo', 'preocupado', 'ansioso', 'frustrado', 'irritado', 'triste']
    const numAxes = axes.length
    const angleStep = (2 * Math.PI) / numAxes

    // Calcular pontos do polígono
    const points = axes.map((axis, index) => {
      const value = distribution[axis] || 0
      const radius = (value / 100) * maxRadius
      const angle = (index * angleStep) - (Math.PI / 2) // Começar do topo
      const x = center + radius * Math.cos(angle)
      const y = center + radius * Math.sin(angle)
      return { x, y, value, axis }
    })

    // Criar path do polígono
    const pathData = points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' ') + ' Z'

    // Criar linhas de grade (círculos concêntricos)
    const gridLines = [25, 50, 75, 100].map(level => {
      const radius = (level / 100) * maxRadius
      return { radius, level }
    })

    // Criar eixos (linhas do centro até a borda)
    const axisLines = axes.map((axis, index) => {
      const angle = (index * angleStep) - (Math.PI / 2)
      const x = center + maxRadius * Math.cos(angle)
      const y = center + maxRadius * Math.sin(angle)
      return { x, y, angle, axis }
    })

    return { pathData, points, gridLines, axisLines, center, maxRadius }
  }

  const radarData = calculateRadar(data?.sentimentDistribution)

  // Componente de Loading Animado
  const LoadingInsights = () => {
    const phrases = [
      'analisando seus sentimentos...',
      'identificando padrões emocionais...',
      'processando suas conversas...',
      'gerando insights personalizados...',
      'entendendo sua jornada...',
      'descobrindo temas recorrentes...',
      'preparando seu resumo...',
      'conectando os pontos...',
      'revelando sua evolução...',
      'organizando suas emoções...',
    ]

    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)

    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length)
      }, 2500) // Muda a frase a cada 2.5 segundos

      return () => clearInterval(interval)
    }, [phrases.length])

    return (
      <div className="relative flex flex-col items-center justify-center min-h-[60vh] py-12 sm:py-16 overflow-hidden">
        {/* Container principal */}
        <div className="relative w-full max-w-2xl z-10">
          {/* Círculo animado de fundo */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 flex items-center justify-center -z-10"
          >
            <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-gradient-to-br from-pink-200/30 via-purple-200/30 to-pink-200/30 dark:from-pink-900/20 dark:via-purple-900/20 dark:to-pink-900/20 blur-3xl" />
          </motion.div>

          {/* Conteúdo central */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Ícone animado */}
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.1, 1],
              }}
              transition={{
                rotate: {
                  duration: 8,
                  repeat: Infinity,
                  ease: 'linear',
                },
                scale: {
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
              }}
              className="mb-8"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-pink-400 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-pink-200/50 dark:shadow-pink-900/30">
                <svg
                  className="w-10 h-10 sm:w-12 sm:h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
            </motion.div>

            {/* Frases animadas */}
            <div className="h-16 sm:h-20 flex items-center justify-center mb-6">
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentPhraseIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{
                    duration: 0.5,
                    ease: 'easeInOut',
                  }}
                  className="text-lg sm:text-xl md:text-2xl font-light text-gray-700 dark:text-gray-300 text-center px-4"
                >
                  {phrases[currentPhraseIndex]}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Barra de progresso animada */}
            <div className="w-full max-w-md mx-auto">
              <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="h-full w-1/3 bg-gradient-to-r from-transparent via-pink-500 to-transparent"
                />
              </div>
            </div>

            {/* Pontos de loading */}
            <div className="flex items-center gap-2 mt-8">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: 'easeInOut',
                  }}
                  className="w-2 h-2 rounded-full bg-pink-500"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Elementos decorativos flutuantes */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -30, 0],
                x: [0, (i % 2 === 0 ? 1 : -1) * 20, 0],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.5,
                ease: 'easeInOut',
              }}
              className="absolute"
              style={{
                left: `${15 + i * 18}%`,
                top: `${25 + i * 12}%`,
              }}
            >
              <div className="text-2xl sm:text-3xl opacity-30">
                {['💭', '✨', '🌟', '💫', '🔮'][i]}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 relative transition-colors">
      {/* Logo desabafo no topo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-6 sm:top-8 left-16 md:left-6 lg:left-8 z-50"
      >
        <button
          onClick={() => router.push('/home')}
          className="text-base sm:text-xl md:text-2xl font-light text-gray-900 dark:text-white tracking-tight hover:text-pink-500 transition-colors cursor-pointer"
          type="button"
        >
          desabafo.io
        </button>
      </motion.div>

      {/* Sidebar */}
      <Sidebar />

      {/* Conteúdo */}
      <div className="flex items-center justify-center min-h-screen px-4 sm:px-6 md:px-8 py-20 md:py-24">
        <div className="max-w-4xl w-full">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 sm:mb-12"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-gray-900 dark:text-white mb-3 sm:mb-4">insights</h1>
            
            {/* Filtros de período */}
            <div className="flex gap-1.5 sm:gap-2 flex-wrap">
              {[
                { value: '7d', label: '7 dias' },
                { value: '15d', label: '15 dias' },
                { value: '30d', label: 'mês' },
                { value: 'all', label: 'tudo' }
              ].map((p) => (
                <button
                  key={p.value}
                  onClick={() => handlePeriodChange(p.value as any)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-light transition-all cursor-pointer ${
                    period === p.value
                      ? 'bg-pink-400 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                  type="button"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </motion.div>

          {isLoading ? (
            <LoadingInsights />
          ) : data ? (
            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              {/* Gráfico radar/teia de sentimentos */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 sm:p-6 md:p-8"
              >
                <h2 className="text-lg sm:text-xl font-light text-gray-900 dark:text-white mb-4 sm:mb-6">
                  como você se sentiu
                </h2>
                <div className="flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-8 md:gap-12">
                  <div className="relative w-full max-w-sm">
                    {radarData && (
                      <svg 
                        width="100%" 
                        height="auto" 
                        viewBox="0 0 300 300" 
                        className="overflow-visible"
                        preserveAspectRatio="xMidYMid meet"
                      >
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.3" />
                          </linearGradient>
                        </defs>
                        
                        {/* Linhas de grade (círculos concêntricos) */}
                        {radarData.gridLines.map((grid, i) => (
                          <circle
                            key={i}
                            cx={radarData.center}
                            cy={radarData.center}
                            r={grid.radius}
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="1"
                            opacity={0.5}
                          />
                        ))}
                        
                        {/* Eixos (linhas do centro até a borda) */}
                        {radarData.axisLines.map((axis, i) => (
                          <line
                            key={i}
                            x1={radarData.center}
                            y1={radarData.center}
                            x2={axis.x}
                            y2={axis.y}
                            stroke="#e5e7eb"
                            strokeWidth="1"
                            opacity={0.5}
                          />
                        ))}
                        
                        {/* Área do polígono (sentimentos) */}
                        <path
                          d={radarData.pathData}
                          fill="url(#gradient)"
                          fillOpacity="0.4"
                          stroke="#ec4899"
                          strokeWidth="2.5"
                        />
                        
                        {/* Pontos nos vértices */}
                        {radarData.points.map((point, i) => {
                          const angle = (i * (2 * Math.PI) / radarData.points.length) - (Math.PI / 2)
                          const labelRadius = radarData.maxRadius + 35
                          const labelX = radarData.center + labelRadius * Math.cos(angle)
                          const labelY = radarData.center + labelRadius * Math.sin(angle)
                          
                          return (
                            <g key={i}>
                              <circle
                                cx={point.x}
                                cy={point.y}
                                r="5"
                                fill={sentimentColors[point.axis] || '#6b7280'}
                                stroke="white"
                                strokeWidth="2"
                              />
                              {/* Label do eixo */}
                              <text
                                x={labelX}
                                y={labelY}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="text-xs font-light fill-gray-700 dark:fill-gray-300"
                                style={{ fontSize: '11px' }}
                              >
                                {sentimentLabels[point.axis] || point.axis}
                              </text>
                              {/* Valor */}
                              <text
                                x={labelX}
                                y={labelY + 14}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="text-xs font-light fill-gray-500 dark:fill-gray-400"
                                style={{ fontSize: '10px' }}
                              >
                                {point.value}%
                              </text>
                            </g>
                          )
                        })}
                      </svg>
                    )}
                  </div>
                  <div className="w-full md:w-auto space-y-2 sm:space-y-3 md:min-w-[150px]">
                    {radarData?.points.map((point) => (
                      <div key={point.axis} className="flex items-center gap-2 sm:gap-3">
                        <div
                          className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: sentimentColors[point.axis] || '#6b7280' }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-sm font-light text-gray-900 dark:text-gray-100">
                            {sentimentLabels[point.axis] || point.axis}
                          </div>
                          <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                            {point.value}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Estatísticas */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4"
              >
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 sm:p-6">
                  <div className="text-2xl sm:text-3xl font-light text-gray-900 dark:text-white mb-1">
                    {data.totalMessages}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-light">
                    mensagens enviadas
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 sm:p-6">
                  <div className="text-2xl sm:text-3xl font-light text-gray-900 dark:text-white mb-1">
                    {data.totalSessions}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-light">
                    conversas iniciadas
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 sm:p-6">
                  <div className="text-2xl sm:text-3xl font-light text-gray-900 dark:text-white mb-1">
                    {data.avgMessagesPerSession}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-light">
                    média por conversa
                  </div>
                </div>
              </motion.div>

              {/* Resumo - Apenas para PRO */}
              {plan === 'pro' ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8"
                >
                  <h2 className="text-xl font-light text-gray-900 dark:text-white mb-4">
                    resumo do {getPeriodLabel()}
                  </h2>
                  <MarkdownRenderer 
                    content={data.summary}
                    className="text-base text-gray-700 dark:text-gray-300 font-light leading-relaxed"
                  />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 border border-pink-200 dark:border-pink-800 rounded-2xl p-8 relative overflow-hidden"
                >
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <h2 className="text-xl font-light text-gray-900 dark:text-white">
                        resumo personalizado
                      </h2>
                      <span className="text-xs px-3 py-1 bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300 rounded-full font-light">
                        pro
                      </span>
                    </div>
                    <p className="text-base text-gray-600 dark:text-gray-400 font-light leading-relaxed mb-6">
                      receba análises detalhadas e personalizadas sobre seus padrões emocionais, temas recorrentes e evolução ao longo do tempo.
                    </p>
                    <button
                      onClick={() => setShowSummaryUpgradeModal(true)}
                      className="px-6 py-3 bg-pink-600 text-white rounded-full font-light hover:bg-pink-700 transition-all cursor-pointer text-sm"
                      type="button"
                    >
                      upgrade para pro
                    </button>
                  </div>
                  <div className="absolute top-0 right-0 text-6xl opacity-10">✨</div>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">📊</div>
              <p className="text-gray-500 dark:text-gray-400 font-light">
                não há dados suficientes para gerar insights
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Upgrade para Resumo */}
      {showSummaryUpgradeModal && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowSummaryUpgradeModal(false)
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
              <div className="text-4xl mb-4">✨</div>
              <h2 className="text-2xl font-light text-gray-900 dark:text-white mb-2">
                resumos personalizados
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-light">
                disponível apenas no plano pro
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-300 font-light">
                com o plano pro você recebe:
              </p>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300 font-light">
                <li className="flex items-start gap-2">
                  <span className="text-pink-600 mt-0.5">•</span>
                  <span>análises detalhadas dos seus padrões emocionais</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-600 mt-0.5">•</span>
                  <span>identificação de temas recorrentes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-600 mt-0.5">•</span>
                  <span>insights sobre sua evolução ao longo do tempo</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-600 mt-0.5">•</span>
                  <span>resumos gerados por IA personalizados</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSummaryUpgradeModal(false)}
                className="flex-1 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-light hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer pointer-events-auto"
                type="button"
              >
                talvez depois
              </button>
              <button
                onClick={() => {
                  setShowSummaryUpgradeModal(false)
                  router.push('/pricing')
                }}
                className="flex-1 py-3 bg-pink-600 text-white rounded-lg font-light hover:bg-pink-700 transition-all cursor-pointer pointer-events-auto"
                type="button"
              >
                ver planos
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de Upgrade para Plano Pro */}
      {showUpgradeModal && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowUpgradeModal(false)
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
              <div className="text-4xl mb-4">✨</div>
              <h2 className="text-2xl font-light text-gray-900 dark:text-white mb-2">
                upgrade para pro
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-light">
                você já mudou o período uma vez hoje
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-300 font-light">
                com o plano pro você pode:
              </p>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300 font-light">
                <li className="flex items-start gap-2">
                  <span className="text-pink-600 mt-0.5">•</span>
                  <span>mudar o período de insights quantas vezes quiser</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-600 mt-0.5">•</span>
                  <span>acesso ilimitado a todos os recursos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-600 mt-0.5">•</span>
                  <span>suporte prioritário</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-light hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer pointer-events-auto"
                type="button"
              >
                talvez depois
              </button>
              <button
                onClick={() => {
                  setShowUpgradeModal(false)
                  router.push('/pricing')
                }}
                className="flex-1 py-3 bg-pink-600 text-white rounded-lg font-light hover:bg-pink-700 transition-all cursor-pointer pointer-events-auto"
                type="button"
              >
                ver planos
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

