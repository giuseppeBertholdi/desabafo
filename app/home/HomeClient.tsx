'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { motion, AnimatePresence } from 'framer-motion'
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
  const [spotifyTrack, setSpotifyTrack] = useState<any>(null)
  const [showSpotifyWidget, setShowSpotifyWidget] = useState(false)
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { plan } = useUserPlan()

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
    checkSpotifyConnection()
    loadSpotifyTrack()

    // Atualizar status quando a página voltar ao foco (ex: após conectar no /account)
    const handleFocus = () => {
      checkSpotifyConnection()
      loadSpotifyTrack()
    }
    window.addEventListener('focus', handleFocus)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  // Verificar se Spotify está conectado
  const checkSpotifyConnection = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setIsSpotifyConnected(false)
        return
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('spotify_access_token')
        .eq('user_id', session.user.id)
        .maybeSingle()

      const connected = !!profile?.spotify_access_token
      setIsSpotifyConnected(connected)
    } catch (error) {
      console.error('Erro ao verificar conexão Spotify:', error)
      setIsSpotifyConnected(false)
    }
  }

  // Buscar música atual do Spotify
  const loadSpotifyTrack = async () => {
    try {
      // Verificar conexão primeiro
      await checkSpotifyConnection()
      
      const response = await fetch('/api/spotify/current')
      if (response.ok) {
        const data = await response.json()
        if (data.isPlaying && data.track) {
          setSpotifyTrack(data.track)
          setShowSpotifyWidget(true)
        }
      }
    } catch (error) {
      // Silenciosamente falhar
    }
  }

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
    <div className="min-h-screen bg-white dark:bg-gray-900 relative transition-colors">
      {/* Banner Experimentar Pro */}
      {/* Sidebar esquerda com ícones */}
      <Sidebar />

      {/* Logo desabafo ao lado do botão da sidebar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-6 left-16 sm:left-16 md:left-20 lg:left-24 z-[70] flex items-center"
      >
        <button
          onClick={() => router.push('/home')}
          className="text-lg sm:text-xl md:text-2xl font-light text-gray-900 dark:text-white tracking-tight hover:text-pink-500 transition-colors cursor-pointer"
        >
          desabafo.io
        </button>
      </motion.div>

      {/* Botões fixos no topo direito - Alinhados verticalmente */}
      <div className="fixed top-4 sm:top-6 right-4 sm:right-6 z-[70] flex flex-col items-end gap-2">
        {/* Botão Upgrade to Pro (apenas para grátis) */}
        {plan === 'free' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <ProBanner />
          </motion.div>
        )}

        {/* Switch Modo Melhor Amigo */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <span className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 font-light whitespace-nowrap">melhor amigo</span>
          <button
            onClick={handleToggleBestFriend}
            className={`relative w-9 sm:w-10 h-5 rounded-full transition-colors cursor-pointer pointer-events-auto ${
              bestFriendMode ? 'bg-pink-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
            type="button"
          >
            <div
              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
                bestFriendMode ? 'translate-x-4 sm:translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </motion.div>

        {/* Botão Spotify */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {plan === 'free' ? (
            <button
              onClick={() => router.push('/pricing')}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-full border border-green-600 shadow-sm transition-all"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              <span className="text-[10px] sm:text-xs font-light whitespace-nowrap">ver planos</span>
            </button>
          ) : isSpotifyConnected ? (
            <button
              onClick={async () => {
                const { data: { session } } = await supabase.auth.getSession()
                if (!session) return

                try {
                  await supabase
                    .from('user_profiles')
                    .update({
                      spotify_access_token: null,
                      spotify_refresh_token: null,
                      spotify_token_expires_at: null,
                      spotify_state: null,
                      updated_at: new Date().toISOString()
                    })
                    .eq('user_id', session.user.id)

                  setIsSpotifyConnected(false)
                  setSpotifyTrack(null)
                  setShowSpotifyWidget(false)
                } catch (error) {
                  console.error('Erro ao desconectar Spotify:', error)
                  alert('Erro ao desconectar Spotify')
                }
              }}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full border border-red-600 shadow-sm transition-all"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              <span className="text-[10px] sm:text-xs font-light whitespace-nowrap">desconectar</span>
            </button>
          ) : (
            <button
              onClick={() => router.push('/account')}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-full border border-green-600 shadow-sm transition-all"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              <span className="text-[10px] sm:text-xs font-light whitespace-nowrap">conectar</span>
            </button>
          )}
        </motion.div>
      </div>

      {/* Conteúdo central */}
      <div className="flex items-center justify-center min-h-screen px-6 sm:px-8 py-20 relative z-0">
        <div className="max-w-2xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            {/* Saudação */}
            <h1 
              className="text-5xl sm:text-6xl lg:text-7xl text-gray-900 dark:text-white font-light tracking-tight mb-3"
              suppressHydrationWarning
            >
              {greeting}
            </h1>
            <p className="text-base sm:text-lg font-light text-gray-500 dark:text-gray-400">
              como você quer conversar hoje?
            </p>
          </motion.div>

          {/* Cards principais de modo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Text Mode - Disponível e DESTAQUE */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => router.push('/chat')}
              className="border border-gray-200 dark:border-gray-700 rounded-2xl p-12 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg transition-all group"
            >
              <div className="text-center">
                <div className="text-3xl mb-5">✨</div>
                <h2 className="text-xl font-light text-gray-900 dark:text-white mb-2">
                  modo texto
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-light">
                  converse por escrito
                </p>
              </div>
            </motion.button>

            {/* Voice Mode - Disponível apenas no Pro */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => {
                if (plan === 'pro') {
                  router.push('/chat?mode=voice')
                } else {
                  setShowVoiceUpgrade(true)
                }
              }}
              className={`border border-gray-200 dark:border-gray-700 rounded-2xl p-12 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg transition-all group ${
                plan !== 'pro' ? 'opacity-75' : ''
              }`}
            >
              <div className="text-center">
                <div className="text-3xl mb-5">🎤</div>
                <h2 className="text-xl font-light text-gray-900 dark:text-white mb-2">
                  modo voz
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-light">
                  {plan === 'pro' ? 'converse com a nossa IA Luna' : 'disponível apenas no plano pro'}
                </p>
                {plan !== 'pro' && (
                  <span className="inline-block mt-2 px-2 py-0.5 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-full text-xs font-light">
                    pro
                  </span>
                )}
              </div>
            </motion.button>
          </div>

          {/* Diário */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mb-8"
          >
            <motion.button
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => router.push('/journal')}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-2xl p-8 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg transition-all group"
            >
              <div className="flex items-center justify-center gap-4">
                <div className="text-3xl">📔</div>
                <div className="text-left">
                  <h2 className="text-lg font-light text-gray-900 dark:text-white mb-1">
                    diário
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-light">
                    escreva livremente com ajuda da IA
                  </p>
                </div>
              </div>
            </motion.button>
          </motion.div>

          {/* Widget do Spotify - Música Atual */}
          {showSpotifyWidget && spotifyTrack && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-20"
            >
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-500/30 dark:border-green-600/30 shadow-xl">
                {/* Fundo com blur da capa do álbum */}
                {spotifyTrack.image && (
                  <div 
                    className="absolute inset-0 opacity-20 blur-2xl"
                    style={{
                      backgroundImage: `url(${spotifyTrack.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  />
                )}
                
                <div className="relative z-10 p-6 flex items-center gap-6">
                  {/* Capa do Álbum */}
                  {spotifyTrack.image && (
                    <motion.div 
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="flex-shrink-0"
                    >
                      <img 
                        src={spotifyTrack.image} 
                        alt={spotifyTrack.album}
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl shadow-2xl object-cover border-2 border-white/50"
                      />
                    </motion.div>
                  )}

                  {/* Informações da Música */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-3 bg-green-500 rounded-full animate-pulse" />
                        <div className="w-1 h-4 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                        <div className="w-1 h-3 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                      </div>
                      <span className="text-xs font-medium text-green-700 dark:text-green-400 uppercase tracking-wider">
                        ouvindo agora
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white mb-1 truncate">
                      {spotifyTrack.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-light truncate">
                      {spotifyTrack.artist}
                    </p>
                    {spotifyTrack.album && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 font-light truncate mt-1">
                        {spotifyTrack.album}
                      </p>
                    )}
                  </div>

                  {/* Logo Spotify */}
                  <div className="flex-shrink-0">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 dark:text-green-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Explorar - Minimalista */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-12"
          >
            <h3 className="text-sm font-light text-gray-400 dark:text-gray-500 mb-8 text-center">
              explore por tema
            </h3>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { emoji: '😰', label: 'ansiedade' },
                { emoji: '💔', label: 'relacionamento' },
                { emoji: '💼', label: 'trabalho' },
                { emoji: '😔', label: 'tristeza' },
                { emoji: '🤔', label: 'dúvidas' },
                { emoji: '😊', label: 'conquistas' },
                { emoji: '😴', label: 'sono' },
                { emoji: '🎓', label: 'estudos' },
                { emoji: '👨‍👩‍👧‍👦', label: 'família' },
                { emoji: '💪', label: 'motivação' },
                { emoji: '😤', label: 'raiva' },
                { emoji: '😌', label: 'calma' },
                { emoji: '🎯', label: 'objetivos' },
                { emoji: '🤝', label: 'amizade' },
                { emoji: '🌱', label: 'crescimento' },
                { emoji: '🌙', label: 'solidão' },
                { emoji: '😨', label: 'medo' },
                { emoji: '😓', label: 'estresse' },
                { emoji: '💎', label: 'autoestima' },
                { emoji: '🔄', label: 'mudanças' },
                { emoji: '⚖️', label: 'decisões' },
                { emoji: '🔮', label: 'futuro' },
                { emoji: '📜', label: 'passado' },
                { emoji: '✨', label: 'presente' },
                { emoji: '🙏', label: 'gratidão' },
                { emoji: '🌟', label: 'esperança' },
                { emoji: '😞', label: 'desânimo' },
                { emoji: '🌀', label: 'confusão' },
                { emoji: '😄', label: 'alegria' },
                { emoji: '🏆', label: 'orgulho' },
                { emoji: '😳', label: 'vergonha' },
                { emoji: '😟', label: 'insegurança' },
                { emoji: '🔍', label: 'comparação' },
                { emoji: '⏰', label: 'procrastinação' },
                { emoji: '📅', label: 'rotina' },
                { emoji: '🎨', label: 'criatividade' },
                { emoji: '💭', label: 'sonhos' },
                { emoji: '🌍', label: 'realidade' },
                { emoji: '📊', label: 'expectativas' },
                { emoji: '🤗', label: 'aceitação' },
                { emoji: '🦋', label: 'mudança' },
                { emoji: '🧘', label: 'autocuidado' },
                { emoji: '🚧', label: 'limites' },
                { emoji: '💬', label: 'comunicação' },
                { emoji: '💕', label: 'intimidade' },
                { emoji: '🕊️', label: 'perdão' },
                { emoji: '👁️', label: 'ciúmes' },
                { emoji: '🦅', label: 'independência' },
                { emoji: '⚖️', label: 'responsabilidade' },
              ].map((tema, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: 0.5 + i * 0.03,
                    type: 'spring',
                    stiffness: 300,
                    damping: 20
                  }}
                  whileHover={{ 
                    scale: 1.08, 
                    y: -2,
                    boxShadow: '0 4px 12px rgba(236, 72, 153, 0.15)'
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push(`/chat?tema=${tema.label}`)}
                  className="border border-gray-100 dark:border-gray-700 rounded-full px-3 py-1.5 bg-white dark:bg-gray-800 hover:border-pink-300 dark:hover:border-pink-700 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all cursor-pointer"
                >
                  <span className="text-base mr-1.5">{tema.emoji}</span>
                  <span className="text-xs text-gray-600 dark:text-gray-300 font-light">{tema.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Info do usuário */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-center"
          >
            <p className="text-xs text-gray-400 dark:text-gray-500 font-light">
              disponível 24/7 • privado e seguro
            </p>
          </motion.div>
        </div>
      </div>

      {/* Modal de Upgrade para Modo Voz */}
      {showVoiceUpgrade && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowVoiceUpgrade(false)
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
              <div className="text-4xl mb-4">🎤</div>
              <h2 className="text-2xl font-light text-gray-900 dark:text-white mb-2">
                modo voz disponível no plano pro
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-light">
                converse com a nossa IA Luna usando sua voz, de forma natural e intuitiva
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-300 font-light">
                com o plano pro você tem acesso a:
              </p>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300 font-light">
                <li className="flex items-start gap-2">
                  <span className="text-pink-600 mt-0.5">•</span>
                  <span>modo voz com Luna para conversas mais naturais</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-600 mt-0.5">•</span>
                  <span>chat ilimitado</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-600 mt-0.5">•</span>
                  <span>insights ilimitados</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-600 mt-0.5">•</span>
                  <span>suporte prioritário</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowVoiceUpgrade(false)}
                className="flex-1 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-light hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer pointer-events-auto"
                type="button"
              >
                talvez depois
              </button>
              <button
                onClick={() => {
                  setShowVoiceUpgrade(false)
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

      {/* Botões de Feedback e Ajuda no canto inferior direito */}
      <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 flex items-center gap-3">
        {/* Botão de Ajuda */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowHelp(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-sm hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md transition-all cursor-pointer pointer-events-auto"
          type="button"
        >
          <svg 
            className="w-4 h-4 text-gray-600 dark:text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm text-gray-700 dark:text-gray-300 font-light">ajuda</span>
        </motion.button>

        {/* Botão de Feedback */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.85 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowFeedback(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-sm hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md transition-all cursor-pointer pointer-events-auto"
          type="button"
        >
          <svg 
            className="w-4 h-4 text-pink-600" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <span className="text-sm text-gray-700 dark:text-gray-300 font-light">feedback</span>
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
                      apenas pro
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-light leading-relaxed mb-3">
                    converse naturalmente usando sua voz. fale livremente e a IA responde por voz também, 
                    criando uma experiência mais próxima de uma conversa real.
                  </p>
                  <div className="bg-pink-50 dark:bg-pink-900/10 border border-pink-200 dark:border-pink-800 rounded-xl p-4 mb-3">
                    <p className="text-xs text-pink-700 dark:text-pink-300 font-light">
                      <strong>disponível apenas no plano pro:</strong> o modo voz está disponível exclusivamente para assinantes do plano pro. 
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
                      essential e pro
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-light leading-relaxed mb-3">
                    receba análises profundas sobre seus padrões emocionais, temas recorrentes nas suas conversas 
                    e insights personalizados baseados no seu histórico de interações.
                  </p>
                  <div className="bg-pink-50 dark:bg-pink-900/10 border border-pink-200 dark:border-pink-800 rounded-xl p-4">
                    <p className="text-xs text-pink-700 dark:text-pink-300 font-light">
                      <strong>disponível nos planos essential e pro:</strong> insights detalhados e análises avançadas estão disponíveis apenas para assinantes. 
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

                {/* Personalização da IA */}
                <div className="border-b border-gray-100 dark:border-gray-700 pb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">🤖</span>
                    <h3 className="text-xl font-light text-gray-900 dark:text-white">personalização da ia</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-light leading-relaxed mb-3">
                    personalize completamente como a IA conversa com você. ajuste o tom, nível de gírias, 
                    formalidade e personalidade para criar uma experiência única.
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 space-y-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-light">
                      <strong className="text-gray-700 dark:text-gray-300">nível de gírias:</strong> escolha entre formal, casual ou bem informal.
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-light">
                      <strong className="text-gray-700 dark:text-gray-300">personalidade:</strong> séria, equilibrada ou brincalhona.
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-light">
                      <strong className="text-gray-700 dark:text-gray-300">formalidade:</strong> formal, informal ou bem casual.
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-light">
                      <strong className="text-gray-700 dark:text-gray-300">configure em:</strong> vá em conta → personalização da ia.
                    </p>
                  </div>
                </div>

                {/* Planos */}
                <div className="border-b border-gray-100 dark:border-gray-700 pb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">⭐</span>
                    <h3 className="text-xl font-light text-gray-900 dark:text-white">planos disponíveis</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">grátis</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-light">
                        120 mensagens por mês • sem insights • sem modo de voz
                      </p>
                    </div>
                    <div className="bg-pink-50 dark:bg-pink-900/10 rounded-xl p-4 border border-pink-200 dark:border-pink-800">
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">essential (R$ 19,90/mês)</p>
                      <p className="text-xs text-pink-700 dark:text-pink-300 font-light">
                        mensagens ilimitadas • insights ilimitados • sem modo de voz
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/10 dark:to-purple-900/10 rounded-xl p-4 border-2 border-pink-500 dark:border-pink-600">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">pro (R$ 29,90/mês)</p>
                        <span className="px-2 py-0.5 bg-pink-500 text-white rounded-full text-xs">mais popular</span>
                      </div>
                      <p className="text-xs text-pink-700 dark:text-pink-300 font-light">
                        mensagens ilimitadas • insights ilimitados • <strong>chat por voz</strong> • todos os recursos
                      </p>
                    </div>
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

      {/* Modal de Feedback */}
      <AnimatePresence>
        {showFeedback && (
          <div 
            className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowFeedback(false)
                setFeedbackText('')
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-2xl w-full shadow-2xl transition-colors"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-light text-gray-900 dark:text-white">
                  como o desabafo.io pode melhorar?
                </h2>
                <button
                  onClick={() => {
                    setShowFeedback(false)
                    setFeedbackText('')
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-light mb-4">
                  sua opinião é muito importante para nós. compartilhe suas ideias, sugestões ou o que você gostaria de ver no desabafo.io.
                </p>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="escreva seu feedback aqui..."
                  className="w-full h-48 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white bg-white dark:bg-gray-800 font-light placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-pink-500 transition-colors resize-none"
                  disabled={isSubmittingFeedback}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowFeedback(false)
                    setFeedbackText('')
                  }}
                  disabled={isSubmittingFeedback}
                  className="flex-1 py-3 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-light hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                >
                  cancelar
                </button>
                <button
                  onClick={handleSubmitFeedback}
                  disabled={isSubmittingFeedback || !feedbackText.trim()}
                  className="flex-1 py-3 bg-pink-600 text-white rounded-xl font-light hover:bg-pink-700 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                >
                  {isSubmittingFeedback ? 'enviando...' : 'enviar feedback'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}

