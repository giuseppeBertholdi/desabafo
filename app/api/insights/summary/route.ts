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

async function handleSummaryRequest(request: NextRequest) {
  try {
    const { totalSessions, totalMessages, period, sampleMessages } = await request.json()
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Verificar se o usuário tem plano PRO
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('status')
      .eq('user_id', session.user.id)
      .in('status', ['active', 'trialing'])
      .single()

    if (!subscription) {
      return NextResponse.json(
        { error: 'Resumos personalizados disponíveis apenas no plano PRO' },
        { status: 403 }
      )
    }

    // Gerar resumo detalhado com Gemini
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash-001',
      generationConfig: {
        maxOutputTokens: 800, // Permitir resumo longo e detalhado
        temperature: 0.8,
      }
    })
    
    // Usar mais mensagens para análise detalhada
    const detailedSample = sampleMessages.substring(0, 2000)
    
    const prompt = `Analise detalhadamente as conversas do usuário e gere um resumo completo e profundo sobre seus padrões de comunicação, sentimentos expressos, temas recorrentes e evolução emocional.

Período analisado: ${period}
Total de conversas: ${totalSessions}
Total de mensagens: ${totalMessages}
Média de mensagens por conversa: ${totalSessions > 0 ? Math.round(totalMessages / totalSessions) : 0}

Mensagens do usuário para análise:
${detailedSample}

Gere um resumo detalhado (8-12 frases) que inclua:
1. Análise dos principais temas e preocupações abordados
2. Padrões emocionais identificados nas conversas
3. Evolução ou mudanças nos sentimentos ao longo do período
4. Frequência e profundidade das conversas
5. Observações sobre como o usuário se expressa e comunica
6. Insights sobre o uso da plataforma como espaço de desabafo

Seja empático, objetivo e detalhado. Use linguagem clara e profissional.`

    const result = await model.generateContent(prompt)
    const summary = result.response.text().trim()

    return NextResponse.json({ summary })
  } catch (error) {
    console.error('Erro ao gerar resumo:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar resumo' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return withRateLimit(request, handleSummaryRequest, {
    type: 'insights',
    skipAuth: false,
  })
}

