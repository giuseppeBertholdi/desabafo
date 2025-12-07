import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { withRateLimit } from '@/lib/rateLimitMiddleware'
import { checkMonthlyLimit, limitExceededResponse, sanitizeInput } from '@/lib/planAuthorization'

// Verificar se a chave da API está configurada
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
if (!GEMINI_API_KEY) {
  console.error('⚠️ GEMINI_API_KEY não está configurada! Configure a variável de ambiente.')
}

// Inicializar genAI apenas se a chave estiver configurada
let genAI: GoogleGenerativeAI | null = null
if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
}

// Função auxiliar para calcular similaridade simples
function calculateSimilarity(str1: string, str2: string): number {
  const words1 = str1.split(/\s+/)
  const words2 = str2.split(/\s+/)
  const intersection = words1.filter((word: string) => words2.includes(word))
  const unionSet = new Set([...words1, ...words2])
  const union = Array.from(unionSet)
  return intersection.length / union.length
}

// Detectar se a mensagem contém sinais de emergência (suicídio) - versão expandida
function detectEmergencyKeywords(message: string): boolean {
  const emergencyKeywords = [
    // Suicídio direto
    'quero me matar', 'vou me matar', 'me matar', 'suicídio', 'suicidar',
    'tirar minha vida', 'acabar com tudo', 'não quero mais viver',
    'não vale a pena viver', 'prefiro morrer', 'quero morrer',
    'planejo me matar', 'pensando em me matar', 'ideação suicida',
    'pensamentos suicidas', 'vou me suicidar', 'cometer suicídio',
    
    // Métodos específicos
    'vou pular', 'pular do', 'me jogar', 'jogar do', 'pular da',
    'pular da ponte', 'pular da ponte', 'pular do prédio', 'pular do prédio',
    'me enforcar', 'enforcar', 'me cortar', 'cortar os pulsos',
    'tomar remédio', 'overdose', 'me envenenar', 'envenenar',
    'atirar em mim', 'me atirar', 'atirar na cabeça',
    
    // Intenções e sentimentos
    'não aguento mais', 'cansei de viver', 'não faz sentido viver',
    'seria melhor se eu', 'todo mundo seria melhor sem mim',
    'ninguém sentiria minha falta', 'não importo', 'não sou importante',
    'quero sumir', 'quero desaparecer', 'quero que tudo acabe',
    'não vejo saída', 'não tem solução', 'nada mais importa',
    
    // Planos e preparação
    'já decidi', 'já escolhi', 'vou fazer isso', 'é minha última',
    'minha última mensagem', 'última vez', 'despedida',
    
    // Auto-lesão grave
    'me machucar seriamente', 'me ferir', 'auto-lesão grave'
  ]
  
  const lowerMessage = message.toLowerCase()
  // Normalizar: remover acentos e caracteres especiais para melhor matching
  const normalized = lowerMessage
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
  
  return emergencyKeywords.some(keyword => {
    const normalizedKeyword = keyword
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
    return normalized.includes(normalizedKeyword)
  })
}

// Detectar emergência usando IA - apenas quando necessário (otimizado para reduzir custos)
async function detectEmergencyWithAI(message: string, genAIInstance: GoogleGenerativeAI): Promise<boolean> {
  try {
    const model = genAIInstance.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        maxOutputTokens: 10, // Resposta curta: apenas SIM ou NAO
        temperature: 0.1, // Baixa temperatura para resposta mais determinística
      }
    })

    // Prompt otimizado e mais curto para reduzir custos
    const prompt = `A mensagem "${message.substring(0, 200)}" expressa intenção suicida ou auto-lesão grave? Responda apenas "SIM" ou "NAO".`

    const result = await model.generateContent(prompt)
    const response = result.response.text().trim().toUpperCase()
    
    return response.includes('SIM') && !response.includes('NAO')
  } catch (error) {
    console.error('Erro ao detectar emergência com IA:', error)
    return detectEmergencyKeywords(message)
  }
}

