'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface AccountModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AccountModal({ isOpen, onClose }: AccountModalProps) {
  const [user, setUser] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (isOpen) {
      loadUserData()
    }
  }, [isOpen])

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

  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture
  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'usuário'

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]"
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-lg mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-3xl shadow-2xl p-10 sm:p-12">
                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-3xl font-light text-gray-900">conta</h2>
                  <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer"
                    type="button"
                  >
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Foto e Nome */}
                <div className="flex flex-col items-center mb-10">
                  <div className="relative mb-6">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        className="w-32 h-32 rounded-full object-cover border-4 border-gray-100 shadow-lg"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center text-white text-4xl font-light shadow-lg">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="w-full max-w-sm">
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl text-center text-lg text-gray-900 font-light focus:outline-none focus:border-pink-500 transition-colors"
                        placeholder="seu nome"
                        autoFocus
                      />
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => {
                            setIsEditing(false)
                            setEditedName(user?.user_metadata?.name || user?.email?.split('@')[0] || '')
                          }}
                          className="flex-1 py-3.5 border-2 border-gray-200 text-gray-700 rounded-xl font-light hover:bg-gray-50 transition-all cursor-pointer text-base"
                          type="button"
                        >
                          cancelar
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={isSaving || !editedName.trim()}
                          className="flex-1 py-3.5 bg-pink-600 text-white rounded-xl font-light hover:bg-pink-700 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-base"
                          type="button"
                        >
                          {isSaving ? 'salvando...' : 'salvar'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-2xl font-light text-gray-900 mb-3">{displayName}</h3>
                      <p className="text-base text-gray-500 font-light mb-6">{user?.email}</p>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-light hover:bg-gray-50 transition-all cursor-pointer text-base"
                        type="button"
                      >
                        alterar nome
                      </button>
                    </>
                  )}
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 my-8" />

                {/* Botão Sair */}
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full py-4 border-2 border-red-200 text-red-600 rounded-xl font-light hover:bg-red-50 transition-all cursor-pointer text-base"
                  type="button"
                >
                  sair
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal de confirmação de logout */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[102]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[103] w-full max-w-lg mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-3xl p-10 sm:p-12 shadow-2xl">
                <h2 className="text-2xl font-light text-gray-900 mb-5 text-center">
                  não vai me deixar sozinho né?
                </h2>
                <p className="text-base text-gray-500 font-light text-center mb-8">
                  tem certeza que quer sair?
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="flex-1 py-4 border-2 border-gray-200 text-gray-700 rounded-xl font-light hover:bg-gray-50 transition-all cursor-pointer pointer-events-auto text-base"
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
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

