'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    setMobileMenuOpen(false)
  }

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-pink-100 dark:border-gray-800 shadow-sm transition-colors"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <motion.a
              href="#"
              whileHover={{ scale: 1.02 }}
              className="text-xl sm:text-2xl font-medium text-gray-900 dark:text-white hover:text-pink-600 transition-colors"
            >
              desabafo 💭
            </motion.a>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-4 lg:gap-8 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              <motion.button
                onClick={() => scrollToSection('features')}
                whileHover={{ y: -2 }}
                className="hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
                type="button"
              >
                recursos
              </motion.button>
              <motion.button
                onClick={() => scrollToSection('precos')}
                whileHover={{ y: -2 }}
                className="hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
                type="button"
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

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-3">
              <motion.a
                href="/login"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 bg-pink-500 text-white rounded-full text-sm font-medium hover:bg-pink-600 transition-colors"
              >
                entrar
              </motion.a>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-10 h-10 flex flex-col items-center justify-center gap-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg transition-all"
                type="button"
                aria-label="Menu"
              >
                <motion.span 
                  animate={{ 
                    rotate: mobileMenuOpen ? 45 : 0,
                    y: mobileMenuOpen ? 6 : 0
                  }}
                  className="w-5 h-0.5 bg-gray-700 dark:bg-gray-300 rounded-full"
                />
                <motion.span 
                  animate={{ 
                    opacity: mobileMenuOpen ? 0 : 1
                  }}
                  className="w-5 h-0.5 bg-gray-700 dark:bg-gray-300 rounded-full"
                />
                <motion.span 
                  animate={{ 
                    rotate: mobileMenuOpen ? -45 : 0,
                    y: mobileMenuOpen ? -6 : 0
                  }}
                  className="w-5 h-0.5 bg-gray-700 dark:bg-gray-300 rounded-full"
                />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed top-[72px] left-4 right-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 z-50 overflow-hidden"
            >
              <nav className="p-4 space-y-2">
                <motion.button
                  onClick={() => scrollToSection('features')}
                  whileTap={{ scale: 0.98 }}
                  className="w-full text-left px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all font-medium"
                  type="button"
                >
                  recursos
                </motion.button>
                <motion.button
                  onClick={() => scrollToSection('precos')}
                  whileTap={{ scale: 0.98 }}
                  className="w-full text-left px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all font-medium"
                  type="button"
                >
                  preços
                </motion.button>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