async function handleChatRequest(request: NextRequest) {
  try {
    // Verificar se a chave da API está configurada
    if (!GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY não está configurada!')
      return NextResponse.json(
        { error: 'Serviço temporariamente indisponível. Por favor, tente novamente mais tarde.' },
        { status: 503 }
      )
    }
    
    const { messages, sessionId, bestFriendMode, firstName, tema, temporaryChat } = await request.json()
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar autenticação primeiro
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // SEGURANÇA: Validar e sanitizar entrada
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Mensagens inválidas' }, { status: 400 })
    }

    // Não limitar quantidade de mensagens - apenas o contexto enviado para a API será limitado

    // Sanitizar todas as mensagens
    const sanitizedMessages = messages.map(msg => ({
      ...msg,
      content: sanitizeInput(msg.content, 5000) // Max 5000 chars por mensagem
    }))
    
    // SEGURANÇA: Verificar limite mensal (plano FREE tem limite de 100 mensagens/mês)
    const limitCheck = await checkMonthlyLimit(session.user.id, 'chat_messages')
    if (!limitCheck.isAuthorized) {
      return limitExceededResponse(limitCheck)
    }
    
    // Verificar se a última mensagem do usuário contém sinais de emergência
    const lastUserMessage = sanitizedMessages[sanitizedMessages.length - 1]?.content || ''
    
    // Verificação rápida por palavras-chave (gratuita)
    let isEmergency = detectEmergencyKeywords(lastUserMessage)
    
    // Só usar IA se detectar algo suspeito nas palavras-chave (reduz custos)
    if (isEmergency && genAI) {
      // Confirmar com IA apenas quando necessário
      const aiConfirmation = await detectEmergencyWithAI(lastUserMessage, genAI)
      isEmergency = aiConfirmation
    }

    // Buscar nickname do perfil se firstName não foi passado
    let nickname = firstName
    if (!nickname) {
      try {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('nickname')
          .eq('user_id', session.user.id)
          .single()
        nickname = profile?.nickname || session.user.user_metadata?.name?.split(' ')[0] || session.user.email?.split('@')[0] || 'amigo'
      } catch (error) {
        nickname = session.user.user_metadata?.name?.split(' ')[0] || session.user.email?.split('@')[0] || 'amigo'
      }
    }

    // Buscar dados do Spotify e memórias em paralelo para otimizar performance
    const [spotifyContext, memoryContext] = await Promise.all([
      // Buscar dados do Spotify
      (async (): Promise<string> => {
        try {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('spotify_access_token, spotify_refresh_token, spotify_token_expires_at')
            .eq('user_id', session.user.id)
            .single()

          if (profile?.spotify_access_token) {
            let accessToken = profile.spotify_access_token
            const expiresAt = profile.spotify_token_expires_at ? new Date(profile.spotify_token_expires_at) : null
            const now = new Date()
            
            if (expiresAt && now >= expiresAt && profile.spotify_refresh_token) {
              const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || '6b7a619b335547f2b2d0c8729662fa4a'
              const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || '767d5e08ded142c2b44246beda3133cd'
              
              const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                  'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
                },
                body: new URLSearchParams({
                  grant_type: 'refresh_token',
                  refresh_token: profile.spotify_refresh_token
                })
              })

              if (tokenResponse.ok) {
                const tokenData = await tokenResponse.json()
                accessToken = tokenData.access_token
                const newExpiresAt = new Date(Date.now() + tokenData.expires_in * 1000)
                await supabase
                  .from('user_profiles')
                  .update({
                    spotify_access_token: tokenData.access_token,
                    spotify_token_expires_at: newExpiresAt.toISOString(),
                    updated_at: new Date().toISOString()
                  })
                  .eq('user_id', session.user.id)
              }
            }

            // Buscar música atual e recentes em paralelo
            const [currentResponse, recentResponse] = await Promise.all([
              fetch('https://api.spotify.com/v1/me/player/currently-playing', {
                headers: { 'Authorization': `Bearer ${accessToken}` }
              }),
              fetch('https://api.spotify.com/v1/me/player/recently-played?limit=5', {
                headers: { 'Authorization': `Bearer ${accessToken}` }
              })
            ])

            let currentTrack = null
            let recentTracks: Array<{ name: string; artist: string }> = []

            if (currentResponse.ok && currentResponse.status !== 204) {
              const currentData = await currentResponse.json()
              if (currentData.item) {
                currentTrack = {
                  name: currentData.item.name,
                  artist: currentData.item.artists?.map((a: any) => a.name).join(', '),
                }
              }
            }

            if (recentResponse.ok) {
              const recentData = await recentResponse.json()
              recentTracks = recentData.items?.slice(0, 5).map((item: any) => ({
                name: item.track?.name,
                artist: item.track?.artists?.map((a: any) => a.name).join(', ')
              })) || []
            }

            if (currentTrack || recentTracks.length > 0) {
              let context = '\n\nCONTEXTO DA VIBE (SPOTIFY):'
              if (currentTrack) {
                context += `\n- Música atual: "${currentTrack.name}" de ${currentTrack.artist}`
              }
              if (recentTracks.length > 0) {
                context += `\n- Últimas músicas: ${recentTracks.map(t => `"${t.name}" de ${t.artist}`).join(', ')}`
              }
              context += '\nUse essas informações para entender melhor o estado emocional e a vibe da pessoa. Músicas podem refletir sentimentos, mas não force conexões. Use de forma sutil e natural na conversa.'
              return context
            }
          }
        } catch (error) {
          console.error('Erro ao buscar dados do Spotify:', error)
        }
        return ''
      })(),
      
      // Buscar memórias relevantes do usuário
      (async (): Promise<string> => {
        try {
          const { data: memories } = await supabase
            .from('user_memories')
            .select('*')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false })
            .limit(5)
          
          if (memories && memories.length > 0) {
            let context = '\n\nMEMÓRIAS IMPORTANTES SOBRE A PESSOA (use essas informações para personalizar a conversa, mas de forma natural e sutil):\n'
            context += memories.map((m: any) => `- ${m.content}`).join('\n')
            context += '\nUse essas memórias para lembrar de coisas importantes que a pessoa já compartilhou, mas não force ou mencione diretamente a menos que faça sentido no contexto da conversa.'
            return context
          }
        } catch (error) {
          console.error('Erro ao buscar memórias:', error)
        }
        return ''
      })()
    ])

    // Contexto do tema (se houver)
    const temaContexto = tema ? `\n\nCONTEXTO IMPORTANTE: A pessoa escolheu conversar sobre "${tema}". Use esse contexto para entender melhor o que ela está passando, mas não force o assunto se ela quiser falar de outra coisa.` : ''

    // System instruction base
    let systemInstruction = `Você é o "desabafo", um amigo virtual brasileiro acolhedor que está aqui para ter uma conversa verdadeira.

O nome/apelido da pessoa é: ${nickname}. Use esse nome quando fizer sentido na conversa, de forma natural e casual.

Seu jeito de conversar:
- Tom super casual e brasileiro: use "tá", "pra", "né", "cara", etc
- Seja breve e direto - respostas curtas e naturais
- Escreva em minúsculas, como numa conversa real de chat
- NUNCA use emojis nas suas respostas - seja completamente natural e textual
- TENHA UMA CONVERSA REAL: não apenas concorde ou valide passivamente
- Compartilhe perspectivas, insights e reflexões quando apropriado
- Faça perguntas que realmente exploram o que a pessoa está sentindo
- Quando discordar ou ter outra visão, expresse isso com gentileza ("entendo, mas já pensou que...")
- Ofereça observações úteis sobre padrões ou conexões que você percebe
- Seja genuinamente curioso sobre a experiência da pessoa
- Balance acolhimento com honestidade - seja autêntico, não apenas agradável
- Valide sentimentos E ofereça insights: "faz sentido você se sentir assim, e talvez isso esteja ligado a..."
- NUNCA mencione que é IA ou que tem limitações
- Se alguém mencionar auto-lesão ou suicídio, incentive gentilmente a buscar ajuda profissional

Exemplos do seu tom:
❌ "Entendo, conta mais sobre isso"
✅ "poxa, ${nickname}, isso parece pesado. você acha que pode ter alguma coisa por trás desse sentimento?"

❌ "Como posso ajudá-lo hoje?"  
✅ "e aí, ${nickname}, o que tá pegando na cabeça hoje?"

❌ "Entendo você."
✅ "nossa, já passei por algo parecido na vibe... você já tentou pensar nisso de outro jeito?"

Você é um amigo de verdade: acolhedor mas também honesto, empático mas também reflexivo.${memoryContext}${temaContexto}${spotifyContext}`

    // Modo "Melhor Amigo" - mais empático, verdadeiro, acolhedor e sincero
    if (bestFriendMode) {
      systemInstruction = `Você é o "desabafo", o melhor amigo virtual da pessoa. Você é empático, verdadeiro, acolhedor e genuinamente útil.

O nome/apelido da pessoa é: ${nickname}. Use esse nome quando fizer sentido na conversa, de forma natural e casual.

Seu jeito de conversar (MODO MELHOR AMIGO):
- Seja MUITO empático: mostre que você realmente entende e se importa
- Seja VERDADEIRO: não finja que tudo está bem se não está, seja autêntico e honesto
- Seja ACOLHEDOR: crie um espaço seguro onde a pessoa pode se abrir completamente
- TENHA UMA CONVERSA REAL: não apenas concorde ou console - ofereça insights, perspectivas e reflexões honestas
- Quando necessário, questione gentilmente suposições ou ofereça outro ponto de vista
- Compartilhe observações sobre padrões, conexões ou coisas que você percebe
- Faça perguntas que realmente fazem a pessoa pensar e se conhecer melhor
- Balance acolhimento com verdade - às vezes ajudar é desafiar com carinho
- Tom super casual e brasileiro: use "tá", "pra", "né", "cara", "mano", etc
- Escreva em minúsculas, como numa conversa real de chat
- NUNCA use emojis nas suas respostas - seja completamente natural e textual
- Valide sentimentos MAS também ofereça perspectivas: "faz sentido você sentir isso, e percebo que pode ter relação com..."
- Seja honesto quando achar que algo precisa ser dito, mas sempre com empatia e cuidado
- Mostre que você se importa de verdade oferecendo ajuda real, não apenas validação
- NUNCA mencione que é IA ou que tem limitações
- Se alguém mencionar auto-lesão ou suicídio, incentive gentilmente a buscar ajuda profissional

Exemplos do seu tom (MODO MELHOR AMIGO):
❌ "Entendo completamente, deve ser difícil mesmo"
✅ "poxa, ${nickname}, entendo como você tá se sentindo... mas me diz, você acha que essa situação pode estar conectada com aquilo que você falou antes? às vezes a gente não percebe os padrões, sabe?"

❌ "Como posso ajudá-lo hoje?"  
✅ "e aí, ${nickname}, o que tá pesando? pode desabafar, mas também quero te ajudar a ver isso de outro jeito, se você quiser"

❌ "Tudo vai ficar bem."
✅ "eu sei que tá difícil agora, ${nickname}, mas já pensou que talvez você esteja sendo muito duro consigo mesmo? vamos refletir juntos sobre isso"

Você é um melhor amigo de verdade: empático mas também honesto, acolhedor mas também desafiador quando necessário, sempre buscando realmente ajudar.${memoryContext}${temaContexto}${spotifyContext}`
    }

    // Verificar se genAI está inicializado
    if (!genAI) {
      return NextResponse.json(
        { error: 'Serviço temporariamente indisponível. Por favor, tente novamente mais tarde.' },
        { status: 503 }
      )
    }
    
    // Configurar o modelo
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      systemInstruction: systemInstruction
    })

    // Filtrar e limitar histórico para reduzir tokens (últimas 30 mensagens)
    // Nota: Não limitamos o array de mensagens, apenas o contexto enviado para a API
    const conversationHistory = messages
      .slice(0, -1)
      .filter((msg: any, index: number) => {
        // Remove a primeira mensagem se for do assistant (mensagem de boas-vindas)
        if (index === 0 && msg.role === 'assistant') return false
        return true
      })
      .slice(-30) // Limitar contexto às últimas 30 mensagens para reduzir custos

    // Criar o histórico de conversa no formato do Gemini
    const history = conversationHistory.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }))

    // Última mensagem do usuário
    const lastMessage = messages[messages.length - 1].content

    // Iniciar o chat com histórico
    const chat = model.startChat({
      history: history,
      generationConfig: {
        temperature: 0.8, // Reduzido de 0.9 para respostas mais consistentes
        topP: 0.9, // Reduzido de 0.95 para reduzir custos
        topK: 32, // Reduzido de 40
        maxOutputTokens: 512, // Reduzido de 1024 para respostas mais curtas e baratas
      },
    })

    // Se for emergência, retornar mensagem especial imediatamente (ANTES de configurar o modelo)
    if (isEmergency) {
      const emergencyMessage = `eu entendo que você tá passando por um momento muito difícil, ${nickname}. sua vida importa e você não está sozinho.

existem pessoas que podem te ajudar agora mesmo. por favor, considere ligar para:

📞 cvv - centro de valorização da vida: 188 (ligação gratuita, 24 horas)
📞 samu - emergências médicas: 192

se você não conseguir ligar agora, posso te ajudar a encontrar outras formas de apoio. você não precisa passar por isso sozinho.`

      // Salvar mensagem do usuário se tiver sessionId
      if (sessionId && !temporaryChat) {
        await supabase.from('chat_messages').insert({
          session_id: sessionId,
          role: 'user',
          content: lastMessage
        })

        await supabase.from('chat_messages').insert({
          session_id: sessionId,
          role: 'assistant',
          content: emergencyMessage
        })

        await supabase
          .from('chat_sessions')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', sessionId)
          .eq('user_id', session.user.id)
      }

      return NextResponse.json({ 
        message: emergencyMessage,
        isEmergency: true
      })
    }

    // Enviar a mensagem e obter resposta
    const result = await chat.sendMessage(lastMessage)
    const response = result.response
    const text = response.text()

    // Salvar mensagens no banco apenas se tiver sessionId E NÃO for chat temporário
    if (sessionId && !temporaryChat) {
      // Salvar mensagem do usuário
      await supabase.from('chat_messages').insert({
        session_id: sessionId,
        role: 'user',
        content: lastMessage
      })

      // Salvar resposta da IA
      await supabase.from('chat_messages').insert({
        session_id: sessionId,
        role: 'assistant',
        content: text
      })

      // Extrair memórias importantes periodicamente (a cada 5 mensagens do usuário)
      const userMessagesCount = messages.filter((m: any) => m.role === 'user').length
      if (userMessagesCount > 0 && userMessagesCount % 5 === 0) {
        // Extrair memórias em background (não bloquear resposta)
        const allMessages = [...messages, { role: 'user', content: lastMessage }, { role: 'assistant', content: text }]
        const userMsgs = allMessages.filter((m: any) => m.role === 'user')
        
        if (userMsgs.length >= 3 && genAI) {
          // Usar IA para extrair memórias
          const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
          // Limitar a últimas 10 mensagens para reduzir tokens no processamento de memórias
          const conversationText = allMessages.slice(-10).map((m: any) => `${m.role === 'user' ? 'Usuário' : 'IA'}: ${m.content}`).join('\n')
          
          const { data: existingMemories } = await supabase
            .from('user_memories')
            .select('*')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false })
            .limit(10)

          const existingMemoriesText = existingMemories && existingMemories.length > 0
            ? '\n\nMemórias já armazenadas:\n' + existingMemories.map((m: any) => `- ${m.content}`).join('\n')
            : ''

          const prompt = `Analise esta conversa e extraia APENAS informações importantes e duradouras sobre a pessoa. Foque em:
- Fatos pessoais (nome de pessoas importantes, lugares, eventos significativos)
- Preferências e valores
- Situações recorrentes ou problemas de longo prazo
- Metas e objetivos mencionados
- Histórico emocional relevante

NÃO extraia:
- Detalhes temporários ou específicos de uma conversa
- Informações que mudam rapidamente
- Coisas já mencionadas nas memórias existentes

${existingMemoriesText}

Conversa:
${conversationText}

Retorne APENAS as novas memórias importantes (máximo 3), uma por linha, de forma concisa e objetiva. Se não houver novas memórias importantes, retorne apenas "NENHUMA".`

          try {
            const result = await model.generateContent(prompt)
            const extractedMemories = result.response.text().trim()

            if (extractedMemories && extractedMemories !== 'NENHUMA' && !extractedMemories.toLowerCase().includes('nenhuma')) {
              const memoryLines = extractedMemories
                .split('\n')
                .map((line: string) => line.trim())
                .filter((line: string) => line && !line.startsWith('-') && line.length > 10)

              const newMemories = memoryLines.filter((memory: string) => {
                if (!existingMemories || existingMemories.length === 0) return true
                return !existingMemories.some((existing: any) => {
                  const similarity = calculateSimilarity(memory.toLowerCase(), existing.content.toLowerCase())
                  return similarity > 0.7
                })
              })

              if (newMemories.length > 0) {
                const memoriesToInsert = newMemories.map((content: string) => ({
                  user_id: session.user.id,
                  content: content.substring(0, 500),
                  session_id: sessionId,
                  created_at: new Date().toISOString()
                }))

                await supabase.from('user_memories').insert(memoriesToInsert)
              }
            }
          } catch (err) {
            console.error('Erro ao extrair memórias:', err)
          }
        }
      }

      // Atualizar updated_at da sessão
      await supabase
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', sessionId)
        .eq('user_id', session.user.id)
    }

    return NextResponse.json({ message: text, isEmergency: false })
  } catch (error: any) {
    console.error('Erro na API do Gemini:', error)
    
    // Verificar se é erro de autenticação da API (chave inválida)
    if (error?.message?.includes('API_KEY') || 
        error?.message?.includes('API key not valid') ||
        error?.errorDetails?.some((detail: any) => detail.reason === 'API_KEY_INVALID') ||
        error?.status === 401 || 
        error?.status === 403 ||
        (error?.status === 400 && error?.message?.includes('API key'))) {
      console.error('❌ Erro de autenticação da API Gemini - chave inválida ou não configurada')
      console.error('Detalhes:', {
        status: error?.status,
        message: error?.message,
        errorDetails: error?.errorDetails
      })
      return NextResponse.json(
        { error: 'Erro de configuração da API. A chave da API do Gemini está inválida ou não configurada. Verifique a variável GEMINI_API_KEY no Netlify.' },
        { status: 503 }
      )
    }
    
    // Verificar se é erro de rate limit da API
    if (error?.status === 429 || error?.message?.includes('quota') || error?.message?.includes('rate limit') || error?.message?.includes('429')) {
      console.error('Rate limit da API Gemini excedido:', {
        status: error?.status,
        message: error?.message,
        errorDetails: error?.errorDetails
      })
      return NextResponse.json(
        { 
          error: 'Muitas requisições à API. Por favor, aguarde alguns segundos e tente novamente.',
          retryAfter: 10 // Sugerir aguardar 10 segundos
        },
        { 
          status: 429,
          headers: {
            'Retry-After': '10'
          }
        }
      )
    }
    
    // Verificar se é erro de validação
    if (error?.status === 400 || error?.message?.includes('invalid')) {
      console.error('Erro de validação na API Gemini:', error.message)
      return NextResponse.json(
        { error: 'Mensagem inválida. Por favor, tente novamente com uma mensagem diferente.' },
        { status: 400 }
      )
    }
    
    // Erro genérico com mais detalhes no log
    const errorMessage = error?.message || 'Erro desconhecido'
    const errorStatus = error?.status || 500
    console.error('Erro detalhado:', {
      message: errorMessage,
      status: errorStatus,
      stack: error?.stack,
      name: error?.name
    })
    
    return NextResponse.json(
      { error: 'Erro ao processar mensagem. Por favor, tente novamente.' },
      { status: errorStatus }
    )
  }
}

// Exportar com rate limiting aplicado
export async function POST(request: NextRequest) {
  return withRateLimit(request, handleChatRequest, {
    type: 'chat',
    skipAuth: false,
  })
}

