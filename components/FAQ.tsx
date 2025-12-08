'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      question: 'o desabafo.io substitui terapia profissional?',
      answer: 'não. o desabafo.io não é uma ferramenta médica e não substitui terapia profissional ou tratamento médico. é uma companheira de IA pra autoconhecimento e exploração pessoal. se você estiver enfrentando uma emergência médica ou de saúde mental, procure ajuda profissional imediatamente.',
    },
    {
      question: 'como funciona a privacidade das minhas conversas?',
      answer: 'todas as suas conversas de texto são criptografadas e armazenadas de forma segura. o chat por voz é totalmente privado e não fica salvo - nada é armazenado. seus dados são privados e não compartilhamos suas informações com terceiros. você pode deletar suas conversas a qualquer momento.',
    },
    {
      question: 'preciso pagar pra usar o desabafo.io?',
      answer: 'oferecemos um plano gratuito com chat limitado, sem insights e sem modo de voz. pra conversas ilimitadas, chat por voz, insights personalizados e todos os recursos, temos o plano pro. você pode cancelar a qualquer momento.',
    },
    {
      question: 'a IA realmente aprende comigo?',
      answer: 'sim! o desabafo.io lembra do que você compartilha ao longo do tempo, ajudando a identificar padrões e temas. quanto mais você conversa, melhor a IA entende suas necessidades e oferece insights mais personalizados.',
    },
    {
      question: 'posso usar o desabafo.io em qualquer momento?',
      answer: 'sim! o desabafo.io está disponível 24/7. não há horários de funcionamento ou agendamentos necessários. acesse quando precisar, mesmo às 3h da manhã.',
    },
    {
      question: 'como cancelo minha assinatura?',
      answer: 'você pode cancelar sua assinatura a qualquer momento nas configurações da sua conta. não há taxas de cancelamento e você continuará tendo acesso até o final do período pago.',
    },
    {
      question: 'como funciona o chat por voz?',
      answer: 'o chat por voz (disponível no plano pro) permite que você fale naturalmente com a IA. é totalmente privado - nada fica salvo. perfeito pra desabafar sem precisar escrever. funciona em tempo real, como uma conversa real.',
    },
    {
      question: 'o desabafo.io funciona em dispositivos móveis?',
      answer: 'sim! o desabafo.io é totalmente responsivo e funciona perfeitamente em smartphones, tablets e computadores. estamos trabalhando em apps nativos pra iOS e Android.',
    },
    {
      question: 'meus dados são usados pra treinar a IA?',
      answer: 'seus dados são usados apenas pra melhorar sua experiência pessoal. não usamos suas conversas pra treinar modelos gerais sem seu consentimento explícito. sua privacidade é nossa prioridade.',
    },
  ]

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-pink-50 dark:bg-gray-900 transition-colors" id="faq">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-light text-gray-900 dark:text-white mb-4 tracking-wide">
            dúvidas? 🤔
          </h2>
          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-light">
            respostas diretas pras perguntas mais comuns
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-gray-800 rounded-lg border border-pink-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <motion.button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                whileHover={{ backgroundColor: 'rgba(251, 207, 232, 0.3)' }}
                className="w-full px-6 py-5 text-left flex items-center justify-between"
              >
                <span className="font-medium text-gray-900 dark:text-white pr-8">{faq.question}</span>
                <motion.svg
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="h-5 w-5 text-pink-500 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </motion.svg>
              </motion.button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5">
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-600 dark:text-gray-300 mb-4">Ainda tem dúvidas?</p>
          <motion.a
            href="#contato"
            whileHover={{ scale: 1.05 }}
            className="text-pink-600 hover:text-pink-700 font-medium inline-block"
          >
            Entre em contato conosco
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}

