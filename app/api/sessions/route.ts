import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { withRateLimit } from '@/lib/rateLimitMiddleware'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
if (!GEMINI_API_KEY) {
  console.error('⚠️ GEMINI_API_KEY não está configurada!')
}
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '')

// Criar nova sessão
async function handleCreateSession(request: NextRequest) {
  try {
    const { title, firstMessage, tema, skipSummary } = await request.json()
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Verificar plano do usuário e limitar sessões se for free
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('status', 'active')
      .single()

    if (!subscription) {
      // Plano free: verificar limite de 10 sessões
      const { count } = await supabase
        .from('chat_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id)

      if (count && count >= 10) {
        return NextResponse.json(
          { error: 'Limite de 10 sessões atingido. Faça upgrade para o plano Pro para sessões ilimitadas.' },
          { status: 403 }
        )
      }
    }

    // Criar sessão com tema se fornecido
    // Se skipSummary for true, não gerar resumo inicial
    const sessionData: any = {
      user_id: session.user.id,
      title: title || null,
      tema: tema || null
    }

    // Se não for para pular resumo e tiver primeira mensagem, gerar resumo simples
    if (!skipSummary && firstMessage) {
      const summary = firstMessage.length > 100 
        ? firstMessage.substring(0, 100) + '...'
        : firstMessage
      sessionData.summary = summary
    }

    const { data: newSession, error } = await supabase
      .from('chat_sessions')
      .insert(sessionData)
      .select()
      .single()

    if (error) throw error

    // Se tiver primeira mensagem, salvar
    if (firstMessage && newSession) {
      await supabase.from('chat_messages').insert({
        session_id: newSession.id,
        role: 'user',
        content: firstMessage
      })
    }

    return NextResponse.json({ sessionId: newSession.id })
  } catch (error) {
    console.error('Erro ao criar sessão:', error)
    return NextResponse.json(
      { error: 'Erro ao criar sessão' },
      { status: 500 }
    )
  }
}

// Atualizar resumo e tema da sessão
async function handleUpdateSession(request: NextRequest) {
  try {
    const { sessionId, messages, tema } = await request.json()
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Só atualizar se tiver mais de 5 mensagens do usuário
    const userMessages = messages.filter((m: any) => m.role === 'user')
    if (userMessages.length <= 5) {
      return NextResponse.json({ success: true, message: 'Ainda não há mensagens suficientes' })
    }

    // Gerar resumo com Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-001' })
    
    const conversationText = messages
      .slice(-15) // Últimas 15 mensagens
      .map((m: any) => `${m.role === 'user' ? 'Usuário' : 'IA'}: ${m.content}`)
      .join('\n')

    const prompt = `Gere um resumo objetivo e direto (máximo 2 frases) desta conversa em português brasileiro. Use linguagem formal e clara, sem gírias ou expressões muito informais. Foque nos principais temas e sentimentos discutidos.

${conversationText}

Resumo:`

    const result = await model.generateContent(prompt)
    const summary = result.response.text().trim()

    // Atualizar sessão com resumo e tema
    const updateData: any = { 
      summary,
      updated_at: new Date().toISOString()
    }

    // Atualizar tema se fornecido
    if (tema) {
      updateData.tema = tema
    }

    await supabase
      .from('chat_sessions')
      .update(updateData)
      .eq('id', sessionId)
      .eq('user_id', session.user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao atualizar resumo:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar resumo' },
      { status: 500 }
    )
  }
}

// Exportar com rate limiting aplicado
export async function POST(request: NextRequest) {
  return withRateLimit(request, handleCreateSession, {
    type: 'sessions',
    skipAuth: false,
  })
}

export async function PUT(request: NextRequest) {
  return withRateLimit(request, handleUpdateSession, {
    type: 'sessions',
    skipAuth: false,
  })
}

