'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

interface OnboardingData {
  nickname: string
  preferredName: string
  interests: string[]
  currentState: string
  whatLookingFor: string
}

export default function OnboardingClient() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<OnboardingData>({
    nickname: '',
    preferredName: '',
    interests: [],
    currentState: '',
    whatLookingFor: ''
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

  const interests = [
    'ansiedade',
    'relacionamentos',
    'trabalho',
    'tristeza',
    'dúvidas',
    'conquistas',
    'sono',
    'estudos',
    'família',
    'motivação',
    'raiva',
    'calma',
    'objetivos',
    'amizade',
    'crescimento pessoal'
  ]

  const toggleInterest = (interest: string) => {
    if (interest === 'todos') {
      // Se clicar em "todos", seleciona ou deseleciona todos
      if (data.interests.length === interests.length) {
        setData(prev => ({ ...prev, interests: [] }))
      } else {
        setData(prev => ({ ...prev, interests: [...interests] }))
      }
    } else {
      const newInterests = data.interests.includes(interest)
        ? data.interests.filter(i => i !== interest)
        : [...data.interests, interest]
      
      setData(prev => ({
        ...prev,
        interests: newInterests
      }))
    }
  }
  
  // Verificar se todos estão selecionados
  const allSelected = data.interests.length === interests.length && interests.length > 0

  const currentStates = [
    'me sinto bem, só quero conversar',
    'estou passando por um momento difícil',
    'preciso de um espaço para desabafar',
    'quero entender melhor meus sentimentos',
    'estou buscando autoconhecimento',
    'preciso de apoio emocional'
  ]

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Progress bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 font-light">
              passo {currentStep} de {totalSteps}
            </span>
            <span className="text-sm text-gray-500 font-light">
              {Math.round((currentStep / totalSteps) * 100)}%
            </span>
          </div>
          <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
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
                <h1 className="text-4xl sm:text-5xl font-light text-gray-900 mb-4">
                  como você gostaria de ser chamado?
                </h1>
                <p className="text-base text-gray-500 font-light">
                  pode ser seu nome, apelido ou como você se sente mais confortável
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-light text-gray-700 mb-2">
                    nome ou apelido
                  </label>
                  <input
                    type="text"
                    value={data.nickname}
                    onChange={(e) => setData(prev => ({ ...prev, nickname: e.target.value }))}
                    placeholder="ex: giuseppe, giu, joão..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-pink-600 font-light text-gray-900"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-light text-gray-700 mb-2">
                    como prefere que eu te chame?
                  </label>
                  <input
                    type="text"
                    value={data.preferredName}
                    onChange={(e) => setData(prev => ({ ...prev, preferredName: e.target.value }))}
                    placeholder="ex: você, tu, seu nome..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-pink-600 font-light text-gray-900"
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

          {/* Step 2: Preferências/Interesses */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div>
                <h1 className="text-4xl sm:text-5xl font-light text-gray-900 mb-4">
                  sobre o que você gostaria de conversar?
                </h1>
                <p className="text-base text-gray-500 font-light">
                  selecione os temas que mais te interessam (pode escolher quantos quiser)
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* Botão "todos" primeiro */}
                <button
                  onClick={() => toggleInterest('todos')}
                  className={`px-4 py-3 rounded-lg border transition-all font-light text-sm cursor-pointer col-span-2 sm:col-span-1 ${
                    allSelected
                      ? 'bg-pink-600 text-white border-pink-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-pink-300'
                  }`}
                  type="button"
                >
                  todos
                </button>
                {interests.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`px-4 py-3 rounded-lg border transition-all font-light text-sm cursor-pointer ${
                      data.interests.includes(interest)
                        ? 'bg-pink-600 text-white border-pink-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-pink-300'
                    }`}
                    type="button"
                  >
                    {interest}
                  </button>
                ))}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={handleBack}
                  className="px-8 py-3 border border-gray-200 text-gray-700 rounded-lg font-light hover:bg-gray-50 transition-all cursor-pointer"
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

          {/* Step 3: Como está atualmente */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div>
                <h1 className="text-4xl sm:text-5xl font-light text-gray-900 mb-4">
                  como você está se sentindo agora?
                </h1>
                <p className="text-base text-gray-500 font-light">
                  escolha a opção que melhor descreve seu momento atual
                </p>
              </div>

              <div className="space-y-3">
                {currentStates.map((state) => (
                  <button
                    key={state}
                    onClick={() => setData(prev => ({ ...prev, currentState: state }))}
                    className={`w-full text-left px-6 py-4 rounded-lg border transition-all font-light ${
                      data.currentState === state
                        ? 'bg-pink-50 border-pink-600 text-gray-900'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-pink-300'
                    }`}
                    type="button"
                  >
                    {state}
                  </button>
                ))}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={handleBack}
                  className="px-8 py-3 border border-gray-200 text-gray-700 rounded-lg font-light hover:bg-gray-50 transition-all cursor-pointer"
                  type="button"
                >
                  voltar
                </button>
                <button
                  onClick={handleNext}
                  disabled={!data.currentState}
                  className="px-8 py-3 bg-pink-600 text-white rounded-lg font-light hover:bg-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  type="button"
                >
                  continuar
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: O que está buscando */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div>
                <h1 className="text-4xl sm:text-5xl font-light text-gray-900 mb-4">
                  o que você está buscando aqui?
                </h1>
                <p className="text-base text-gray-500 font-light">
                  conte um pouco sobre o que você espera encontrar no desabafo
                </p>
              </div>

              <div>
                <textarea
                  value={data.whatLookingFor}
                  onChange={(e) => setData(prev => ({ ...prev, whatLookingFor: e.target.value }))}
                  placeholder="ex: um espaço seguro para expressar meus sentimentos, alguém que me ouça sem julgamentos..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-pink-600 font-light text-gray-900 resize-none"
                />
              </div>

              <div className="flex justify-between">
                <button
                  onClick={handleBack}
                  className="px-8 py-3 border border-gray-200 text-gray-700 rounded-lg font-light hover:bg-gray-50 transition-all cursor-pointer"
                  type="button"
                >
                  voltar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !data.whatLookingFor.trim()}
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

