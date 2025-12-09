'use client'

import { motion } from 'framer-motion'

export default function Features() {
  const features = [
    {
      emoji: '💬',
      title: 'chat por texto ou voz',
      description: 'escreva quando quiser ou fale naturalmente. o chat por voz (pro) é totalmente privado e não fica salvo — perfeito pra desabafar sem filtros.',
      imageSide: 'left',
    },
    {
      emoji: '🧠',
      title: 'memória de longo prazo',
      description: 'a IA lembra do que você compartilha ao longo do tempo, fazendo conexões e entendendo seus padrões únicos. quanto mais você conversa, melhor ela te conhece.',
      imageSide: 'right',
    },
    {
      emoji: '📊',
      title: 'insights e análise de sentimentos',
      description: 'receba insights personalizados sobre seus padrões de pensamento, temas recorrentes e análise de sentimentos baseada nas suas conversas.',
      imageSide: 'left',
    },
    {
      emoji: '📝',
      title: 'journal e histórico',
      description: 'registre seus pensamentos no journal e acesse todo o histórico das suas conversas. tudo organizado pra você revisitar quando quiser.',
      imageSide: 'right',
    },
    {
      emoji: '🎯',
      title: 'temas e contexto',
      description: 'escolha um tema antes de começar (ansiedade, relacionamento, trabalho...) ou deixe a IA identificar automaticamente. ela se adapta ao que você precisa.',
      imageSide: 'left',
    },
    {
      emoji: '💜',
      title: 'modo melhor amigo',
      description: 'ative o modo melhor amigo pra uma conversa ainda mais empática, verdadeira e acolhedora. como falar com alguém que realmente se importa.',
      imageSide: 'right',
    },
    {
      emoji: '🎵',
      title: 'conexão com Spotify',
      description: 'conecte sua conta Spotify e a IA entende melhor sua vibe através das músicas que você está ouvindo. ela usa suas músicas atuais e recentes pra ter um contexto mais rico e empático das suas conversas.',
      imageSide: 'left',
    },
    {
      emoji: '🔒',
      title: '100% privado e seguro',
      description: 'suas conversas são criptografadas e privadas. o chat por voz não fica salvo. você pode deletar tudo a qualquer momento. seus dados são só seus.',
      imageSide: 'right',
    },
  ]

  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-24"
        >
          <h2 className="text-4xl sm:text-5xl font-light text-gray-900 dark:text-white mb-3 tracking-wide">
            tudo que você precisa
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 font-light">
            pra se conhecer melhor e ter um espaço seguro pra desabafar
          </p>
        </motion.div>

        <div className="space-y-32">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`flex flex-col ${
                feature.imageSide === 'right' ? 'lg:flex-row-reverse' : 'lg:flex-row'
              } items-center gap-12 lg:gap-16`}
            >
              {/* Card visual ao invés de imagem */}
              <div className="w-full lg:w-1/2">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100 dark:from-gray-800 dark:via-purple-900/20 dark:to-gray-800 p-8 sm:p-12 shadow-xl border border-pink-100 dark:border-gray-700"
                >
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="text-7xl sm:text-8xl mb-4"
                    >
                      {feature.emoji}
                    </motion.div>
                    <h4 className="text-xl sm:text-2xl font-light text-gray-900 dark:text-white mb-3">
                      {feature.title}
                    </h4>
                  </div>
                  
                  {/* Elementos decorativos */}
                  <div className="absolute top-4 right-4 w-20 h-20 bg-pink-200 dark:bg-pink-900/30 rounded-full blur-2xl" />
                  <div className="absolute bottom-4 left-4 w-24 h-24 bg-purple-200 dark:bg-purple-900/30 rounded-full blur-2xl" />
                </motion.div>
              </div>

              {/* Texto */}
              <div className="w-full lg:w-1/2">
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-5xl mb-6"
                >
                  {feature.emoji}
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0, x: feature.imageSide === 'right' ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-3xl sm:text-4xl font-light text-gray-900 dark:text-white mb-5 tracking-wide"
                >
                  {feature.title}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, x: feature.imageSide === 'right' ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 font-light leading-relaxed"
                >
                  {feature.description}
                </motion.p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

