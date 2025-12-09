'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

interface OnboardingData {
  nickname: string
  preferredName: string
  age: string
  gender: string
  profession: string
  slangLevel: string
  playfulness: string
  formality: string
}

export default function OnboardingClient() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<OnboardingData>({
    nickname: '',
    preferredName: '',
    age: '',
    gender: '',
    profession: '',
    slangLevel: 'moderado',
    playfulness: 'equilibrado',
    formality: 'informal'
  })

  const totalSteps = 4

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        router.push('/home')
      } else {
        console.error('Erro ao salvar onboarding')
      }
    } catch (error) {
      console.error('Erro ao salvar onboarding:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center px-4 transition-colors">
      <div className="max-w-2xl w-full">
        {/* Progress bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400 font-light">
              passo {currentStep} de {totalSteps}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 font-light">
              {Math.round((currentStep / totalSteps) * 100)}%
            </span>
          </div>
          <div className="w-full h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
              className="h-full bg-pink-600"
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Nome/Apelido */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div>
                <h1 className="text-4xl sm:text-5xl font-light text-gray-900 dark:text-white mb-4">
                  como você gostaria de ser chamado?
                </h1>
                <p className="text-base text-gray-500 dark:text-gray-400 font-light">
                  pode ser seu nome, apelido ou como você se sente mais confortável
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-2">
                    nome ou apelido
                  </label>
                  <input
                    type="text"
                    value={data.nickname}
                    onChange={(e) => setData(prev => ({ ...prev, nickname: e.target.value }))}
                    placeholder="ex: giuseppe, giu, joão..."
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:border-pink-600 dark:focus:border-pink-500 font-light text-gray-900 dark:text-white transition-colors"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-2">
                    como prefere que eu te chame?
                  </label>
                  <input
                    type="text"
                    value={data.preferredName}
                    onChange={(e) => setData(prev => ({ ...prev, preferredName: e.target.value }))}
                    placeholder="ex: você, tu, seu nome..."
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:border-pink-600 dark:focus:border-pink-500 font-light text-gray-900 dark:text-white transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleNext}
                  disabled={!data.nickname.trim()}
                  className="px-8 py-3 bg-pink-600 text-white rounded-lg font-light hover:bg-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  type="button"
                >
                  continuar
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Informações Pessoais */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div>
                <h1 className="text-4xl sm:text-5xl font-light text-gray-900 dark:text-white mb-4">
                  conte um pouco sobre você
                </h1>
                <p className="text-base text-gray-500 dark:text-gray-400 font-light">
                  isso ajuda a IA a se comunicar melhor com você
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-2">
                    idade
                  </label>
                  <input
                    type="number"
                    value={data.age}
                    onChange={(e) => setData(prev => ({ ...prev, age: e.target.value }))}
                    placeholder="ex: 25"
                    min="13"
                    max="120"
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:border-pink-600 dark:focus:border-pink-500 font-light text-gray-900 dark:text-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-2">
                    gênero (opcional)
                  </label>
                  <input
                    type="text"
                    value={data.gender}
                    onChange={(e) => setData(prev => ({ ...prev, gender: e.target.value }))}
                    placeholder="ex: masculino, feminino, não-binário, prefiro não dizer..."
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:border-pink-600 dark:focus:border-pink-500 font-light text-gray-900 dark:text-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-2">
                    profissão ou ocupação (opcional)
                  </label>
                  <input
                    type="text"
                    value={data.profession}
                    onChange={(e) => setData(prev => ({ ...prev, profession: e.target.value }))}
                    placeholder="ex: estudante, desenvolvedor, professor..."
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:border-pink-600 dark:focus:border-pink-500 font-light text-gray-900 dark:text-white transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={handleBack}
                  className="px-8 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-light hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer"
                  type="button"
                >
                  voltar
                </button>
                <button
                  onClick={handleNext}
                  disabled={!data.age}
                  className="px-8 py-3 bg-pink-600 text-white rounded-lg font-light hover:bg-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  type="button"
                >
                  continuar
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Tom de Gírias */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div>
                <h1 className="text-4xl sm:text-5xl font-light text-gray-900 dark:text-white mb-4">
                  como você gosta de conversar?
                </h1>
                <p className="text-base text-gray-500 dark:text-gray-400 font-light">
                  escolha o nível de gírias que você prefere
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { value: 'sem_girias', label: 'sem gírias', desc: 'linguagem mais formal e clara' },
                  { value: 'pouco', label: 'poucas gírias', desc: 'algumas expressões casuais' },
                  { value: 'moderado', label: 'moderado', desc: 'equilíbrio entre formal e casual' },
                  { value: 'bastante', label: 'bastante gírias', desc: 'linguagem bem descontraída' },
                  { value: 'muito', label: 'muitas gírias', desc: 'bem informal, tipo papo de amigos' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setData(prev => ({ ...prev, slangLevel: option.value }))}
                    className={`w-full text-left px-6 py-4 rounded-lg border transition-all ${
                      data.slangLevel === option.value
                        ? 'bg-pink-50 dark:bg-pink-900/20 border-pink-600 dark:border-pink-500'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-700'
                    }`}
                    type="button"
                  >
                    <div className="font-light text-gray-900 dark:text-white">{option.label}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 font-light mt-1">{option.desc}</div>
                  </button>
                ))}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={handleBack}
                  className="px-8 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-light hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer"
                  type="button"
                >
                  voltar
                </button>
                <button
                  onClick={handleNext}
                  className="px-8 py-3 bg-pink-600 text-white rounded-lg font-light hover:bg-pink-700 transition-all cursor-pointer"
                  type="button"
                >
                  continuar
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Personalidade da IA */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div>
                <h1 className="text-4xl sm:text-5xl font-light text-gray-900 dark:text-white mb-4">
                  como você quer que eu seja?
                </h1>
                <p className="text-base text-gray-500 dark:text-gray-400 font-light">
                  personalize a personalidade da IA
                </p>
              </div>

              <div className="space-y-6">
                {/* Brincalhona */}
                <div>
                  <label className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-3">
                    nível de brincadeira
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'seria', label: 'séria' },
                      { value: 'equilibrado', label: 'equilibrado' },
                      { value: 'brincalhona', label: 'brincalhona' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setData(prev => ({ ...prev, playfulness: option.value }))}
                        className={`px-4 py-3 rounded-lg border transition-all font-light text-sm ${
                          data.playfulness === option.value
                            ? 'bg-pink-600 text-white border-pink-600'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-700'
                        }`}
                        type="button"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Formalidade */}
                <div>
                  <label className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-3">
                    formalidade
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'formal', label: 'formal' },
                      { value: 'informal', label: 'informal' },
                      { value: 'muito_informal', label: 'bem casual' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setData(prev => ({ ...prev, formality: option.value }))}
                        className={`px-4 py-3 rounded-lg border transition-all font-light text-sm ${
                          data.formality === option.value
                            ? 'bg-pink-600 text-white border-pink-600'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-700'
                        }`}
                        type="button"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={handleBack}
                  className="px-8 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-light hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer"
                  type="button"
                >
                  voltar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="px-8 py-3 bg-pink-600 text-white rounded-lg font-light hover:bg-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  type="button"
                >
                  {isLoading ? 'salvando...' : 'finalizar'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
