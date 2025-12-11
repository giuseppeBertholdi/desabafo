'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MarkdownRenderer from './MarkdownRenderer'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isTranscribing?: boolean
  isEmergency?: boolean
}

interface VoiceChatProps {
  onSendMessage: (transcription: string) => Promise<void>
  messages: Message[]
  isLoading: boolean
  firstName: string
}

export default function VoiceChat({ onSendMessage, messages, isLoading, firstName }: VoiceChatProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [currentTranscription, setCurrentTranscription] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll para o final quando novas mensagens chegarem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, currentTranscription])

  // Limpar recursos ao desmontar
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  // Iniciar gravação
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000
        } 
      })
      
      streamRef.current = stream
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = async () => {
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
          await transcribeAndSend(audioBlob)
        }
        audioChunksRef.current = []
      }
      
      mediaRecorder.start(1000) // Coletar dados a cada 1 segundo
      setIsRecording(true)
      setCurrentTranscription('')
    } catch (error) {
      console.error('Erro ao acessar microfone:', error)
      alert('Não foi possível acessar o microfone. Verifique as permissões.')
    }
  }

  // Parar gravação
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      // Parar todas as tracks do stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
    }
  }

  // Transcrever e enviar
  const transcribeAndSend = async (audioBlob: Blob) => {
    setIsTranscribing(true)
    
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      
      const response = await fetch('/api/voice/stream-transcribe', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      
      if (data.transcription && data.transcription.trim()) {
        setCurrentTranscription('')
        await onSendMessage(data.transcription.trim())
      } else {
        alert('Não foi possível transcrever o áudio. Tente falar novamente.')
      }
    } catch (error) {
      console.error('Erro ao transcrever:', error)
      alert('Erro ao processar o áudio. Tente novamente.')
    } finally {
      setIsTranscribing(false)
    }
  }

  // Reproduzir resposta da IA em áudio
  const playAudioResponse = useCallback(async (text: string) => {
    if (!text || text.trim().length === 0) return
    
    try {
      setIsPlaying(true)
      
      const response = await fetch('/api/voice/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      
      if (!response.ok) {
        throw new Error('Erro ao sintetizar áudio')
      }
      
      const data = await response.json()
      const audioBytes = Uint8Array.from(atob(data.audio), c => c.charCodeAt(0))
      const audioBlob = new Blob([audioBytes], { type: 'audio/mp3' })
      const audioUrl = URL.createObjectURL(audioBlob)
      
      if (!audioRef.current) {
        audioRef.current = new Audio()
      }
      
      audioRef.current.src = audioUrl
      audioRef.current.play()
      
      audioRef.current.onended = () => {
        setIsPlaying(false)
        URL.revokeObjectURL(audioUrl)
      }
      
      audioRef.current.onerror = () => {
        setIsPlaying(false)
        URL.revokeObjectURL(audioUrl)
      }
    } catch (error) {
      console.error('Erro ao reproduzir áudio:', error)
      setIsPlaying(false)
    }
  }, [])

  // Reproduzir última resposta da IA quando chegar
  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage && lastMessage.role === 'assistant' && !isLoading) {
      playAudioResponse(lastMessage.content)
    }
  }, [messages, isLoading, playAudioResponse])

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header minimalista - estilo calmi.so */}
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-light text-gray-900 dark:text-white tracking-wide">
              conversa por voz
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-light">
              tudo que você fala é transcrito automaticamente
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            sair
          </button>
        </div>
      </div>

      {/* Área de mensagens - estilo calmi.so */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-8 space-y-6 bg-gradient-to-b from-transparent via-slate-50/30 to-slate-50/50 dark:via-slate-900/20 dark:to-slate-900/40">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex items-start gap-3 ${
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                message.role === 'assistant' 
                  ? 'bg-gradient-to-br from-pink-400 to-pink-600' 
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}>
                {message.role === 'assistant' ? (
                  <span className="text-white text-sm">💜</span>
                ) : (
                  <span className="text-gray-600 dark:text-gray-300 text-xs">você</span>
                )}
              </div>

              {/* Mensagem - estilo calmi.so */}
              <div className={`flex-1 min-w-0 ${
                message.role === 'user' ? 'text-right' : 'text-left'
              }`}>
                <div className={`inline-block px-5 py-3 rounded-3xl shadow-sm ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-pink-500 to-pink-600 text-white shadow-pink-500/20'
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-700 shadow-gray-200/50 dark:shadow-gray-900/50'
                }`}>
                  {message.isTranscribing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
                      <span className="text-sm text-gray-500">transcrevendo...</span>
                    </div>
                  ) : (
                    <MarkdownRenderer 
                      content={message.content}
                      className="text-sm leading-relaxed font-light"
                    />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Transcrição atual enquanto grava */}
        {currentTranscription && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 flex-row-reverse"
          >
            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0 flex items-center justify-center">
              <span className="text-gray-600 dark:text-gray-300 text-xs">você</span>
            </div>
            <div className="flex-1 text-right">
              <div className="inline-block px-4 py-2 rounded-2xl bg-pink-500/50 text-white">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-sm">{currentTranscription}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading da IA */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex-shrink-0 flex items-center justify-center">
              <span className="text-white text-sm">💜</span>
            </div>
            <div className="flex-1">
              <div className="inline-block px-4 py-2 rounded-2xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">pensando...</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Transcrevendo */}
        {isTranscribing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-3 flex-row-reverse"
          >
            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0 flex items-center justify-center">
              <span className="text-gray-600 dark:text-gray-300 text-xs">você</span>
            </div>
            <div className="flex-1 text-right">
              <div className="inline-block px-4 py-2 rounded-2xl bg-pink-500/50 text-white">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-sm">transcrevendo sua mensagem...</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Controles de voz - estilo calmi.so */}
      <div className="px-4 sm:px-6 py-8 border-t border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-6">
          {/* Botão principal de gravação - estilo calmi.so */}
          <motion.button
            whileHover={!(isTranscribing || isLoading) ? { scale: 1.05 } : {}}
            whileTap={!(isTranscribing || isLoading) ? { scale: 0.95 } : {}}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isTranscribing || isLoading}
            className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center transition-all ${
              isRecording
                ? 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-xl shadow-red-500/40'
                : 'bg-gradient-to-br from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 shadow-xl shadow-pink-500/40'
            } ${isTranscribing || isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {/* Anel pulsante quando gravando */}
            {isRecording && (
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full border-2 border-red-400"
              />
            )}
            
            {isRecording ? (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-10 h-10 bg-white rounded-lg"
              />
            ) : (
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            )}
          </motion.button>

          {/* Status - estilo calmi.so */}
          <div className="text-center space-y-2">
            {isRecording && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-1"
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <p className="text-sm text-red-500 font-light tracking-wide">
                    gravando... toque para parar
                  </p>
                </div>
              </motion.div>
            )}
            {isTranscribing && (
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" />
                <p className="text-sm text-gray-500 dark:text-gray-400 font-light">
                  transcrevendo sua mensagem...
                </p>
              </div>
            )}
            {isLoading && (
              <div className="flex items-center justify-center gap-2">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-light">
                  {firstName} está pensando...
                </p>
              </div>
            )}
            {isPlaying && (
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                <p className="text-sm text-gray-500 dark:text-gray-400 font-light">
                  reproduzindo resposta...
                </p>
              </div>
            )}
            {!isRecording && !isTranscribing && !isLoading && !isPlaying && (
              <p className="text-sm text-gray-400 dark:text-gray-500 font-light tracking-wide">
                toque para começar a falar
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

