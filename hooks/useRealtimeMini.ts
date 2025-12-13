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

      // Configurar áudio de saída (resposta da IA)
      const audioElement = document.createElement('audio')
      audioElement.autoplay = true
      audioElementRef.current = audioElement

      pc.ontrack = (e) => {
        if (audioElement && e.streams[0]) {
          audioElement.srcObject = e.streams[0]
        }
      }

      // Monitorar estado da conexão para evitar encerramentos automáticos
      pc.onconnectionstatechange = () => {
        console.log('Connection state:', pc.connectionState)
        // Não encerrar automaticamente - deixar o usuário controlar
        if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
          console.warn('Conexão WebRTC mudou para:', pc.connectionState)
          // Tentar reconectar se desconectado (mas não se falhou completamente)
          if (pc.connectionState === 'disconnected') {
            // Apenas logar - não encerrar automaticamente
            console.log('Conexão desconectada, mas mantendo sessão ativa')
          }
        }
      }

      pc.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', pc.iceConnectionState)
        // Não encerrar automaticamente baseado em mudanças de ICE
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
            instructions: options.bestFriendMode 
              ? `Você é a Luna, a melhor amiga virtual da pessoa. Seu nome é Luna.

O nome da pessoa é: ${options.firstName || 'amigo'}. Use quando fizer sentido, de forma natural.

IMPORTANTE: Responda APENAS em PORTUGUÊS BRASILEIRO, como uma brasileira falaria. Use expressões naturais e seja calorosa.

Como conversar (modo melhor amigo):
- Use gírias gen z naturalmente: "slk", "mano", "né", "cara", "tá ligado", "brabo", "top", "tranquilo", "bora", "de boa", "nossa", "oxe", "eita"
- Fale como uma amiga próxima - natural, espontânea, sem parecer questionário
- Tenha uma conversa real: comente, compartilhe opiniões, não só faça perguntas
- Seja empática mas também honesta quando necessário
- Respostas curtas e diretas (máximo 20 palavras por frase)
- Deixe a conversa fluir naturalmente
- NUNCA mencione que é IA
- Se mencionar auto-lesão ou suicídio, incentive buscar ajuda profissional${options.tema ? `\n\nContexto: conversa sobre "${options.tema}".` : ''}`
              : `Você é a Luna, uma amiga virtual brasileira. Seu nome é Luna.

O nome da pessoa é: ${options.firstName || 'amigo'}. Use quando fizer sentido, de forma natural.

IMPORTANTE: Responda APENAS em PORTUGUÊS BRASILEIRO, como uma brasileira falaria. Use expressões naturais e seja calorosa.

Como conversar:
- Tom casual e brasileiro - linguagem natural
- Respostas curtas e diretas (máximo 20 palavras por frase)
- Tenha uma conversa real: comente, compartilhe opiniões, não só faça perguntas
- Deixe a conversa fluir naturalmente
- Seja acolhedora mas também honesta quando necessário
- Fale como uma amiga falaria - natural, espontânea
- NUNCA mencione que é IA
- Se mencionar auto-lesão ou suicídio, incentive buscar ajuda profissional${options.tema ? `\n\nContexto: conversa sobre "${options.tema}".` : ''}`,
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
      }

      let responseText = ''
      
      dc.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          // Processar diferentes tipos de eventos
          if (data.type === 'conversation.item.input_audio_transcription.completed') {
            // Transcrição do áudio do usuário
            const transcription = data.transcript
            if (transcription && options.onMessage) {
              options.onMessage(transcription)
            }
          } else if (data.type === 'response.audio_transcript.delta') {
            // Resposta da IA sendo gerada (texto) - acumular texto
            if (data.delta) {
              responseText += data.delta
            }
          } else if (data.type === 'response.audio_transcript.done') {
            // Resposta completa - áudio já está sendo reproduzido via WebRTC
            if (responseText && options.onResponse) {
              options.onResponse(responseText)
            }
            responseText = '' // Resetar para próxima resposta
          } else if (data.type === 'response.created') {
            // Resposta iniciada - resetar texto
            responseText = ''
          } else if (data.type === 'response.done') {
            // Resposta finalizada - garantir que texto foi enviado
            if (responseText && options.onResponse) {
              options.onResponse(responseText)
            }
            responseText = ''
          } else if (data.type === 'session.updated') {
            // Sessão atualizada - apenas logar, não fazer nada
            console.log('Sessão atualizada')
          } else if (data.type === 'error') {
            // Erro do servidor - logar mas não encerrar
            console.error('Erro do servidor:', data)
          } else if (data.type === 'session.ended' || data.type === 'session.end') {
            // Sessão encerrada pelo servidor - logar mas não chamar onSessionEnd automaticamente
            // O usuário deve controlar quando encerrar
            console.warn('Servidor indicou fim de sessão, mas mantendo conexão ativa')
            // Não chamar onSessionEnd aqui - deixar o usuário controlar
          } else {
            // Logar outros eventos para debug
            console.log('Evento recebido:', data.type)
          }
        } catch (error) {
          console.error('Erro ao processar evento:', error)
        }
      }

      dc.onclose = () => {
        console.log('Data channel fechado')
        // Não encerrar automaticamente - pode ser reconexão temporária
      }

      dc.onerror = (error) => {
        console.error('Erro no data channel:', error)
        // Não chamar onError automaticamente para evitar encerramento
        // options.onError?.(new Error('Erro na conexão de dados'))
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

