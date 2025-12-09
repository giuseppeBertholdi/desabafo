'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { motion } from 'framer-motion'
import Sidebar from '@/components/Sidebar'

interface DashboardClientProps {
  firstName: string
  userEmail: string
}

export default function DashboardClient({ firstName, userEmail }: DashboardClientProps) {
  const [simpleMode, setSimpleMode] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-white relative">
      {/* Logo desabafo no topo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute top-6 sm:top-8 left-16 sm:left-8 z-50 flex items-center"
      >
        <h1 className="text-xl sm:text-2xl font-light text-gray-900 tracking-tight">desabafo.io</h1>
      </motion.div>

      {/* Sidebar esquerda com ícones */}
      <Sidebar />

      {/* Switch Modo Simples + Logout no canto superior direito */}
      <div className="absolute top-6 sm:top-8 right-6 sm:right-8 flex items-center gap-4 z-50">
        <button
          onClick={handleLogout}
          className="text-xs sm:text-sm text-gray-400 hover:text-gray-600 transition-colors font-light cursor-pointer pointer-events-auto"
          type="button"
        >
          sair
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm text-gray-500 font-light">simples</span>
          <button
            onClick={() => setSimpleMode(!simpleMode)}
            className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer pointer-events-auto ${
              simpleMode ? 'bg-pink-600' : 'bg-gray-200'
            }`}
            type="button"
          >
            <div
              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
                simpleMode ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
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
            <h1 className="text-5xl sm:text-6xl lg:text-7xl text-gray-900 font-light tracking-tight mb-3">
              {simpleMode ? `oi, ${firstName}` : `e aí, ${firstName}?`}
            </h1>
            <p className="text-base sm:text-lg font-light text-gray-500">
              {simpleMode ? 'como você quer conversar?' : 'como você quer conversar hoje?'}
            </p>
          </motion.div>

          {/* Cards principais de modo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-20">
            {/* Text Mode - Disponível e DESTAQUE */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => router.push('/chat')}
              className="border border-gray-200 rounded-2xl p-12 bg-white hover:border-gray-300 hover:shadow-lg transition-all group"
            >
              <div className="text-center">
                <div className="text-3xl mb-5">✨</div>
                <h2 className="text-xl font-light text-gray-900 mb-2">
                  {simpleMode ? 'texto' : 'modo texto'}
                </h2>
                <p className="text-sm text-gray-500 font-light">
                  {simpleMode ? 'escreva livremente' : 'converse por escrito'}
                </p>
              </div>
            </motion.button>

            {/* Voice Mode - Bloqueado */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="border border-gray-100 rounded-2xl p-12 bg-gray-50/50 opacity-40 cursor-not-allowed"
            >
              <div className="text-center">
                <div className="text-3xl mb-5">🎤</div>
                <h2 className="text-xl font-light text-gray-900 mb-2">
                  {simpleMode ? 'voz' : 'modo voz'}
                </h2>
                <p className="text-sm text-gray-400 font-light">
                  {simpleMode ? 'em breve' : 'em breve'}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Explorar - Minimalista */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-12"
          >
            <h3 className="text-sm font-light text-gray-400 mb-8 text-center">
              {simpleMode ? 'explorar' : 'explore por tema'}
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
              ].map((tema, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 + i * 0.03 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push(`/chat?tema=${tema.label}`)}
                  className="border border-gray-100 rounded-full px-3 py-1.5 bg-white hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer"
                >
                  <span className="text-base mr-1.5">{tema.emoji}</span>
                  <span className="text-xs text-gray-600 font-light">{tema.label}</span>
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
            <p className="text-xs text-gray-400 font-light">
              disponível 24/7 • privado e seguro
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

