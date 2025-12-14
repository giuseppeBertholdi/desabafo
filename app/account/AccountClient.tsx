'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Sidebar from '@/components/Sidebar'
import { useUserPlan } from '@/lib/getUserPlanClient'
import MessageUsageBar from '@/components/MessageUsageBar'
import VoiceUsageBar from '@/components/VoiceUsageBar'
import AccessibilityControls from '@/components/AccessibilityControls'

export default function AccountClient() {
  const [user, setUser] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isSyncingSubscription, setIsSyncingSubscription] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null)
  const [isLoadingPortal, setIsLoadingPortal] = useState(false)
  const [messageUsage, setMessageUsage] = useState({
    messagesSent: 0,
    maxMessages: 120,
    percentage: 0,
    isLimitReached: false
  })
  const [isLoadingUsage, setIsLoadingUsage] = useState(true)
  const [voiceUsage, setVoiceUsage] = useState({
    minutesUsed: 0,
    maxMinutes: 500,
    isLimitReached: false,
    remainingMinutes: 500
  })
  const [isLoadingVoiceUsage, setIsLoadingVoiceUsage] = useState(true)
  const [referralStats, setReferralStats] = useState({
    referralCode: null as string | null,
    referralUrl: null as string | null,
    totalReferrals: 0,
    completedReferrals: 0,
    remainingReferrals: 5
  })
  const [isLoadingReferral, setIsLoadingReferral] = useState(true)
  const [copied, setCopied] = useState(false)
  
  // Personalização da IA
  const [isEditingPersonalization, setIsEditingPersonalization] = useState(false)
  const [isSavingPersonalization, setIsSavingPersonalization] = useState(false)
  const [personalization, setPersonalization] = useState({
    age: '',
    gender: '',
    profession: '',
    slangLevel: 'moderado',
    playfulness: 'equilibrado',
    formality: 'informal'
  })
  
  // Spotify
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false)
  const [isConnectingSpotify, setIsConnectingSpotify] = useState(false)
  const [isDisconnectingSpotify, setIsDisconnectingSpotify] = useState(false)
  
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { plan, refreshPlan } = useUserPlan()

  useEffect(() => {
    setMounted(true)
    const theme = localStorage.getItem('theme') || 'light'
    setDarkMode(theme === 'dark')
  }, [])

  const toggleDarkMode = () => {
    const newTheme = darkMode ? 'light' : 'dark'
    setDarkMode(!darkMode)
    localStorage.setItem('theme', newTheme)
    
    // Aplicar tema imediatamente
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    // Disparar evento customizado para atualizar outras partes da aplicação
    window.dispatchEvent(new Event('themechange'))
  }

  useEffect(() => {
    loadUserData()
    loadSubscriptionStatus()
    loadPersonalization()
    checkSpotifyConnection()
    if (plan === 'free') {
      loadMessageUsage()
    }
    if (plan === 'pro') {
      loadVoiceUsage()
    }
    loadReferralStats()

    // Verificar se veio do callback do Spotify
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('spotify') === 'connected') {
      // Remover parâmetro da URL
      window.history.replaceState({}, '', '/account')
      // Recarregar status do Spotify
      setTimeout(() => checkSpotifyConnection(), 500)
    }

    // Recarregar uso de voz quando a página ganha foco (para atualizar após sessão)
    const handleFocus = () => {
      if (plan === 'pro') {
        loadVoiceUsage()
      }
      // Recarregar estatísticas de referência também
      loadReferralStats()
    }
    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [plan])

  const checkSpotifyConnection = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('spotify_access_token')
        .eq('user_id', session.user.id)
        .maybeSingle()

      setIsSpotifyConnected(!!profile?.spotify_access_token)
    } catch (error) {
      console.error('Erro ao verificar conexão Spotify:', error)
    }
  }

  const handleConnectSpotify = async () => {
    setIsConnectingSpotify(true)
    try {
      const response = await fetch('/api/spotify/auth')
      const data = await response.json()

      if (data.authUrl) {
        window.location.href = data.authUrl
      } else {
        alert('Erro ao conectar ao Spotify')
        setIsConnectingSpotify(false)
      }
    } catch (error) {
      console.error('Erro ao conectar Spotify:', error)
      alert('Erro ao conectar ao Spotify')
      setIsConnectingSpotify(false)
    }
  }

  const handleDisconnectSpotify = async () => {
    setIsDisconnectingSpotify(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

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
    } catch (error) {
      console.error('Erro ao desconectar Spotify:', error)
      alert('Erro ao desconectar Spotify')
    } finally {
      setIsDisconnectingSpotify(false)
    }
  }

  const loadSubscriptionStatus = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('status')
      .eq('user_id', session.user.id)
      .single()

    setSubscriptionStatus(subscription?.status || null)
  }

  const loadMessageUsage = async () => {
    try {
      setIsLoadingUsage(true)
      const response = await fetch('/api/messages/usage')
      if (response.ok) {
        const data = await response.json()
        setMessageUsage({
          messagesSent: data.messagesSent,
          maxMessages: data.maxMessages,
          percentage: data.percentage,
          isLimitReached: data.isLimitReached
        })
      }
    } catch (error) {
      console.error('Erro ao buscar uso de mensagens:', error)
    } finally {
      setIsLoadingUsage(false)
    }
  }

  const loadVoiceUsage = async () => {
    try {
      setIsLoadingVoiceUsage(true)
      const response = await fetch('/api/voice/usage')
      if (response.ok) {
        const data = await response.json()
        setVoiceUsage({
          minutesUsed: data.minutesUsed,
          maxMinutes: data.maxMinutes,
          isLimitReached: data.isLimitReached,
          remainingMinutes: data.remainingMinutes
        })
      }
    } catch (error) {
      console.error('Erro ao buscar uso de voz:', error)
    } finally {
      setIsLoadingVoiceUsage(false)
    }
  }

  const loadReferralStats = async () => {
    try {
      setIsLoadingReferral(true)
      const response = await fetch('/api/referral/stats')
      if (response.ok) {
        const data = await response.json()
        console.log('Estatísticas de referência carregadas:', data)
        setReferralStats({
          referralCode: data.referralCode,
          referralUrl: data.referralUrl,
          totalReferrals: data.totalReferrals,
          completedReferrals: data.completedReferrals,
          remainingReferrals: data.remainingReferrals
        })
      } else {
        console.error('Erro ao buscar estatísticas:', response.status)
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas de referência:', error)
    } finally {
      setIsLoadingReferral(false)
    }
  }

  const generateReferralCode = async () => {
    try {
      const response = await fetch('/api/referral/generate', {
        method: 'POST'
      })
      if (response.ok) {
        const data = await response.json()
        setReferralStats(prev => ({
          ...prev,
          referralCode: data.referralCode,
          referralUrl: data.referralUrl
        }))
        // Recarregar estatísticas após gerar
        await loadReferralStats()
      } else {
        const errorData = await response.json()
        console.error('Erro ao gerar código de referência:', errorData)
        alert(errorData.error || 'Erro ao gerar código de referência. Verifique se a tabela referrals existe no banco de dados.')
      }
    } catch (error) {
      console.error('Erro ao gerar código de referência:', error)
      alert('Erro ao gerar código de referência. Verifique sua conexão.')
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Erro ao copiar:', error)
    }
  }

  const handleSyncSubscription = async () => {
    setIsSyncingSubscription(true)
    try {
      const response = await fetch('/api/stripe/sync-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()

      if (response.ok) {
        await refreshPlan()
        await loadSubscriptionStatus()
        alert('Assinatura sincronizada com sucesso!')
      } else {
        alert(data.error || 'Erro ao sincronizar assinatura')
      }
    } catch (error) {
      console.error('Erro ao sincronizar assinatura:', error)
      alert('Erro ao sincronizar assinatura. Tente novamente.')
    } finally {
      setIsSyncingSubscription(false)
    }
  }

  const handleManageSubscription = async () => {
    setIsLoadingPortal(true)
    try {
      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()

      if (response.ok && data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Erro ao acessar portal de gerenciamento')
        setIsLoadingPortal(false)
      }
    } catch (error) {
      console.error('Erro ao acessar portal:', error)
      alert('Erro ao acessar portal de gerenciamento. Tente novamente.')
      setIsLoadingPortal(false)
    }
  }


  const loadUserData = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      setUser(session.user)
      setEditedName(session.user.user_metadata?.name || session.user.email?.split('@')[0] || '')
    }
  }

  const loadPersonalization = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('age, gender, profession, ai_settings')
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (profile) {
        const aiSettings = profile.ai_settings || {}
        setPersonalization({
          age: profile.age?.toString() || '',
          gender: profile.gender || '',
          profession: profile.profession || '',
          slangLevel: aiSettings.slang_level || 'moderado',
          playfulness: aiSettings.playfulness || 'equilibrado',
          formality: aiSettings.formality || 'informal'
        })
      }
    } catch (error) {
      console.error('Erro ao carregar personalização:', error)
    }
  }

  const handleSavePersonalization = async () => {
    setIsSavingPersonalization(true)
    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(personalization),
      })

      if (response.ok) {
        setIsEditingPersonalization(false)
        await loadPersonalization()
      } else {
        console.error('Erro ao salvar personalização')
      }
    } catch (error) {
      console.error('Erro ao salvar personalização:', error)
    } finally {
      setIsSavingPersonalization(false)
    }
  }


  const handleSave = async () => {
    if (!user) return
    
    setIsSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          name: editedName
        }
      })

      if (error) throw error

      // Atualizar também no user_profiles se existir
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (profile) {
        await supabase
          .from('user_profiles')
          .update({ 
            preferred_name: editedName,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
      }

      await loadUserData()
      setIsEditing(false)
    } catch (error) {
      console.error('Erro ao salvar:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleDeleteAccount = async () => {
    if (!user) return
    
    try {
      // Deletar perfil do usuário
      await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', user.id)

      // Deletar sessões e mensagens
      await supabase
        .from('chat_sessions')
        .delete()
        .eq('user_id', user.id)

      // Chamar API para deletar conta do Supabase Auth
      const response = await fetch('/api/account/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error('Erro ao deletar conta')
      }
      
      // Fazer logout e redirecionar
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Erro ao deletar conta:', error)
      alert('Erro ao deletar conta. Tente novamente.')
    }
  }


  const avatarUrl = user?.user_metadata?.avatar_url || 
                    user?.user_metadata?.picture || 
                    user?.avatar_url ||
                    user?.user_metadata?.avatar
  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'usuário'

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 relative transition-colors overflow-hidden">
      {/* Decoração SVG - Bola Rosa (topo direito) */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 pointer-events-none">
        <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="200" cy="200" r="200" fill="url(#gradient-account)" opacity="0.3" />
          <defs>
            <radialGradient id="gradient-account" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(200 200) rotate(90) scale(200)">
              <stop offset="0%" stopColor="#EC4899" />
              <stop offset="100%" stopColor="#DB2777" stopOpacity="0.2" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* Decoração SVG - Bola Rosa (esquerda inferior) */}
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 pointer-events-none">
        <svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="150" cy="150" r="150" fill="url(#gradient2-account)" opacity="0.2" />
          <defs>
            <radialGradient id="gradient2-account" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(150 150) rotate(90) scale(150)">
              <stop offset="0%" stopColor="#F472B6" />
              <stop offset="100%" stopColor="#EC4899" stopOpacity="0.1" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* Logo desabafo no topo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute top-6 sm:top-8 left-16 sm:left-8 z-50 flex items-center"
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

      {/* Conteúdo central - Minimalista inspirado no calmi */}
      <div className="flex items-center justify-center min-h-screen px-6 sm:px-8 py-20 relative z-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl w-full"
        >
          {/* Foto e Nome - Centralizado */}
          <div className="flex flex-col items-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative mb-8"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-100 shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center text-white text-5xl font-light shadow-lg">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </motion.div>

            {isEditing ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
              >
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="w-full px-6 py-4 border-2 border-gray-300 rounded-2xl text-center text-xl text-gray-900 font-light focus:outline-none focus:border-pink-500 transition-colors mb-6"
                  placeholder="seu nome"
                  autoFocus
                />
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setEditedName(user?.user_metadata?.name || user?.email?.split('@')[0] || '')
                    }}
                    className="flex-1 py-4 border-2 border-gray-200 text-gray-700 rounded-2xl font-light hover:bg-gray-50 transition-all cursor-pointer text-base"
                    type="button"
                  >
                    cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !editedName.trim()}
                    className="flex-1 py-4 bg-pink-600 text-white rounded-2xl font-light hover:bg-pink-700 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-base"
                    type="button"
                  >
                    {isSaving ? 'salvando...' : 'salvar'}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-center"
              >
                <h1 className="text-4xl sm:text-5xl font-light text-gray-900 dark:text-white mb-4 tracking-tight">
                  {displayName}
                </h1>
                <p className="text-lg text-gray-500 dark:text-gray-400 font-light mb-8">
                  {user?.email}
                </p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-8 py-3 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-full font-light hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer text-base"
                  type="button"
                >
                  alterar nome
                </button>
              </motion.div>
            )}
          </div>

          {/* Divider sutil */}
          <div className="border-t border-gray-100 dark:border-gray-800 my-12" />

          {/* Uso de Mensagens (apenas plano free) */}
          {plan === 'free' && !isLoadingUsage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="mb-12"
            >
              <MessageUsageBar
                messagesSent={messageUsage.messagesSent}
                maxMessages={messageUsage.maxMessages}
                percentage={messageUsage.percentage}
                isLimitReached={messageUsage.isLimitReached}
              />
            </motion.div>
          )}

          {/* Uso de Voz (apenas plano pro) */}
          {plan === 'pro' && !isLoadingVoiceUsage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="mb-12"
            >
              <VoiceUsageBar
                minutesUsed={voiceUsage.minutesUsed}
                maxMinutes={voiceUsage.maxMinutes}
                isLimitReached={voiceUsage.isLimitReached}
              />
            </motion.div>
          )}

          {/* Sistema de Referência */}
          {!isLoadingReferral && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-12"
            >
              <div className="p-6 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/10 dark:to-purple-900/10 rounded-2xl border border-pink-200 dark:border-pink-800">
                <div className="flex items-start gap-3 mb-4">
                  <span className="text-3xl">🎁</span>
                  <div className="flex-1">
                    <h3 className="text-xl font-light text-gray-900 dark:text-white mb-2">
                      convide amigos e ganhe o plano Essential
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-light mb-4">
                      compartilhe seu link com 5 amigos. quando eles se cadastrarem, você ganha o plano Essential de graça!
                    </p>
                  </div>
                </div>

                {referralStats.referralCode ? (
                  <div className="space-y-4">
                    {/* Progresso */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400 font-light">
                          amigos cadastrados
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {referralStats.completedReferrals} / 5
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-pink-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(referralStats.completedReferrals / 5) * 100}%` }}
                        />
                      </div>
                      {referralStats.completedReferrals >= 5 && (
                        <p className="text-sm text-green-600 dark:text-green-400 mt-2 font-light">
                          🎉 parabéns! você ganhou o plano Essential!
                        </p>
                      )}
                    </div>

                    {/* Link de convite */}
                    <div>
                      <label className="text-sm text-gray-600 dark:text-gray-400 font-light mb-2 block">
                        seu link de convite
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          readOnly
                          value={referralStats.referralUrl || ''}
                          className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-light text-gray-900 dark:text-white focus:outline-none"
                        />
                        <button
                          onClick={() => copyToClipboard(referralStats.referralUrl || '')}
                          className="px-4 py-2 bg-pink-600 text-white rounded-lg font-light hover:bg-pink-700 transition-all text-sm whitespace-nowrap"
                        >
                          {copied ? 'copiado!' : 'copiar'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={generateReferralCode}
                    className="w-full px-4 py-3 bg-pink-600 text-white rounded-lg font-light hover:bg-pink-700 transition-all"
                  >
                    gerar link de convite
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* Divider sutil */}
          {(plan === 'free' || plan === 'pro') && <div className="border-t border-gray-100 dark:border-gray-800 my-12" />}

          {/* Configurações */}
          <div className="space-y-6 mb-12">
            <h2 className="text-xl font-light text-gray-900 dark:text-white text-center mb-8">
              configurações
            </h2>

            {/* Conexão Spotify - Todos os planos */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col items-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border-2 border-green-500/30 dark:border-green-600/30 text-center"
            >
              <div className="flex items-center gap-3 mb-3">
                <svg className="w-8 h-8 text-green-600 dark:text-green-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                <span className="text-2xl">🎵</span>
              </div>
              <p className="text-base font-medium text-gray-900 dark:text-white mb-2">
                Spotify
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-light mb-4">
                {plan === 'free' 
                  ? 'disponível nos planos Essential e Pro!'
                  : isSpotifyConnected 
                    ? 'conectado! a IA usa suas músicas para entender sua vibe'
                    : 'conecte para a IA entender melhor seu humor através das músicas'}
              </p>
              
              {plan === 'free' ? (
                <button
                  onClick={() => router.push('/pricing')}
                  className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-light transition-all text-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                  ver planos
                </button>
              ) : isSpotifyConnected ? (
                <button
                  onClick={handleDisconnectSpotify}
                  disabled={isDisconnectingSpotify}
                  className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-light transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isDisconnectingSpotify ? 'desconectando...' : 'desconectar'}
                </button>
              ) : (
                <button
                  onClick={handleConnectSpotify}
                  disabled={isConnectingSpotify}
                  className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-light transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2"
                >
                  {isConnectingSpotify ? (
                    'conectando...'
                  ) : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                      </svg>
                      conectar Spotify
                    </>
                  )}
                </button>
              )}
            </motion.div>

            {/* Contato */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="flex flex-col items-center p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 text-center"
            >
              <span className="text-3xl mb-3">📧</span>
              <p className="text-base font-light text-gray-900 dark:text-white mb-2">
                contato
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-light mb-3">
                qualquer coisa que precisar é só entrar em contato
              </p>
              <a
                href="mailto:giuseppe.bertholdi@gmail.com"
                className="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 font-light transition-colors text-sm"
              >
                giuseppe.bertholdi@gmail.com
              </a>
            </motion.div>

            {/* Assinatura */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-3 flex-1">
                <span className="text-2xl">⭐</span>
                <div className="flex-1">
                  <p className="text-base font-light text-gray-900 dark:text-white">
                    plano: {plan === 'pro' ? 'pro' : 'grátis'}
                  </p>
                  {plan === 'pro' ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-light">
                      status: {subscriptionStatus || 'ativo'}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-light">
                      upgrade para recursos ilimitados
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {plan === 'pro' && (
                  <button
                    onClick={handleSyncSubscription}
                    disabled={isSyncingSubscription}
                    className="px-4 py-2 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-light hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
                    type="button"
                  >
                    {isSyncingSubscription ? 'sincronizando...' : 'sincronizar'}
                  </button>
                )}
                <button
                  onClick={plan === 'pro' ? handleManageSubscription : () => router.push('/pricing')}
                  disabled={plan === 'pro' && isLoadingPortal}
                  className={`px-4 py-2 rounded-xl font-light transition-all cursor-pointer text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${
                    plan === 'pro'
                      ? 'border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      : 'bg-pink-600 text-white hover:bg-pink-700'
                  }`}
                  type="button"
                >
                  {plan === 'pro' ? (isLoadingPortal ? 'carregando...' : 'gerenciar') : 'upgrade'}
                </button>
              </div>
            </motion.div>

            {/* Tema Escuro */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🌙</span>
                <div>
                  <p className="text-base font-light text-gray-900 dark:text-white">tema escuro</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-light">ativa o modo escuro</p>
                </div>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`relative w-12 h-6 rounded-full transition-colors shadow-inner cursor-pointer ${
                  darkMode ? 'bg-pink-600' : 'bg-gray-300'
                }`}
                type="button"
              >
                <div
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
                    darkMode ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </motion.div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 dark:border-gray-800 my-12" />

          {/* Personalização da IA */}
          <div className="space-y-6 mb-12">
            <h2 className="text-xl font-light text-gray-900 dark:text-white text-center mb-8">
              personalização da ia
            </h2>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="p-6 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/10 dark:to-purple-900/10 rounded-2xl border border-pink-200 dark:border-pink-800"
            >
              <div className="flex items-start gap-3 mb-4">
                <span className="text-2xl">🤖</span>
                <div className="flex-1">
                  <p className="text-base font-light text-gray-900 dark:text-white mb-1">
                    personalize como a ia conversa com você
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-light">
                    ajuste o tom, gírias e personalidade da Luna
                  </p>
                </div>
              </div>

              {isEditingPersonalization ? (
                <div className="space-y-4 mt-6">
                  {/* Informações Pessoais */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">informações pessoais</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="number"
                        value={personalization.age}
                        onChange={(e) => setPersonalization(prev => ({ ...prev, age: e.target.value }))}
                        placeholder="idade"
                        className="px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm font-light text-gray-900 dark:text-white focus:outline-none focus:border-pink-500 dark:focus:border-pink-500 transition-colors"
                      />
                      <input
                        type="text"
                        value={personalization.gender}
                        onChange={(e) => setPersonalization(prev => ({ ...prev, gender: e.target.value }))}
                        placeholder="gênero"
                        className="px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm font-light text-gray-900 dark:text-white focus:outline-none focus:border-pink-500 dark:focus:border-pink-500 transition-colors"
                      />
                      <input
                        type="text"
                        value={personalization.profession}
                        onChange={(e) => setPersonalization(prev => ({ ...prev, profession: e.target.value }))}
                        placeholder="profissão"
                        className="px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm font-light text-gray-900 dark:text-white focus:outline-none focus:border-pink-500 dark:focus:border-pink-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Nível de Gírias */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">nível de gírias</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {[
                        { value: 'sem_girias', label: 'sem gírias' },
                        { value: 'pouco', label: 'pouco' },
                        { value: 'moderado', label: 'moderado' },
                        { value: 'bastante', label: 'bastante' },
                        { value: 'muito', label: 'muito' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setPersonalization(prev => ({ ...prev, slangLevel: option.value }))}
                          className={`px-3 py-2 rounded-lg text-xs font-light transition-all ${
                            personalization.slangLevel === option.value
                              ? 'bg-pink-600 text-white'
                              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-700'
                          }`}
                          type="button"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Personalidade */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">personalidade</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'seria', label: 'séria' },
                        { value: 'equilibrado', label: 'equilibrado' },
                        { value: 'brincalhona', label: 'brincalhona' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setPersonalization(prev => ({ ...prev, playfulness: option.value }))}
                          className={`px-3 py-2 rounded-lg text-xs font-light transition-all ${
                            personalization.playfulness === option.value
                              ? 'bg-pink-600 text-white'
                              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-700'
                          }`}
                          type="button"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Formalidade */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">formalidade</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'formal', label: 'formal' },
                        { value: 'informal', label: 'informal' },
                        { value: 'muito_informal', label: 'bem casual' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setPersonalization(prev => ({ ...prev, formality: option.value }))}
                          className={`px-3 py-2 rounded-lg text-xs font-light transition-all ${
                            personalization.formality === option.value
                              ? 'bg-pink-600 text-white'
                              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-700'
                          }`}
                          type="button"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        setIsEditingPersonalization(false)
                        loadPersonalization()
                      }}
                      className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-light hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer text-sm"
                      type="button"
                    >
                      cancelar
                    </button>
                    <button
                      onClick={handleSavePersonalization}
                      disabled={isSavingPersonalization}
                      className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg font-light hover:bg-pink-700 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      type="button"
                    >
                      {isSavingPersonalization ? 'salvando...' : 'salvar'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 mt-6">
                  {/* Resumo das Configurações */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {personalization.age && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">idade:</span>
                        <span className="ml-2 text-gray-900 dark:text-white font-light">{personalization.age} anos</span>
                      </div>
                    )}
                    {personalization.gender && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">gênero:</span>
                        <span className="ml-2 text-gray-900 dark:text-white font-light">{personalization.gender}</span>
                      </div>
                    )}
                    {personalization.profession && (
                      <div className="col-span-2">
                        <span className="text-gray-500 dark:text-gray-400">profissão:</span>
                        <span className="ml-2 text-gray-900 dark:text-white font-light">{personalization.profession}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">gírias:</span>
                      <span className="ml-2 text-gray-900 dark:text-white font-light">
                        {personalization.slangLevel === 'sem_girias' ? 'sem gírias' :
                         personalization.slangLevel === 'pouco' ? 'pouco' :
                         personalization.slangLevel === 'moderado' ? 'moderado' :
                         personalization.slangLevel === 'bastante' ? 'bastante' : 'muito'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">personalidade:</span>
                      <span className="ml-2 text-gray-900 dark:text-white font-light">
                        {personalization.playfulness === 'seria' ? 'séria' :
                         personalization.playfulness === 'equilibrado' ? 'equilibrado' : 'brincalhona'}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500 dark:text-gray-400">formalidade:</span>
                      <span className="ml-2 text-gray-900 dark:text-white font-light">
                        {personalization.formality === 'formal' ? 'formal' :
                         personalization.formality === 'informal' ? 'informal' : 'bem casual'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsEditingPersonalization(true)}
                    className="w-full px-4 py-2 bg-pink-600 text-white rounded-lg font-light hover:bg-pink-700 transition-all cursor-pointer text-sm"
                    type="button"
                  >
                    personalizar ia
                  </button>
                </div>
              )}
            </motion.div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 dark:border-gray-800 my-12" />

          {/* Ações de Conta */}
          <div className="space-y-6 mb-12">
            {/* Deletar Conta */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🗑️</span>
                <div>
                  <p className="text-base font-light text-red-900 dark:text-red-300">deletar conta</p>
                  <p className="text-sm text-red-600 dark:text-red-400 font-light">excluir permanentemente sua conta</p>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 border-2 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-xl font-light hover:bg-red-100 dark:hover:bg-red-900/40 transition-all cursor-pointer text-sm"
                type="button"
              >
                deletar
              </button>
            </motion.div>
          </div>

          {/* Divider sutil */}
          <div className="border-t border-gray-100 dark:border-gray-800 my-12" />

          {/* Botão Sair - Minimalista */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex justify-center"
          >
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="px-8 py-3 border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-full font-light hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer text-base"
              type="button"
            >
              sair
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Modal de confirmação de logout */}
      {showLogoutConfirm && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowLogoutConfirm(false)
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-3xl p-10 sm:p-12 shadow-2xl max-w-lg w-full"
          >
            <h2 className="text-2xl font-light text-gray-900 dark:text-white mb-5 text-center">
              não vai me deixar sozinho né?
            </h2>
            <p className="text-base text-gray-500 dark:text-gray-400 font-light text-center mb-8">
              tem certeza que quer sair?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-4 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-light hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer pointer-events-auto text-base"
                type="button"
              >
                ficar
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-4 bg-pink-600 text-white rounded-xl font-light hover:bg-pink-700 transition-all cursor-pointer pointer-events-auto text-base"
                type="button"
              >
                sair
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de confirmação de deletar conta */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDeleteConfirm(false)
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-3xl p-10 sm:p-12 shadow-2xl max-w-lg w-full"
          >
            <h2 className="text-2xl font-light text-gray-900 dark:text-white mb-5 text-center">
              tem certeza absoluta?
            </h2>
            <p className="text-base text-gray-500 dark:text-gray-400 font-light text-center mb-2">
              essa ação não pode ser desfeita.
            </p>
            <p className="text-sm text-red-600 dark:text-red-400 font-light text-center mb-8">
              todas as suas conversas e dados serão permanentemente deletados.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-4 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-light hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer pointer-events-auto text-base"
                type="button"
              >
                cancelar
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 py-4 bg-red-600 text-white rounded-xl font-light hover:bg-red-700 transition-all cursor-pointer pointer-events-auto text-base"
                type="button"
              >
                deletar conta
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Controles de Acessibilidade */}
      <AccessibilityControls />
    </div>
  )
}

