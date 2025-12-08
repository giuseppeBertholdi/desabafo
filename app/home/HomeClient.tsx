'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import Sidebar from '@/components/Sidebar'
import ProBanner from '@/components/ProBanner'
import { useUserPlan } from '@/lib/getUserPlanClient'

interface HomeClientProps {
  firstName: string
  userEmail: string
}

export default function HomeClient({ firstName, userEmail }: HomeClientProps) {
  const [bestFriendMode, setBestFriendMode] = useState(false)
  const [showVoiceUpgrade, setShowVoiceUpgrade] = useState(false)
  const [showEmojiAnimation, setShowEmojiAnimation] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { plan } = useUserPlan()
  const { scrollY } = useScroll()
  const backgroundY = useTransform(scrollY, [0, 500], [0, 150])

  // Saudações variadas e curtas
  const greetings = [
    `e aí, ${firstName}?`,
    `oi, ${firstName}!`,
    `olá, ${firstName}`,
    `hey, ${firstName}`,
    `opa, ${firstName}!`,
    `fala, ${firstName}`,
    `eae, ${firstName}?`,
    `tudo bem, ${firstName}?`,
  ]

  const simpleGreetings = [
    `oi, ${firstName}`,
    `olá, ${firstName}`,
    `hey, ${firstName}`,
  ]

  // Selecionar saudação baseada no nome (determinística para evitar erro de hidratação)
  const getGreeting = (mode: boolean) => {
    const greetingsList = mode ? simpleGreetings : greetings
    // Usar o nome para gerar um índice determinístico
    const hash = firstName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const index = hash % greetingsList.length
    return greetingsList[index]
  }

  const [greeting, setGreeting] = useState(`e aí, ${firstName}?`)
  const [mounted, setMounted] = useState(false)

  // Sincronizar modo com localStorage e inicializar
  useEffect(() => {
    const savedMode = localStorage.getItem('bestFriendMode')
    if (savedMode !== null) {
      setBestFriendMode(savedMode === 'true')
    }
    setMounted(true)
  }, [])

  // Atualizar saudação quando o modo melhor amigo mudar ou após montagem
  useEffect(() => {
    if (mounted) {
      setGreeting(getGreeting(bestFriendMode))
      localStorage.setItem('bestFriendMode', bestFriendMode.toString())
    }
  }, [bestFriendMode, mounted, firstName])

  // Mostrar animação de emoji quando ativar o modo melhor amigo
  const handleToggleBestFriend = () => {
    const newMode = !bestFriendMode
    setBestFriendMode(newMode)
    
    // Salvar imediatamente no localStorage
    localStorage.setItem('bestFriendMode', newMode.toString())
    
    // Se estiver ativando (não desativando), mostrar animação e marcar para mostrar no chat também
    if (newMode) {
      localStorage.setItem('bestFriendModeJustActivated', 'true')
      setShowEmojiAnimation(true)
      setTimeout(() => {
        setShowEmojiAnimation(false)
      }, 2000)
    }
  }

  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim()) {
      alert('Por favor, escreva seu feedback antes de enviar.')
      return
    }

    setIsSubmittingFeedback(true)
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedback: feedbackText.trim()
        })
      })

      if (response.ok) {
        setFeedbackText('')
        setShowFeedback(false)
        alert('Obrigado pelo seu feedback! 💜')
      } else {
        const data = await response.json()
        alert(data.error || 'Erro ao enviar feedback. Tente novamente.')
      }
    } catch (error) {
      console.error('Erro ao enviar feedback:', error)
      alert('Erro ao enviar feedback. Tente novamente.')
    } finally {
      setIsSubmittingFeedback(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 relative overflow-hidden transition-colors">
      {/* Background decorativo animado */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          style={{ y: backgroundY }}
          className="absolute top-0 -right-1/4 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"
        />
        <motion.div 
          style={{ y: backgroundY }}
          className="absolute -bottom-48 -left-48 w-96 h-96 bg-gradient-to-tr from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-pink-300/10 to-purple-300/10 rounded-full blur-3xl" />
      </div>

      {/* Banner Experimentar Pro */}
      <ProBanner />
      
      {/* Logo desabafo no topo com gradiente */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`fixed ${plan === 'free' ? 'top-16 sm:top-20' : 'top-6 sm:top-8'} left-16 md:left-6 lg:left-8 z-50`}
      >
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
          desabafo.io
        </h1>
      </motion.div>

      {/* Sidebar esquerda com ícones */}
      <Sidebar />

      {/* Switch Modo Melhor Amigo no canto superior direito - Redesenhado */}
      <div className={`fixed ${plan === 'free' ? 'top-14 sm:top-18' : 'top-5 sm:top-6'} right-4 sm:right-6 z-50`}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl border border-purple-200/50 dark:border-purple-700/50 shadow-lg shadow-purple-500/10"
        >
          <span className="text-[10px] sm:text-xs text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap">melhor amigo</span>
          <button
            onClick={handleToggleBestFriend}
            className={`relative w-11 sm:w-12 h-6 rounded-full transition-all duration-300 cursor-pointer pointer-events-auto ${
              bestFriendMode 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-pink-500/50' 
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
            type="button"
          >
            <motion.div
              animate={{ x: bestFriendMode ? 24 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
            />
          </button>
        </motion.div>
      </div>

      {/* Conteúdo central */}
      <div className="flex items-center justify-center min-h-screen px-6 sm:px-8 py-20 relative z-10">
        <div className="max-w-4xl w-full">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-16 text-center"
          >
            {/* Greeting com gradiente e animação */}
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h1 
                className="text-6xl sm:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent tracking-tight mb-4 leading-tight"
                suppressHydrationWarning
              >
                {greeting}
              </h1>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-3 font-medium"
            >
              como você quer conversar hoje?
            </motion.p>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2"
            >
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              disponível 24/7 • privado e seguro
            </motion.p>
          </motion.div>

          {/* Cards principais com glassmorphism */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Text Mode - DESTAQUE com gradiente */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/chat')}
              className="relative group overflow-hidden rounded-3xl p-1 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-500"
            >
              <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-[22px] p-10 h-full">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[22px]" />
                
                <div className="relative text-center">
                  <motion.div 
                    className="text-5xl mb-6"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    ✨
                  </motion.div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    modo texto
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    converse por escrito de forma natural e acolhedora
                  </p>
                  <motion.div
                    className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-purple-600 dark:text-purple-400"
                    whileHover={{ x: 5 }}
                  >
                    começar agora
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.div>
                </div>
              </div>
            </motion.button>

            {/* Voice Mode com badge PRO */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (plan === 'pro') {
                  router.push('/chat?mode=voice')
                } else {
                  setShowVoiceUpgrade(true)
                }
              }}
              className={`relative group overflow-hidden rounded-3xl p-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-2 border-gray-200/50 dark:border-gray-700/50 hover:border-purple-400/50 dark:hover:border-purple-600/50 shadow-lg hover:shadow-2xl hover:shadow-purple-500/20 transition-all ${
                plan !== 'pro' ? 'opacity-90' : ''
              }`}
            >
              {plan !== 'pro' && (
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-xs font-bold shadow-lg">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    PRO
                  </span>
                </div>
              )}
              
              <div className="text-center">
                <motion.div 
                  className="text-5xl mb-6"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🎤
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  modo voz
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {plan === 'pro' 
                    ? 'converse naturalmente com Luna usando sua voz' 
                    : 'experiência imersiva de conversação por voz'}
                </p>
                {plan !== 'pro' && (
                  <motion.div
                    className="inline-flex items-center gap-2 text-sm font-semibold text-purple-600 dark:text-purple-400"
                    whileHover={{ x: 5 }}
                  >
                    desbloquear
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.div>
                )}
              </div>
            </motion.button>
          </div>

          {/* Diário - Card horizontal com glassmorphism */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mb-12"
          >
            <motion.button
              whileHover={{ scale: 1.01, y: -2 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => router.push('/journal')}
              className="w-full group relative overflow-hidden rounded-3xl p-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-2 border-gray-200/50 dark:border-gray-700/50 hover:border-purple-400/50 dark:hover:border-purple-600/50 shadow-lg hover:shadow-2xl hover:shadow-purple-500/20 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="text-5xl">📔</div>
                  <div className="text-left">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      diário pessoal
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      registre seus pensamentos com assistência inteligente da IA
                    </p>
                  </div>
                </div>
                <motion.div
                  className="text-purple-600 dark:text-purple-400"
                  whileHover={{ x: 5 }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.div>
              </div>
            </motion.button>
          </motion.div>

          {/* Explorar por tema - Grid moderno */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mb-16"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                explore por tema
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                escolha um tema para iniciar uma conversa direcionada
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { emoji: '😰', label: 'ansiedade', color: 'from-orange-400 to-red-400' },
                { emoji: '💔', label: 'relacionamento', color: 'from-pink-400 to-rose-400' },
                { emoji: '💼', label: 'trabalho', color: 'from-blue-400 to-cyan-400' },
                { emoji: '😔', label: 'tristeza', color: 'from-indigo-400 to-purple-400' },
                { emoji: '🤔', label: 'dúvidas', color: 'from-yellow-400 to-orange-400' },
                { emoji: '😊', label: 'conquistas', color: 'from-green-400 to-emerald-400' },
                { emoji: '😴', label: 'sono', color: 'from-blue-400 to-indigo-400' },
                { emoji: '🎓', label: 'estudos', color: 'from-purple-400 to-pink-400' },
                { emoji: '👨‍👩‍👧‍👦', label: 'família', color: 'from-amber-400 to-orange-400' },
                { emoji: '💪', label: 'motivação', color: 'from-red-400 to-pink-400' },
                { emoji: '😤', label: 'raiva', color: 'from-red-500 to-orange-500' },
                { emoji: '😌', label: 'calma', color: 'from-teal-400 to-cyan-400' },
              ].map((tema, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: 1 + i * 0.05,
                    type: 'spring',
                    stiffness: 400,
                    damping: 25
                  }}
                  whileHover={{ 
                    scale: 1.1, 
                    y: -4,
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push(`/chat?tema=${tema.label}`)}
                  className="group relative overflow-hidden rounded-2xl px-5 py-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-2 border-gray-200/50 dark:border-gray-700/50 hover:border-transparent shadow-md hover:shadow-xl transition-all cursor-pointer"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${tema.color} opacity-0 group-hover:opacity-20 transition-opacity`} />
                  <div className="relative flex items-center gap-2">
                    <span className="text-xl">{tema.emoji}</span>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{tema.label}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Features/Benefits Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            {[
              { icon: '🔒', title: 'totalmente privado', desc: 'suas conversas são criptografadas e seguras' },
              { icon: '🧠', title: 'IA empática', desc: 'respostas personalizadas e acolhedoras' },
              { icon: '📊', title: 'insights profundos', desc: 'entenda melhor seus padrões emocionais' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 + i * 0.1 }}
                whileHover={{ y: -4 }}
                className="text-center p-6 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50"
              >
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Modal de Upgrade para Modo Voz - Redesenhado */}
      <AnimatePresence>
        {showVoiceUpgrade && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowVoiceUpgrade(false)
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-purple-200/50 dark:border-purple-700/50 overflow-hidden"
            >
              {/* Background gradient */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl -z-10" />
              
              <div className="text-center mb-8">
                <motion.div 
                  className="text-6xl mb-4"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🎤
                </motion.div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                  desbloqueie o modo voz
                </h2>
                <p className="text-base text-gray-600 dark:text-gray-400">
                  converse naturalmente com Luna usando sua voz
                </p>
              </div>

              <div className="space-y-4 mb-8">
                {[
                  { icon: '🎙️', text: 'conversas por voz ilimitadas com Luna' },
                  { icon: '💬', text: 'chat ilimitado em modo texto' },
                  { icon: '💡', text: 'insights e análises profundas' },
                  { icon: '⚡', text: 'respostas mais rápidas e prioritárias' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200/50 dark:border-purple-700/50"
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.text}</span>
                  </motion.div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowVoiceUpgrade(false)}
                  className="flex-1 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-2xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer pointer-events-auto"
                  type="button"
                >
                  talvez depois
                </button>
                <button
                  onClick={() => {
                    setShowVoiceUpgrade(false)
                    router.push('/pricing')
                  }}
                  className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/50 transition-all cursor-pointer pointer-events-auto"
                  type="button"
                >
                  ver planos
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botões de Feedback e Ajuda - Redesenhados */}
      <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 flex items-center gap-3">
        {/* Botão de Ajuda */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.8 }}
          whileHover={{ scale: 1.08, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowHelp(true)}
          className="flex items-center gap-2.5 px-5 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-2 border-purple-200/50 dark:border-purple-700/50 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-purple-500/20 transition-all cursor-pointer pointer-events-auto group"
          type="button"
        >
          <svg 
            className="w-5 h-5 text-purple-600 dark:text-purple-400 group-hover:rotate-12 transition-transform" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm text-gray-800 dark:text-gray-200 font-semibold">ajuda</span>
        </motion.button>

        {/* Botão de Feedback */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.85 }}
          whileHover={{ scale: 1.08, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowFeedback(true)}
          className="flex items-center gap-2.5 px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/60 transition-all cursor-pointer pointer-events-auto group"
          type="button"
        >
          <motion.svg 
            className="w-5 h-5 text-white" 
            fill="currentColor" 
            viewBox="0 0 24 24"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </motion.svg>
          <span className="text-sm text-white font-semibold">feedback</span>
        </motion.button>
      </div>

      {/* Modal de Ajuda */}
      <AnimatePresence>
        {showHelp && (
          <div 
            className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowHelp(false)
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transition-colors"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-light text-gray-900 dark:text-white">
                  como usar o desabafo.io
                </h2>
                <button
                  onClick={() => setShowHelp(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-8">
                {/* Modo Texto */}
                <div className="border-b border-gray-100 dark:border-gray-700 pb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">✨</span>
                    <h3 className="text-xl font-light text-gray-900 dark:text-white">modo texto</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-light leading-relaxed">
                    converse por escrito com a IA. escreva livremente sobre o que está sentindo, sem julgamentos. 
                    a IA lembra do contexto da conversa e oferece suporte emocional personalizado.
                  </p>
                </div>

                {/* Modo Voz */}
                <div className="border-b border-gray-100 dark:border-gray-700 pb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">🎤</span>
                    <h3 className="text-xl font-light text-gray-900 dark:text-white">modo voz</h3>
                    <span className="px-2 py-0.5 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-full text-xs font-light">
                      plano pago
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-light leading-relaxed mb-3">
                    converse naturalmente usando sua voz. fale livremente e a IA responde por voz também, 
                    criando uma experiência mais próxima de uma conversa real.
                  </p>
                  <div className="bg-pink-50 dark:bg-pink-900/10 border border-pink-200 dark:border-pink-800 rounded-xl p-4 mb-3">
                    <p className="text-xs text-pink-700 dark:text-pink-300 font-light">
                      <strong>disponível nos planos pagos:</strong> o modo voz está disponível apenas para assinantes dos planos essencial e premium. 
                      <button 
                        onClick={() => {
                          setShowHelp(false)
                          router.push('/pricing')
                        }}
                        className="underline ml-1 hover:text-pink-800 dark:hover:text-pink-200"
                      >
                        ver planos
                      </button>
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-light mb-2">
                      <strong className="text-gray-700 dark:text-gray-300">gravação automática:</strong> a gravação para automaticamente quando você para de falar (após 1.5s de silêncio).
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-light mb-2">
                      <strong className="text-gray-700 dark:text-gray-300">interromper:</strong> você pode interromper a IA a qualquer momento clicando no botão do microfone.
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-light">
                      <strong className="text-gray-700 dark:text-gray-300">gravação contínua:</strong> após a IA terminar de falar, a gravação reinicia automaticamente para uma conversa fluida.
                    </p>
                  </div>
                </div>

                {/* Modo Melhor Amigo */}
                <div className="border-b border-gray-100 dark:border-gray-700 pb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">💜</span>
                    <h3 className="text-xl font-light text-gray-900 dark:text-white">modo melhor amigo</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-light leading-relaxed">
                    quando ativado, a IA se torna mais <strong className="text-gray-700 dark:text-gray-300">empática</strong>, 
                    <strong className="text-gray-700 dark:text-gray-300"> verdadeira</strong> e 
                    <strong className="text-gray-700 dark:text-gray-300"> acolhedora</strong>. ela simplifica as respostas, 
                    lembra do contexto e age como um melhor amigo que te ouve sem julgamentos, mas também é 
                    <strong className="text-gray-700 dark:text-gray-300"> sincero</strong> quando necessário.
                  </p>
                </div>

                {/* Diário */}
                <div className="border-b border-gray-100 dark:border-gray-700 pb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">📔</span>
                    <h3 className="text-xl font-light text-gray-900 dark:text-white">diário</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-light leading-relaxed mb-3">
                    escreva livremente seus pensamentos, sentimentos e experiências. a IA oferece sugestões inteligentes 
                    enquanto você escreve, sem ser intrusiva.
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 space-y-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-light">
                      <strong className="text-gray-700 dark:text-gray-300">prompts:</strong> comece com perguntas reflexivas sugeridas pela IA.
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-light">
                      <strong className="text-gray-700 dark:text-gray-300">templates:</strong> use modelos prontos para diferentes tipos de reflexão.
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-light">
                      <strong className="text-gray-700 dark:text-gray-300">tags:</strong> digite # para ver suas tags existentes e organizar suas entradas.
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-light">
                      <strong className="text-gray-700 dark:text-gray-300">insights:</strong> receba análises sobre seus padrões emocionais e de escrita.
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-light">
                      <strong className="text-gray-700 dark:text-gray-300">calendário:</strong> visualize quando você escreveu e encontre entradas por data.
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-light">
                      <strong className="text-gray-700 dark:text-gray-300">gráfico de humor:</strong> veja como seus humores variam ao longo do tempo.
                    </p>
                  </div>
                </div>

                {/* Temas */}
                <div className="border-b border-gray-100 dark:border-gray-700 pb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">🎯</span>
                    <h3 className="text-xl font-light text-gray-900 dark:text-white">explorar por tema</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-light leading-relaxed">
                    escolha um tema para iniciar uma conversa focada. a IA entende o contexto do tema escolhido 
                    e adapta suas respostas para ser mais relevante ao que você está passando.
                  </p>
                </div>

                {/* Histórico */}
                <div className="border-b border-gray-100 dark:border-gray-700 pb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">📚</span>
                    <h3 className="text-xl font-light text-gray-900 dark:text-white">histórico</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-light leading-relaxed mb-3">
                    todas as suas conversas são salvas automaticamente. você pode revisitar qualquer conversa, 
                    ver resumos gerados pela IA e filtrar por temas identificados automaticamente.
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-light">
                      <strong className="text-gray-700 dark:text-gray-300">resumos automáticos:</strong> conversas com mais de 5 mensagens recebem resumos automáticos.
                    </p>
                  </div>
                </div>

                {/* Insights */}
                <div className="border-b border-gray-100 dark:border-gray-700 pb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">💡</span>
                    <h3 className="text-xl font-light text-gray-900 dark:text-white">insights</h3>
                    <span className="px-2 py-0.5 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-full text-xs font-light">
                      plano pago
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-light leading-relaxed mb-3">
                    receba análises profundas sobre seus padrões emocionais, temas recorrentes nas suas conversas 
                    e insights personalizados baseados no seu histórico de interações.
                  </p>
                  <div className="bg-pink-50 dark:bg-pink-900/10 border border-pink-200 dark:border-pink-800 rounded-xl p-4">
                    <p className="text-xs text-pink-700 dark:text-pink-300 font-light">
                      <strong>disponível nos planos pagos:</strong> insights detalhados e análises avançadas estão disponíveis apenas para assinantes dos planos essencial e premium. 
                      <button 
                        onClick={() => {
                          setShowHelp(false)
                          router.push('/pricing')
                        }}
                        className="underline ml-1 hover:text-pink-800 dark:hover:text-pink-200"
                      >
                        ver planos
                      </button>
                    </p>
                  </div>
                </div>

                {/* Modo de Emergência */}
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">🚨</span>
                    <h3 className="text-xl font-light text-red-900 dark:text-red-100">modo de emergência</h3>
                  </div>
                  <p className="text-sm text-red-800 dark:text-red-200 font-light leading-relaxed mb-4">
                    se você expressar pensamentos de auto-lesão ou suicídio, o desabafo.io detecta automaticamente 
                    e oferece ajuda imediata com botões para ligar para o CVV (188) ou SAMU (192).
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-300 font-light">
                    sua vida importa. não hesite em buscar ajuda profissional.
                  </p>
                </div>

                {/* Privacidade */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">🔒</span>
                    <h3 className="text-xl font-light text-gray-900 dark:text-white">privacidade e segurança</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-light leading-relaxed">
                    todas as suas conversas são privadas e criptografadas. seus dados nunca são compartilhados 
                    com terceiros. você pode deletar qualquer conversa ou entrada do diário a qualquer momento.
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => setShowHelp(false)}
                  className="w-full py-3 bg-pink-500 text-white rounded-xl font-light hover:bg-pink-600 transition-colors cursor-pointer"
                >
                  entendi, obrigado
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Animação de emoji quando ativa modo melhor amigo */}
      <AnimatePresence>
        {showEmojiAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 0, y: 0 }}
            animate={{ 
              opacity: [0, 1, 1, 0],
              scale: [0, 1.2, 1, 0.8],
              y: [0, -100, -150, -200],
              rotate: [0, 10, -10, 0]
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ 
              duration: 2,
              ease: "easeOut"
            }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] pointer-events-none"
          >
            <div className="text-8xl">💜</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Feedback - Redesenhado */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowFeedback(false)
                setFeedbackText('')
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-purple-200/50 dark:border-purple-700/50 overflow-hidden"
            >
              {/* Background gradient */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl -z-10" />
              
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    ajude-nos a melhorar
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    sua opinião é muito importante para nós 💜
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowFeedback(false)
                    setFeedbackText('')
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors hover:rotate-90 transition-transform"
                >
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-8">
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="compartilhe suas ideias, sugestões ou o que você gostaria de ver no desabafo.io..."
                  className="w-full h-52 px-5 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm font-normal placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all resize-none"
                  disabled={isSubmittingFeedback}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 ml-1">
                  todas as sugestões são lidas e consideradas pela nossa equipe
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowFeedback(false)
                    setFeedbackText('')
                  }}
                  disabled={isSubmittingFeedback}
                  className="flex-1 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-2xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                >
                  cancelar
                </button>
                <button
                  onClick={handleSubmitFeedback}
                  disabled={isSubmittingFeedback || !feedbackText.trim()}
                  className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                  type="button"
                >
                  {isSubmittingFeedback ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      enviando...
                    </span>
                  ) : (
                    'enviar feedback'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

