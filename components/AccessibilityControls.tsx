'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAccessibility } from '@/hooks/useAccessibility'

export default function AccessibilityControls() {
  const [isOpen, setIsOpen] = useState(false)
  const { settings, updateFontSize, toggleHighContrast, toggleReducedMotion } = useAccessibility()

  return (
    <>
      {/* Botão flutuante */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 z-50 w-12 h-12 bg-pink-500 hover:bg-pink-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
        aria-label="Configurações de acessibilidade"
        aria-expanded={isOpen}
        type="button"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      </motion.button>

      {/* Painel de controles */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              aria-hidden="true"
            />

            {/* Painel */}
            <motion.div
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.95 }}
              data-modal="true"
              className="fixed bottom-24 left-6 z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 w-80 max-w-[calc(100vw-3rem)]"
              role="dialog"
              aria-modal="true"
              aria-labelledby="accessibility-title"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 id="accessibility-title" className="text-lg font-medium text-gray-900 dark:text-white">
                  acessibilidade
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label="Fechar configurações de acessibilidade"
                  data-close-modal
                  type="button"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Tamanho da fonte */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    tamanho da fonte
                  </label>
                  <div className="flex gap-2">
                    {(['small', 'medium', 'large'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => updateFontSize(size)}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          settings.fontSize === size
                            ? 'bg-pink-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                        type="button"
                      >
                        {size === 'small' ? 'pequeno' : size === 'medium' ? 'médio' : 'grande'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Alto contraste */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    alto contraste
                  </label>
                  <button
                    onClick={toggleHighContrast}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      settings.highContrast ? 'bg-pink-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                    type="button"
                    aria-label={settings.highContrast ? 'Desativar alto contraste' : 'Ativar alto contraste'}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                        settings.highContrast ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Reduzir animações */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    reduzir animações
                  </label>
                  <button
                    onClick={toggleReducedMotion}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      settings.reducedMotion ? 'bg-pink-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                    type="button"
                    aria-label={settings.reducedMotion ? 'Ativar animações' : 'Reduzir animações'}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                        settings.reducedMotion ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Atalhos de teclado */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    atalhos de teclado:
                  </p>
                  <div className="space-y-1 text-xs text-gray-500 dark:text-gray-500">
                    <div><kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">Esc</kbd> fechar modais</div>
                    <div><kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">Ctrl/Cmd</kbd> + <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">K</kbd> buscar</div>
                    <div><kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">Ctrl/Cmd</kbd> + <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">/</kbd> ajuda</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

