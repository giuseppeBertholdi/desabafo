'use client'

import { motion } from 'framer-motion'

export default function Features() {
  const features = [
    {
      emoji: '💬',
      title: 'chat por texto ou voz',
      description: 'escreva quando quiser ou fale naturalmente. o chat por voz (pro) é totalmente privado e não fica salvo — perfeito pra desabafar sem filtros.',
    },
    {
      emoji: '🧠',
      title: 'memória de longo prazo',
      description: 'a IA lembra do que você compartilha ao longo do tempo, fazendo conexões e entendendo seus padrões únicos. quanto mais você conversa, melhor ela te conhece.',
    },
    {
      emoji: '📊',
      title: 'insights e análise de sentimentos',
      description: 'receba insights personalizados sobre seus padrões de pensamento, temas recorrentes e análise de sentimentos baseada nas suas conversas.',
    },
    {
      emoji: '📝',
      title: 'journal e histórico',
      description: 'registre seus pensamentos no journal e acesse todo o histórico das suas conversas. tudo organizado pra você revisitar quando quiser.',
    },
    {
      emoji: '🎯',
      title: 'temas e contexto',
      description: 'escolha um tema antes de começar (ansiedade, relacionamento, trabalho...) ou deixe a IA identificar automaticamente. ela se adapta ao que você precisa.',
    },
    {
      emoji: '💜',
      title: 'modo melhor amigo',
      description: 'ative o modo melhor amigo pra uma conversa ainda mais empática, verdadeira e acolhedora. como falar com alguém que realmente se importa.',
    },
    {
      emoji: '🎵',
      title: 'conexão com Spotify',
      description: 'conecte sua conta Spotify e a IA entende melhor sua vibe através das músicas que você está ouvindo. ela usa suas músicas atuais e recentes pra ter um contexto mais rico e empático das suas conversas.',
    },
    {
      emoji: '🔒',
      title: '100% privado e seguro',
      description: 'suas conversas são criptografadas e privadas. o chat por voz não fica salvo. você pode deletar tudo a qualquer momento. seus dados são só seus.',
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
          className="text-center mb-16 sm:mb-20"
        >
          <h2 className="text-4xl sm:text-5xl font-light text-gray-900 dark:text-white mb-3 tracking-wide">
            tudo que você precisa
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 font-light">
            pra se conhecer melhor e ter um espaço seguro pra desabafar
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group relative"
            >
              <div className="relative h-full bg-white dark:bg-gray-800 rounded-2xl p-8 sm:p-10 border border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-600 transition-all duration-300 shadow-sm hover:shadow-xl">
                {/* Emoji como ícone decorativo no canto */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="absolute top-6 right-6 text-4xl sm:text-5xl opacity-20 group-hover:opacity-30 transition-opacity"
                >
                  {feature.emoji}
                </motion.div>

                {/* Gradiente de fundo sutil */}
                <div className="absolute inset-0 bg-gradient-to-br from-pink-50/50 via-transparent to-purple-50/50 dark:from-pink-900/10 dark:via-transparent dark:to-purple-900/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Conteúdo */}
                <div className="relative z-10">
                  {/* Badge com emoji pequeno */}
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-pink-50 dark:bg-pink-900/20 rounded-full"
                  >
                    <span className="text-2xl">{feature.emoji}</span>
                    <span className="text-xs font-medium text-pink-600 dark:text-pink-400 uppercase tracking-wide">
                      {index + 1} de {features.length}
                    </span>
                  </motion.div>

                  {/* Título */}
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="text-2xl sm:text-3xl font-light text-gray-900 dark:text-white mb-4 tracking-wide group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors"
                  >
                    {feature.title}
                  </motion.h3>

                  {/* Descrição */}
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                    className="text-base sm:text-lg text-gray-600 dark:text-gray-300 font-light leading-relaxed pr-8"
                  >
                    {feature.description}
                  </motion.p>

                  {/* Linha decorativa na parte inferior */}
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="mt-6 h-0.5 bg-gradient-to-r from-pink-300 via-purple-300 to-pink-300 dark:from-pink-600 dark:via-purple-600 dark:to-pink-600"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

