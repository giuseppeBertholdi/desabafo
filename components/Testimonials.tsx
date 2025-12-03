'use client'

import { motion } from 'framer-motion'

export default function Testimonials() {
  const testimonials = [
    {
      name: 'maria',
      age: '22',
      content: 'o chat por voz mudou tudo pra mim. consigo desabafar sem precisar escrever, e é totalmente privado. a IA realmente me entende e faz conexões que eu nem tinha percebido 🤯',
      rating: 5,
    },
    {
      name: 'joão',
      age: '28',
      content: 'uso todo dia antes de dormir. os insights me ajudam a entender meus padrões e o journal é perfeito pra registrar o que sinto. é tipo um diário que conversa de volta',
      rating: 5,
    },
    {
      name: 'ana',
      age: '25',
      content: 'não substitui terapia, mas me ajuda muito entre as sessões. o modo melhor amigo é incrível - parece que estou falando com alguém que realmente se importa. nas madrugadas de ansiedade é um salva-vidas 💜',
      rating: 5,
    },
  ]

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-pink-50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-light text-gray-900 dark:text-white mb-4 tracking-wide">
            quem usa, aprova
          </h2>
          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-light">
            histórias reais de quem já desabafou
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              whileHover={{ y: -8, scale: 1.03 }}
              className="bg-pink-50 dark:bg-gray-800 rounded-xl p-6 border border-pink-100 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-600 hover:shadow-lg transition-all duration-300"
            >
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.2 + 0.3 }}
                className="flex items-center mb-4"
              >
                {[...Array(testimonial.rating)].map((_, i) => (
                  <motion.svg
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.2, delay: index * 0.2 + 0.4 + i * 0.1 }}
                    className="h-5 w-5 text-pink-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </motion.svg>
                ))}
              </motion.div>
            <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed font-light text-base">
              &ldquo;{testimonial.content}&rdquo;
            </p>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{testimonial.name}, {testimonial.age}</p>
            </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

