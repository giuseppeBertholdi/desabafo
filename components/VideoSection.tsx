'use client'

import { motion } from 'framer-motion'

export default function VideoSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-pink-50 to-white relative"
    >
      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl sm:text-5xl font-normal text-gray-900 dark:text-white mb-4">
            veja como funciona
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 font-light">
            é mais simples do que você imagina
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-pink-100 via-purple-100 to-pink-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 aspect-video border-8 border-white dark:border-gray-700"
        >
          <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="mb-4"
              >
                <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center shadow-xl">
                  <svg
                    className="w-10 h-10 text-pink-500 ml-1"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </motion.div>
              <p className="text-gray-700 dark:text-gray-300 font-medium text-lg">
                vídeo demo chegando em breve ✨
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}

