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
      emoji: '🔒',
      title: '100% privado e seguro',
      description: 'suas conversas são criptografadas e privadas. o chat por voz não fica salvo. você pode deletar tudo a qualquer momento. seus dados são só seus.',
      imageSide: 'left',
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
              {/* Espaço para imagem */}
              <div className="w-full lg:w-1/2">
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-pink-100 to-purple-100 aspect-video flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                      imagem em breve
                    </p>
                    <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                      {feature.title}
                    </p>
                  </div>
                  {/* Quando tiver a imagem, substitua por:
                  <img 
                    src="/path/to/image.jpg" 
                    alt={feature.title}
                    className="w-full h-full object-cover"
                  />
                  */}
                </div>
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

