'use client'

import { motion } from 'framer-motion'

export default function Header() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-pink-100 dark:border-gray-800 shadow-sm transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <motion.a
            href="#"
            whileHover={{ scale: 1.02 }}
            className="text-2xl font-medium text-gray-900 dark:text-white hover:text-pink-600 transition-colors"
          >
            desabafo 💭
          </motion.a>
          <nav className="hidden sm:flex items-center gap-4 lg:gap-8 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
            <motion.button
              onClick={() => scrollToSection('features')}
              whileHover={{ y: -2 }}
              className="hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
            >
              recursos
            </motion.button>
            <motion.button
              onClick={() => scrollToSection('precos')}
              whileHover={{ y: -2 }}
              className="hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
            >
              preços
            </motion.button>
            <motion.a
              href="/login"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gray-900 dark:bg-pink-600 text-white rounded-full text-xs sm:text-sm font-medium hover:bg-gray-800 dark:hover:bg-pink-700 transition-all shadow-sm hover:shadow-md whitespace-nowrap"
            >
              entrar →
            </motion.a>
          </nav>
          <motion.a
            href="/login"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="sm:hidden px-5 py-2 bg-pink-500 text-white rounded-full text-sm font-medium hover:bg-pink-600 transition-colors"
          >
            entrar
          </motion.a>
        </div>
      </div>
    </motion.header>
  )
}

