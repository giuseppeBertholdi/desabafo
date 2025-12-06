'use client'

import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20 overflow-hidden transition-colors">
      {/* Fundo animado descontraído */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Bolhas grandes flutuantes */}
        <motion.div
          animate={{
            x: [0, 150, -50, 0],
            y: [0, -100, 50, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full opacity-20 blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -120, 80, 0],
            y: [0, 150, -80, 0],
            scale: [1, 0.8, 1.3, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-gradient-to-br from-purple-300 to-pink-400 rounded-full opacity-15 blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 80, -100, 0],
            y: [0, -80, 120, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-1/2 left-1/4 w-80 h-80 bg-gradient-to-br from-pink-400 to-rose-300 rounded-full opacity-15 blur-3xl"
        />
        
        {/* Bolhas médias */}
        <motion.div
          animate={{
            x: [0, 200, -150, 0],
            y: [0, -150, 100, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-1/3 right-1/4 w-64 h-64 bg-pink-200 rounded-full opacity-10 blur-2xl"
        />
        <motion.div
          animate={{
            x: [0, -180, 120, 0],
            y: [0, 180, -100, 0],
            rotate: [360, 0],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute bottom-1/3 left-1/3 w-72 h-72 bg-purple-200 rounded-full opacity-10 blur-2xl"
        />
        
        {/* Bolhas pequenas flutuantes */}
        {[
          { x: 80, y: -60 },
          { x: -90, y: 70 },
          { x: 120, y: -80 },
          { x: -70, y: 90 },
          { x: 100, y: 50 },
          { x: -110, y: -40 },
          { x: 60, y: 110 },
          { x: -50, y: -100 },
        ].map((movement, i) => (
          <motion.div
            key={i}
            animate={{
              x: [0, movement.x, -movement.x / 2, 0],
              y: [0, movement.y, movement.y / 2, 0],
              scale: [1, 1.5, 0.8, 1],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.5,
            }}
            className="absolute w-32 h-32 bg-pink-300 rounded-full opacity-10 blur-xl"
            style={{
              left: `${10 + i * 12}%`,
              top: `${15 + i * 10}%`,
            }}
          />
        ))}
        
        {/* Formas geométricas flutuantes */}
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 0.9, 1],
            x: [0, 100, -50, 0],
            y: [0, -80, 60, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-1/4 right-1/3 w-24 h-24 bg-pink-400 opacity-10 blur-lg"
          style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
        />
        <motion.div
          animate={{
            rotate: [360, 0],
            scale: [1, 0.8, 1.3, 1],
            x: [0, -120, 80, 0],
            y: [0, 100, -70, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute bottom-1/4 left-1/4 w-20 h-20 bg-purple-400 opacity-10 blur-lg rotate-45"
        />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mb-12"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal tracking-tight text-gray-900 dark:text-white mb-8 sm:mb-10 leading-[1.1] px-4"
          >
            não é terapia.<br />
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="inline-block"
            >
              é só desabafo. 💭
            </motion.span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg sm:text-xl md:text-2xl font-light text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 max-w-2xl mx-auto leading-relaxed px-4"
          >
            converse por texto ou voz com uma IA que te entende, sem julgamentos.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-sm sm:text-base md:text-lg font-light text-gray-500 dark:text-gray-400 max-w-xl mx-auto px-4"
          >
            disponível 24/7, até nas madrugadas mais difíceis ✨
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mt-6 sm:mt-8 text-xs sm:text-sm text-gray-500 dark:text-gray-400 px-4"
          >
            <span className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-pink-500">💬</span> <span className="hidden xs:inline">chat por </span>texto
            </span>
            <span className="hidden xs:inline">•</span>
            <span className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-purple-500">🎤</span> <span className="hidden xs:inline">chat por </span>voz
            </span>
            <span className="hidden xs:inline">•</span>
            <span className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-blue-500">📊</span> insights
            </span>
          </motion.div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-12 sm:mb-16 px-4"
        >
          <motion.a
            href="/login"
            whileHover={{ scale: 1.02, y: -3 }}
            whileTap={{ scale: 0.98 }}
            className="inline-block px-8 sm:px-12 py-4 sm:py-5 bg-gray-900 dark:bg-pink-600 text-white rounded-full font-medium text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all duration-200"
          >
            começar grátis →
          </motion.a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-12 sm:mt-16 px-4"
        >
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 lg:gap-8 text-xs sm:text-sm text-gray-400 dark:text-gray-500">
            <span className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-green-500">●</span> <span className="whitespace-nowrap">disponível 24/7</span>
            </span>
            <span className="hidden xs:inline">•</span>
            <span className="whitespace-nowrap">sem compromisso</span>
            <span className="hidden xs:inline">•</span>
            <span className="whitespace-nowrap">totalmente privado 🔒</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

