'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Sidebar from '@/components/Sidebar'
import { useUserPlan } from '@/lib/getUserPlanClient'

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
  }, [])

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
    <div className="min-h-screen bg-white dark:bg-gray-900 relative transition-colors">
      {/* Logo desabafo no topo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute top-6 sm:top-8 left-6 sm:left-8 z-50"
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
      <div className="flex items-center justify-center min-h-screen px-6 sm:px-8 py-20">
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

          {/* Configurações */}
          <div className="space-y-6 mb-12">
            <h2 className="text-xl font-light text-gray-900 dark:text-white text-center mb-8">
              configurações
            </h2>

            {/* Contato */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
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
    </div>
  )
}

