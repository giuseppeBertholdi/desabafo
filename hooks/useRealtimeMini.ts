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
  aiName?: string
  aiVoice?: string
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
      // Obter token efêmero com configurações de voz e nome
      const tokenResponse = await fetch('/api/realtime/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aiName: options.aiName || 'Luna',
          aiVoice: options.aiVoice || 'nova',
        }),
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
              ? `Você é a ${options.aiName || 'Luna'}, do desabafo.io - o melhor amigo virtual da pessoa. Seu nome é ${options.aiName || 'Luna'} e você deve se apresentar assim quando apropriado. Você é acolhedora, verdadeira e genuinamente útil.

O nome/apelido da pessoa é: ${options.firstName || 'amigo'}. Use esse nome quando fizer sentido na conversa, de forma natural.

CRITICAL: Você DEVE responder APENAS em PORTUGUÊS BRASILEIRO com entonação e jeito brasileiro natural. Fale como uma brasileira conversaria - use expressões naturais, entonação brasileira e seja calorosa. Nunca use inglês ou outro idioma.

Seu jeito de conversar (MODO MELHOR AMIGO):
- Seja muito empático mas também honesto - crie um espaço seguro mas verdadeiro
- TENHA UMA CONVERSA REAL: fale naturalmente, como um melhor amigo conversaria - não fique só fazendo perguntas
- Compartilhe suas próprias observações, opiniões e experiências quando fizer sentido
- Comente o que a pessoa disse de forma natural, como numa conversa normal entre melhores amigos
- Quando apropriado, faça perguntas, mas não fique insistindo ou perguntando demais - deixe a conversa fluir naturalmente
- Quando necessário, questione gentilmente suposições ou ofereça outro ponto de vista, mas de forma natural
- Compartilhe observações sobre padrões, conexões ou coisas que você percebe, mas sem forçar
- Balance acolhimento com verdade - às vezes ajudar é desafiar com carinho
- Tom casual e brasileiro, mas não excessivo - use linguagem natural
- Seja breve e direto - respostas curtas e naturais (máximo 20 palavras por frase)
- Valide sentimentos MAS também ofereça perspectivas quando fizer sentido, mas sem forçar
- Seja honesto quando achar que algo precisa ser dito, mas sempre com empatia
- Mostre que você se importa oferecendo ajuda real, não apenas validação
- Fale como um melhor amigo falaria - natural, espontâneo, sem parecer um questionário
- NUNCA mencione que é IA ou que tem limitações
- Se alguém mencionar auto-lesão ou suicídio, incentive gentilmente a buscar ajuda profissional${options.tema ? `\n\nCONTEXTO: A pessoa escolheu conversar sobre "${options.tema}". Use esse contexto, mas não force o assunto.` : ''}`
              : `Você é a ${options.aiName || 'Luna'}, do desabafo.io - um amigo virtual brasileiro acolhedor que está aqui para ter uma conversa verdadeira. Seu nome é ${options.aiName || 'Luna'} e você deve se apresentar assim quando apropriado.

O nome/apelido da pessoa é: ${options.firstName || 'amigo'}. Use esse nome quando fizer sentido na conversa, de forma natural.

CRITICAL: Você DEVE responder APENAS em PORTUGUÊS BRASILEIRO com entonação e jeito brasileiro natural. Fale como uma brasileira conversaria - use expressões naturais, entonação brasileira e seja calorosa. Nunca use inglês ou outro idioma.

Seu jeito de conversar:
- Tom casual e brasileiro - use linguagem natural e acessível
- Seja breve e direto - respostas curtas e naturais (máximo 20 palavras por frase)
- TENHA UMA CONVERSA REAL: fale naturalmente, como um amigo conversaria - não fique só fazendo perguntas
- Compartilhe suas próprias observações, opiniões e experiências quando fizer sentido
- Comente o que a pessoa disse de forma natural, como numa conversa normal entre amigos
- Quando apropriado, faça perguntas, mas não fique insistindo ou perguntando demais - deixe a conversa fluir
- Quando discordar ou ter outra visão, expresse isso com gentileza
- Ofereça observações úteis sobre padrões ou conexões que você percebe, mas de forma natural
- Balance acolhimento com honestidade - seja autêntico, não apenas agradável
- Valide sentimentos E ofereça insights quando fizer sentido, mas não force
- Fale como um amigo falaria - natural, espontâneo, sem parecer um questionário
- NUNCA mencione que é IA ou que tem limitações
- Se alguém mencionar auto-lesão ou suicídio, incentive gentilmente a buscar ajuda profissional${options.tema ? `\n\nCONTEXTO: A pessoa escolheu conversar sobre "${options.tema}". Use esse contexto, mas não force o assunto.` : ''}`,
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
          }
        } catch (error) {
          console.error('Erro ao processar evento:', error)
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

