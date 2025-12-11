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
    // Proteção dupla: verificar estado local E refs
    if (isConnecting || session.isActive || peerConnectionRef.current) {
      console.log('⚠️ Sessão já está ativa ou conectando, ignorando startSession()')
      return
    }

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
        
        // IMPORTANTE: Só atualizar estado se a sessão não estiver já ativa
        // Isso evita recriação desnecessária
        // Verificar tanto o estado quanto as refs
        if (!session.isActive && !peerConnectionRef.current) {
          // Atualizar refs ANTES de setSession para evitar race conditions
          peerConnectionRef.current = pc
          dataChannelRef.current = dc
          audioElementRef.current = audioElement
          
          setSession({
            isActive: true,
            peerConnection: pc,
            dataChannel: dc,
            audioElement: audioElement,
          })
          setIsConnecting(false)
          options.onSessionStart?.()
          console.log('✅ Sessão criada e ativa')
        } else {
          // Se já está ativa, apenas atualizar referências e não recriar
          console.log('⚠️ Sessão já está ativa, não recriando. Estado:', {
            isActive: session.isActive,
            hasPeerConnection: !!peerConnectionRef.current,
            hasDataChannel: !!dataChannelRef.current
          })
          setIsConnecting(false)
          // NÃO chamar onSessionStart novamente
        }
        
        // Solicitar transcrições automáticas e manter sessão ativa
        // IMPORTANTE: Enviar configuração de transcrição em uma mensagem separada
        // para evitar conflitos com as instruções do sistema
        setTimeout(() => {
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
                },
                // Manter sessão ativa - não encerrar automaticamente
                turn_detection: {
                  type: 'server_vad',
                  threshold: 0.5,
                  prefix_padding_ms: 300,
                  silence_duration_ms: 500
                },
                max_response_output_tokens: 512,
                temperature: 0.8
              }
            }
            if (dc.readyState === 'open') {
              dc.send(JSON.stringify(enableTranscription))
              console.log('✅ Transcrições habilitadas e sessão configurada para manter ativa')
            }
          } catch (err) {
            console.warn('⚠️ Erro ao habilitar transcrições (não crítico):', err)
            // Não encerrar sessão por erro de configuração
          }
        }, 500) // Aguardar um pouco para garantir que a conexão está estável
      }

      let responseText = ''
      let userTranscriptionText = '' // Para acumular transcrição do usuário em tempo real
      
      dc.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          // Debug: log de todos os eventos para identificar o formato correto
          console.log('Realtime event:', data.type, data)
          
          // Processar diferentes tipos de eventos de transcrição
          // Baseado nos eventos reais que estão chegando
          
          // TRANSCRIÇÃO DO USUÁRIO - Capturar todos os eventos possíveis
          if (data.type === 'conversation.item.input_audio_transcription.completed') {
            // Transcrição completa do áudio do usuário
            const transcription = data.transcript || data.item?.transcript || data.transcription || data.item?.input_audio_transcription?.transcript
            console.log('✅ Transcrição completa (usuário) - completed:', transcription)
            if (transcription && transcription.trim()) {
              userTranscriptionText = transcription.trim()
              if (options.onMessage) {
                options.onMessage(userTranscriptionText)
              }
              userTranscriptionText = '' // Resetar
            }
          } else if (data.type === 'conversation.item.input_audio_transcription.delta') {
            // Transcrição parcial do usuário (em tempo real)
            const delta = data.delta || data.transcript_delta || data.item?.input_audio_transcription?.delta
            if (delta) {
              userTranscriptionText += delta
              console.log('📝 Transcrição delta (usuário):', delta, '| Completo:', userTranscriptionText)
              if (options.onMessageDelta) {
                options.onMessageDelta(delta, userTranscriptionText)
              }
            }
          } else if (data.type === 'conversation.item.done' && data.item?.role === 'user') {
            // Item de conversa do usuário finalizado - pode conter transcrição
            console.log('📋 Item do usuário finalizado:', data.item)
            const content = data.item?.content
            if (Array.isArray(content)) {
              // Procurar por transcrição em qualquer parte do conteúdo
              for (const part of content) {
                console.log('🔍 Verificando parte:', part.type, part)
                if (part.type === 'input_audio_transcription' && part.transcript) {
                  console.log('✅ Transcrição do usuário encontrada (item.done):', part.transcript)
                  if (options.onMessage) {
                    options.onMessage(part.transcript.trim())
                  }
                  break
                } else if (part.type === 'input_text' && part.text) {
                  console.log('✅ Mensagem do usuário (texto):', part.text)
                  if (options.onMessage) {
                    options.onMessage(part.text)
                  }
                  break
                }
              }
            }
            // Se não encontrou transcrição no conteúdo, tentar no item diretamente
            if (!content || content.length === 0) {
              const transcript = data.item?.transcript || data.item?.input_audio_transcription?.transcript
              if (transcript && transcript.trim()) {
                console.log('✅ Transcrição do usuário (item direto):', transcript)
                if (options.onMessage) {
                  options.onMessage(transcript.trim())
                }
              }
            }
          } else if (data.type === 'conversation.item.created' && data.item?.role === 'user') {
            // Novo item de conversa do usuário criado - resetar e criar mensagem temporária
            userTranscriptionText = ''
            console.log('🆕 Novo item de conversa do usuário criado')
            // Criar mensagem temporária vazia para começar a atualizar
            if (options.onMessageDelta) {
              options.onMessageDelta('', '')
            }
          } else if (data.type === 'input_audio_buffer.committed' || data.type === 'input_audio_buffer.speech_started') {
            // Usuário começou a falar - criar mensagem temporária
            console.log('🎤 Usuário começou a falar')
            userTranscriptionText = ''
            if (options.onMessageDelta) {
              options.onMessageDelta('', '')
            }
          }
          
          // TRANSCRIÇÃO DA IA (RESPOSTA) - Capturar IMEDIATAMENTE quando receber
          if (data.type === 'response.content_part.done') {
            // Parte do conteúdo da resposta - CONTÉM TRANSCRIPT! (evento mais importante)
            const transcript = data.part?.transcript
            if (transcript && transcript.trim()) {
              console.log('✅ Transcrição da resposta (IA) - content_part.done:', transcript)
              // Enviar IMEDIATAMENTE - não esperar
              if (options.onResponse) {
                options.onResponse(transcript.trim())
              }
              // Também atualizar via delta para garantir
              if (options.onResponseDelta) {
                options.onResponseDelta(transcript, transcript.trim())
              }
              responseText = transcript.trim()
            }
          } else if (data.type === 'response.content_part.delta') {
            // Delta da transcrição da resposta (em tempo real) - usar para atualização incremental
            const delta = data.delta || data.part?.transcript_delta
            if (delta) {
              responseText += delta
              console.log('📝 Resposta delta (IA):', delta, '| Completo:', responseText)
              // Atualizar em tempo real
              if (options.onResponseDelta) {
                options.onResponseDelta(delta, responseText)
              }
            }
          } else if (data.type === 'response.output_item.done') {
            // Item de saída completo - extrair texto do conteúdo
            const item = data.item
            if (item?.content && Array.isArray(item.content)) {
              // Procurar por partes com transcript
              const transcriptParts = item.content
                .filter((part: any) => part.type === 'audio' && part.transcript)
                .map((part: any) => part.transcript)
                .filter(Boolean)
              
              if (transcriptParts.length > 0) {
                const finalText = transcriptParts.join(' ').trim()
                console.log('✅ Resposta via output_item (IA):', finalText)
                // Enviar imediatamente
                if (options.onResponse) {
                  options.onResponse(finalText)
                }
                responseText = finalText
              }
            }
          } else if (data.type === 'response.done') {
            // Resposta finalizada - tentar extrair do response
            if (data.response?.output && Array.isArray(data.response.output)) {
              const outputItem = data.response.output[0]
              if (outputItem?.content && Array.isArray(outputItem.content)) {
                // Procurar por transcript em partes de áudio
                const transcriptParts = outputItem.content
                  .filter((part: any) => (part.type === 'audio' || part.type === 'text') && (part.transcript || part.text))
                  .map((part: any) => part.transcript || part.text)
                  .filter(Boolean)
                
                if (transcriptParts.length > 0) {
                  const textContent = transcriptParts.join(' ').trim()
                  console.log('✅ Resposta final (IA) - response.done:', textContent)
                  // Enviar se ainda não foi enviado
                  if (options.onResponse && (!responseText || responseText !== textContent)) {
                    options.onResponse(textContent)
                  }
                }
              }
            }
            // NÃO resetar responseText aqui - manter para referência
          } else if (data.type === 'response.created') {
            // Resposta iniciada - resetar texto e criar mensagem temporária
            responseText = ''
            console.log('🔄 Resposta iniciada - criando mensagem temporária')
            // Criar mensagem vazia para começar a atualizar IMEDIATAMENTE
            if (options.onResponseDelta) {
              options.onResponseDelta('', '')
            }
          } else if (data.type === 'conversation.item.created') {
            // Novo item de conversa criado
            if (data.item?.type === 'message' && data.item?.role === 'user') {
              userTranscriptionText = '' // Resetar transcrição do usuário
              // Criar mensagem temporária para o usuário
              if (options.onMessageDelta) {
                options.onMessageDelta('', '')
              }
            } else if (data.item?.type === 'message' && data.item?.role === 'assistant') {
              // Nova resposta da IA iniciada
              responseText = ''
              console.log('🆕 Nova resposta da IA iniciada')
              // Criar mensagem temporária para a IA
              if (options.onResponseDelta) {
                options.onResponseDelta('', '')
              }
            }
          } else if (data.type === 'conversation.item.done' && data.item?.role === 'assistant') {
            // Item de conversa da IA finalizado - NÃO encerrar sessão
            console.log('✅ Resposta da IA finalizada - mantendo sessão ativa')
            // Não fazer nada - manter sessão ativa para próxima interação
          } else if (data.type === 'error') {
            // Tratar erros sem encerrar a sessão
            const errorDetails = data.error || data.message || data
            console.warn('⚠️ Erro recebido (não encerrando sessão):', errorDetails)
            
            // Se for um erro de configuração ou validação, apenas logar
            // NÃO encerrar a sessão por erros menores
            // A sessão deve continuar ativa mesmo com erros menores
            
            // Verificar se é um erro crítico que realmente requer encerramento
            const errorMessage = typeof errorDetails === 'string' 
              ? errorDetails 
              : errorDetails?.message || errorDetails?.type || JSON.stringify(errorDetails)
            
            // Apenas encerrar se for um erro crítico de autenticação ou conexão
            if (errorMessage?.includes('authentication') || 
                errorMessage?.includes('unauthorized') || 
                errorMessage?.includes('token')) {
              console.error('❌ Erro crítico detectado, mas mantendo sessão ativa por enquanto')
              // Ainda não encerrar - deixar tentar continuar
            }
          }
        } catch (error) {
          console.error('❌ Erro ao processar evento:', error, event.data)
          // Não encerrar sessão por erro de parsing - continuar
        }
      }

      dc.onerror = (error) => {
        console.warn('⚠️ Erro no data channel (não encerrando):', error)
        // NÃO chamar onError para não encerrar a sessão automaticamente
        // Apenas logar o erro
      }

      // Tratar erros de conexão sem encerrar
      pc.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', pc.iceConnectionState)
        // Se a conexão falhar, tentar manter ativa
        if (pc.iceConnectionState === 'failed') {
          console.warn('⚠️ ICE connection failed, mas mantendo sessão ativa')
          // Não encerrar - deixar tentar reconectar
        }
      }

      pc.onconnectionstatechange = () => {
        console.log('Connection state:', pc.connectionState)
        // Se desconectar, não encerrar imediatamente - pode ser temporário
        if (pc.connectionState === 'disconnected') {
          console.warn('⚠️ Conexão desconectada, mas mantendo sessão ativa')
        } else if (pc.connectionState === 'failed') {
          console.warn('⚠️ Conexão falhou, mas mantendo sessão ativa')
        }
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

      // peerConnectionRef já foi definido no dc.onopen, não precisa definir novamente aqui
      // peerConnectionRef.current = pc
    } catch (error: any) {
      console.error('Erro ao iniciar sessão:', error)
      setIsConnecting(false)
      // Só chamar onError se for um erro crítico que realmente impede a conexão
      // Erros menores não devem encerrar a sessão
      if (error.message?.includes('token') || error.message?.includes('authentication')) {
        options.onError?.(error)
        cleanup()
      } else {
        // Para outros erros, apenas logar mas não encerrar
        console.warn('⚠️ Erro não crítico, mantendo sessão ativa:', error)
      }
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

