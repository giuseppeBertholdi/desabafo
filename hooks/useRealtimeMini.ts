/**
 * Hook para gerenciar sessão WebRTC com OpenAI Realtime Mini
 * Baseado no exemplo da pasta "funciona"
 */

import { useState, useRef, useEffect, useCallback } from 'react'

interface RealtimeSession {
  isActive: boolean
  peerConnection: RTCPeerConnection | null
  dataChannel: RTCDataChannel | null
  audioElement: HTMLAudioElement | null
}

interface UseRealtimeMiniOptions {
  onMessage?: (message: string) => void
  onResponse?: (response: string) => void
  onMessageDelta?: (delta: string, fullText: string) => void // Para transcrição em tempo real
  onResponseDelta?: (delta: string, fullText: string) => void // Para resposta em tempo real
  onError?: (error: Error) => void
  onSessionStart?: () => void
  onSessionEnd?: () => void
  firstName?: string
  tema?: string
  bestFriendMode?: boolean
}

export function useRealtimeMini(options: UseRealtimeMiniOptions = {}) {
  const [session, setSession] = useState<RealtimeSession>({
    isActive: false,
    peerConnection: null,
    dataChannel: null,
    audioElement: null,
  })
  const [isConnecting, setIsConnecting] = useState(false)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const dataChannelRef = useRef<RTCDataChannel | null>(null)

  // Limpar recursos ao desmontar
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [])

  const cleanup = useCallback(() => {
    if (dataChannelRef.current) {
      dataChannelRef.current.close()
      dataChannelRef.current = null
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.getSenders().forEach((sender) => {
        if (sender.track) {
          sender.track.stop()
        }
      })
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }

    if (audioElementRef.current) {
      audioElementRef.current.pause()
      audioElementRef.current = null
    }

    setSession({
      isActive: false,
      peerConnection: null,
      dataChannel: null,
      audioElement: null,
    })
  }, [])

  const startSession = useCallback(async () => {
    if (isConnecting || session.isActive) return

    setIsConnecting(true)

    try {
      // Obter token efêmero
      const tokenResponse = await fetch('/api/realtime/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!tokenResponse.ok) {
        const error = await tokenResponse.json()
        throw new Error(error.error || 'Erro ao obter token')
      }

      const { token } = await tokenResponse.json()

      // Criar peer connection
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      })

      // Manter conexão ativa - monitorar estado
      pc.onconnectionstatechange = () => {
        console.log('Connection state:', pc.connectionState)
        // Não encerrar automaticamente - deixar o usuário decidir quando parar
        if (pc.connectionState === 'failed') {
          console.warn('Conexão falhou, mas mantendo sessão ativa')
        }
      }

      // Monitorar ICE connection
      pc.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', pc.iceConnectionState)
      }

      // Configurar áudio de saída (resposta da IA)
      const audioElement = document.createElement('audio')
      audioElement.autoplay = true
      audioElementRef.current = audioElement

      pc.ontrack = (e) => {
        if (audioElement && e.streams[0]) {
          audioElement.srcObject = e.streams[0]
        }
      }

      // Adicionar áudio do microfone
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      mediaStream.getTracks().forEach((track) => {
        pc.addTrack(track, mediaStream)
      })

      // Criar data channel para eventos
      const dc = pc.createDataChannel('oai-events', {
        ordered: true,
      })

      dataChannelRef.current = dc

      // Configurar listeners do data channel
      dc.onopen = () => {
        // Enviar instruções do sistema após a conexão estar estabelecida
        // IMPORTANTE: Instruções em inglês para o modelo entender, mas forçando português nas respostas
        const systemInstructions = {
          type: 'session.update',
          session: {
            instructions: `Você é a Luna, uma psicóloga brasileira natural e acolhedora. Seu nome é Luna e você conversa de forma genuína e empática.

O nome da pessoa é: ${options.firstName || 'amigo'}. Use esse nome naturalmente na conversa.

IMPORTANTE: Responda APENAS em PORTUGUÊS BRASILEIRO, de forma natural e calorosa.

Como conversar:
- Seja natural, como uma psicóloga conversaria com um paciente
- Ouça atentamente e responda com empatia
- Faça perguntas quando apropriado, mas deixe a conversa fluir
- Seja acolhedora e genuína
- Respostas curtas e diretas (máximo 2-3 frases)
- Não mencione que é IA
- Se mencionarem auto-lesão ou suicídio, incentive buscar ajuda profissional${options.tema ? `\n\nA pessoa quer conversar sobre "${options.tema}".` : ''}`,
            temperature: 0.8,
            max_response_output_tokens: 512,
          },
        }
        
        try {
          dc.send(JSON.stringify(systemInstructions))
        } catch (err) {
          console.error('Erro ao enviar instruções:', err)
        }
        
        setSession({
          isActive: true,
          peerConnection: pc,
          dataChannel: dc,
          audioElement: audioElement,
        })
        setIsConnecting(false)
        options.onSessionStart?.()
        
        // Solicitar transcrições automáticas
        try {
          const enableTranscription = {
            type: 'session.update',
            session: {
              modalities: ['text', 'audio'],
              input_audio_transcription: {
                model: 'whisper-1'
              },
              output_audio_transcription: {
                model: 'whisper-1'
              }
            }
          }
          dc.send(JSON.stringify(enableTranscription))
          console.log('Transcrições habilitadas')
        } catch (err) {
          console.error('Erro ao habilitar transcrições:', err)
        }
      }

      let responseText = ''
      let userTranscriptionText = '' // Para acumular transcrição do usuário em tempo real
      
      dc.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          // Debug: log de todos os eventos para identificar o formato correto
          console.log('Realtime event:', data.type, data)
          
          // Processar diferentes tipos de eventos de transcrição
          // OpenAI Realtime pode usar diferentes formatos
          if (data.type === 'conversation.item.input_audio_transcription.completed') {
            // Transcrição completa do áudio do usuário
            const transcription = data.transcript || data.item?.transcript || data.transcription || data.item?.input_audio_transcription?.transcript
            console.log('Transcrição completa recebida:', transcription)
            if (transcription && transcription.trim()) {
              userTranscriptionText = transcription.trim()
              if (options.onMessage) {
                options.onMessage(userTranscriptionText)
              }
              userTranscriptionText = '' // Resetar
            }
          } else if (data.type === 'conversation.item.input_audio_transcription.delta') {
            // Transcrição parcial do usuário (em tempo real) - como Calm.so
            const delta = data.delta || data.transcript_delta || data.item?.input_audio_transcription?.delta
            if (delta) {
              userTranscriptionText += delta
              console.log('Transcrição delta (usuário):', delta, 'Texto completo:', userTranscriptionText)
              if (options.onMessageDelta) {
                options.onMessageDelta(delta, userTranscriptionText)
              }
            }
          } else if (data.type === 'response.audio_transcript.delta') {
            // Resposta da IA sendo gerada (texto) - acumular texto em tempo real
            const delta = data.delta || data.text || data.transcript_delta
            if (delta) {
              responseText += delta
              console.log('Resposta delta (IA):', delta, 'Texto completo:', responseText)
              if (options.onResponseDelta) {
                options.onResponseDelta(delta, responseText)
              }
            }
          } else if (data.type === 'response.audio_transcript.done') {
            // Resposta completa - áudio já está sendo reproduzido via WebRTC
            const finalText = data.transcript || responseText
            console.log('Resposta completa (IA):', finalText)
            if (finalText && finalText.trim()) {
              if (options.onResponse) {
                options.onResponse(finalText.trim())
              }
            }
            responseText = '' // Resetar para próxima resposta
          } else if (data.type === 'response.created') {
            // Resposta iniciada - resetar texto
            responseText = ''
            console.log('Resposta iniciada')
          } else if (data.type === 'response.done') {
            // Resposta finalizada - garantir que texto foi enviado
            if (responseText && responseText.trim()) {
              console.log('Resposta final (IA):', responseText)
              if (options.onResponse) {
                options.onResponse(responseText.trim())
              }
            }
            responseText = ''
          } else if (data.type === 'response.output_item.done') {
            // Item de saída completo
            const transcript = data.item?.transcript || data.item?.transcription
            if (transcript && transcript.trim()) {
              console.log('Resposta via output_item (IA):', transcript)
              if (options.onResponse) {
                options.onResponse(transcript.trim())
              }
            }
          } else if (data.type === 'conversation.item.created') {
            // Novo item de conversa criado
            if (data.item?.type === 'message' && data.item?.role === 'user') {
              userTranscriptionText = '' // Resetar transcrição do usuário
            }
          }
        } catch (error) {
          console.error('Erro ao processar evento:', error, event.data)
        }
      }

      dc.onerror = (error) => {
        console.error('Erro no data channel:', error)
        options.onError?.(new Error('Erro na conexão de dados'))
      }

      // Criar oferta SDP
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      // Enviar SDP para OpenAI e obter resposta
      const baseUrl = 'https://api.openai.com/v1/realtime/calls'
      const model = 'gpt-realtime-mini'
      
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: 'POST',
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/sdp',
        },
      })

      if (!sdpResponse.ok) {
        const errorText = await sdpResponse.text()
        throw new Error(`Erro ao conectar: ${errorText}`)
      }

      const answerSdp = await sdpResponse.text()
      const answer: RTCSessionDescriptionInit = { type: 'answer' as RTCSdpType, sdp: answerSdp }
      await pc.setRemoteDescription(answer)

      peerConnectionRef.current = pc
    } catch (error: any) {
      console.error('Erro ao iniciar sessão:', error)
      setIsConnecting(false)
      options.onError?.(error)
      cleanup()
    }
  }, [isConnecting, session.isActive, options, cleanup])

  const stopSession = useCallback(() => {
    cleanup()
    options.onSessionEnd?.()
  }, [cleanup, options])

  const sendTextMessage = useCallback((text: string) => {
    if (!dataChannelRef.current || dataChannelRef.current.readyState !== 'open') {
      console.error('Data channel não está aberto')
      return
    }

    const event = {
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: text,
          },
        ],
      },
    }

    dataChannelRef.current.send(JSON.stringify(event))
    
    // Solicitar resposta
    const responseEvent = { type: 'response.create' }
    dataChannelRef.current.send(JSON.stringify(responseEvent))
  }, [])

  return {
    isActive: session.isActive,
    isConnecting,
    startSession,
    stopSession,
    sendTextMessage,
    peerConnection: session.peerConnection,
    dataChannel: session.dataChannel,
  }
}

