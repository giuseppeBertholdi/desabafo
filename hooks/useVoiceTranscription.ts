import { useState, useRef, useCallback, useEffect } from 'react'

interface UseVoiceTranscriptionOptions {
  onTranscriptionComplete?: (text: string) => void
  onInterimResult?: (text: string) => void
  language?: string
}

export function useVoiceTranscription({
  onTranscriptionComplete,
  onInterimResult,
  language = 'pt-BR'
}: UseVoiceTranscriptionOptions = {}) {
  const [isListening, setIsListening] = useState(false)
  const [interimTranscript, setInterimTranscript] = useState('')
  const [finalTranscript, setFinalTranscript] = useState('')
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  // Verificar se Web Speech API está disponível
  const isSupported = typeof window !== 'undefined' && 
    ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)

  const SpeechRecognition = typeof window !== 'undefined' && 
    (window.SpeechRecognition || (window as any).webkitSpeechRecognition)

  const startListening = useCallback(() => {
    if (!isSupported || !SpeechRecognition) {
      console.error('Web Speech API não está disponível neste navegador')
      return false
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = language

      recognition.onstart = () => {
        setIsListening(true)
        setInterimTranscript('')
        setFinalTranscript('')
      }

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = ''
        let final = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            final += transcript + ' '
          } else {
            interim += transcript
          }
        }

        if (interim) {
          setInterimTranscript(interim)
          onInterimResult?.(interim)
        }

        if (final) {
          setFinalTranscript(prev => prev + final)
          setInterimTranscript('')
        }
      }

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Erro no reconhecimento de voz:', event.error)
        setIsListening(false)
        
        if (event.error === 'no-speech') {
          // Silenciosamente reiniciar se não houver fala
          setTimeout(() => {
            if (recognitionRef.current) {
              try {
                recognitionRef.current.start()
              } catch (e) {
                // Ignorar erros de reinício
              }
            }
          }, 1000)
        } else if (event.error === 'not-allowed') {
          alert('Permissão de microfone negada. Por favor, permita o acesso ao microfone nas configurações do navegador.')
        }
      }

      recognition.onend = () => {
        setIsListening(false)
        // Reiniciar automaticamente se ainda deveria estar ouvindo
        if (recognitionRef.current) {
          try {
            recognitionRef.current.start()
          } catch (e) {
            // Ignorar erros de reinício
          }
        }
      }

      recognition.start()
      recognitionRef.current = recognition
      return true
    } catch (error) {
      console.error('Erro ao iniciar reconhecimento de voz:', error)
      return false
    }
  }, [isSupported, SpeechRecognition, language, onInterimResult])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
      setIsListening(false)
      
      // Processar transcrição final
      const completeText = (finalTranscript + interimTranscript).trim()
      if (completeText && onTranscriptionComplete) {
        onTranscriptionComplete(completeText)
      }
      
      setInterimTranscript('')
      setFinalTranscript('')
    }
  }, [finalTranscript, interimTranscript, onTranscriptionComplete])

  const getCurrentTranscript = useCallback(() => {
    return (finalTranscript + ' ' + interimTranscript).trim()
  }, [finalTranscript, interimTranscript])

  // Limpar ao desmontar
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
        recognitionRef.current = null
      }
    }
  }, [])

  return {
    isListening,
    isSupported,
    interimTranscript,
    finalTranscript,
    currentTranscript: getCurrentTranscript(),
    startListening,
    stopListening,
    getCurrentTranscript
  }
}

