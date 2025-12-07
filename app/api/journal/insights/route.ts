import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { withRateLimit } from '@/lib/rateLimitMiddleware'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

async function handleJournalInsights(request: NextRequest) {
  try {
    const { entries } = await request.json()

    if (!entries || entries.length === 0) {
      return NextResponse.json({ error: 'Nenhuma entrada fornecida' }, { status: 400 })
    }

    // Verificar autenticação
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-001' })
    
    const entriesText = entries.map((e: any, i: number) => 
      `${i + 1}. [${e.date}] ${e.mood ? `Humor: ${e.mood}. ` : ''}${e.content}`
    ).join('\n\n')

    const prompt = `Analise as seguintes entradas de diário e forneça insights empáticos e úteis sobre padrões, sentimentos e temas recorrentes. Seja genuíno e acolhedor, como um amigo que está lendo o diário. Máximo 150 palavras.

Entradas:
${entriesText}

Forneça insights sobre:
- Padrões emocionais que você percebe
- Temas recorrentes
- Observações gentis e empáticas
- Sugestões de reflexão (sem ser prescritivo)

Responda de forma natural e acolhedora, como se estivesse conversando com a pessoa.`

    const result = await model.generateContent(prompt)
    const insightsText = result.response.text().trim()

    return NextResponse.json({ insights: insightsText })
  } catch (error) {
    console.error('Erro ao gerar insights:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar insights' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return withRateLimit(request, handleJournalInsights, {
    type: 'journal',
    skipAuth: false,
  })
}

