import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: Request) {
  try {
    const { text } = await request.json()

    if (!text || text.length < 10 || text.length > 200) {
      return NextResponse.json({ suggestion: null })
    }

    // Verificar autenticação
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
    
    const prompt = `Você está ajudando alguém a escrever em um diário. A pessoa começou a escrever:

"${text}"

Sugira uma continuação natural e útil (máximo 10 palavras). Seja empático e genuíno. Responda APENAS com a sugestão, sem explicações.`

    const result = await model.generateContent(prompt)
    const suggestionText = result.response.text().trim()

    if (suggestionText && suggestionText.length < 100) {
      return NextResponse.json({ suggestion: suggestionText })
    }

    return NextResponse.json({ suggestion: null })
  } catch (error) {
    console.error('Erro ao gerar sugestão:', error)
    return NextResponse.json({ suggestion: null })
  }
}

