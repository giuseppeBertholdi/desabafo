import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { sanitizeInput } from '@/lib/planAuthorization'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: Request) {
  try {
    const { text } = await request.json()

    // Verificar autenticação
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // SEGURANÇA: Sanitizar entrada
    const sanitizedText = sanitizeInput(text, 200)

    if (!sanitizedText || sanitizedText.length < 10 || sanitizedText.length > 200) {
      return NextResponse.json({ suggestion: null })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    
    const prompt = `Você está ajudando alguém a escrever em um diário. A pessoa começou a escrever:

"${sanitizedText}"

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

