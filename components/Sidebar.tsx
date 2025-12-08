'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const isActive = (path: string) => {
    if (path === '/home') {
      return pathname === '/home'
    }
    if (path === '/history') {
      return pathname === '/history'
    }
    if (path === '/chat') {
      return pathname?.startsWith('/chat')
    }
    if (path === '/insights') {
      return pathname === '/insights'
    }
    if (path === '/journal') {
      return pathname === '/journal'
    }
    if (path === '/pricing') {
      return pathname === '/pricing'
    }
    if (path === '/account') {
      return pathname === '/account'
    }
    return false
  }

  const menuItems = [
    { 
      path: '/home', 
      label: 'Home',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      path: '/history', 
      label: 'Histórico',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      path: '/insights', 
      label: 'Insights',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    },
    { 
      path: '/journal', 
      label: 'Diário',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    { 
      path: '/pricing', 
      label: 'Preços',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      )
    },
    { 
      path: '/account', 
      label: 'Conta',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ]

  const handleNavigation = (path: string) => {
    router.push(path)
    setIsOpen(false)
  }

  return (
    <>
      {/* Botão Hamburguer - Apenas Mobile */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-6 left-4 z-[60] w-10 h-10 flex flex-col items-center justify-center gap-1.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all"
        type="button"
        aria-label="Menu"
      >
        <motion.span 
          animate={{ 
            rotate: isOpen ? 45 : 0,
            y: isOpen ? 8 : 0
          }}
          className="w-5 h-0.5 bg-gray-700 dark:bg-gray-300 rounded-full transition-all"
        />
        <motion.span 
          animate={{ 
            opacity: isOpen ? 0 : 1,
            x: isOpen ? -10 : 0
          }}
          className="w-5 h-0.5 bg-gray-700 dark:bg-gray-300 rounded-full transition-all"
        />
        <motion.span 
          animate={{ 
            rotate: isOpen ? -45 : 0,
            y: isOpen ? -8 : 0
          }}
          className="w-5 h-0.5 bg-gray-700 dark:bg-gray-300 rounded-full transition-all"
        />
      </motion.button>

      {/* Overlay para Mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
            className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-[55]"
          />
        )}
      </AnimatePresence>

      {/* Menu Mobile - Drawer from Left */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="md:hidden fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-gray-900 z-[60] shadow-2xl overflow-y-auto"
          >
            <div className="p-6">
              <div className="mb-8 mt-2">
                <h2 className="text-2xl font-light text-gray-900 dark:text-white">desabafo 💭</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-light">navegação</p>
              </div>

              <nav className="space-y-2">
                {menuItems.map((item, index) => (
                  <motion.button
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${
                      isActive(item.path)
                        ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg shadow-pink-200 dark:shadow-pink-900/30'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    type="button"
                  >
                    {item.icon}
                    <span className="text-base font-light">{item.label}</span>
                  </motion.button>
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Desktop - Vertical Icons */}
      <div className="hidden md:block fixed left-6 lg:left-8 top-1/2 -translate-y-1/2 z-50">
        {/* Fundo blur */}
        <div className="absolute inset-0 -left-4 -right-4 -top-4 -bottom-4 bg-gradient-to-br from-pink-50/15 via-purple-50/10 to-pink-50/15 dark:from-gray-800/50 dark:via-gray-800/30 dark:to-gray-800/50 backdrop-blur-md rounded-2xl" />
        
        {/* Ícones */}
        <div className="relative flex flex-col gap-6 lg:gap-8 px-4 py-4">
          {menuItems.map((item) => (
            <motion.button
              key={item.path}
              onClick={() => router.push(item.path)}
              whileHover={{ scale: 1.1, x: 2 }}
              whileTap={{ scale: 0.95 }}
              className={`transition-colors cursor-pointer pointer-events-auto ${
                isActive(item.path) ? 'text-pink-500' : 'text-gray-400 hover:text-pink-500'
              }`}
              title={item.label}
              type="button"
            >
              {item.icon}
            </motion.button>
          ))}
        </div>
      </div>
    </>
  )
}

