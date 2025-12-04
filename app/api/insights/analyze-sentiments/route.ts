import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { sanitizeInput } from '@/lib/planAuthorization'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyDSwHdCbfaMSJVk-i0ZLj6aR-WJccS9gd4')

export async function POST(request: Request) {
  try {
    const { messages } = await request.json()
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // SEGURANÇA: Validar entrada
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({
        distribution: {
          feliz: 0, calmo: 0, esperançoso: 0, grato: 0,
          triste: 0, ansioso: 0, frustrado: 0, irritado: 0, preocupado: 0
        }
      })
    }

    // Reduzir para 15 mensagens, sanitizar e truncar cada uma
    const sampleMessages = messages
      .slice(0, 15)
      .map((m: string) => sanitizeInput(m, 100)) // Sanitizar e limitar a 100 caracteres
      .filter(m => m.length > 0) // Remover mensagens vazias após sanitização
      .join('\n')

    // Gerar análise com Gemini
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        maxOutputTokens: 200, // Limitar tokens de saída
        temperature: 0.3, // Mais determinístico
      }
    })
    
    const prompt = `Classifique cada mensagem em UMA emoção: feliz, calmo, esperançoso, grato, triste, ansioso, frustrado, irritado, preocupado.

Mensagens:
${sampleMessages}

Retorne APENAS JSON:
{"feliz":0,"calmo":0,"esperançoso":0,"grato":0,"triste":0,"ansioso":0,"frustrado":0,"irritado":0,"preocupado":0}`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text().trim()
    
    // Extrair JSON da resposta
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Resposta inválida da IA')
    }

    const distribution = JSON.parse(jsonMatch[0])

    // Normalizar para porcentagens
    const total = Object.values(distribution).reduce((a: number, b: unknown) => a + (typeof b === 'number' ? b : 0), 0)
    if (total === 0) {
      return NextResponse.json({
        distribution: {
          feliz: 11, calmo: 11, esperançoso: 11, grato: 11,
          triste: 11, ansioso: 11, frustrado: 11, irritado: 11, preocupado: 11
        }
      })
    }

    const percentages = {
      feliz: Math.round((distribution.feliz / total) * 100),
      calmo: Math.round((distribution.calmo / total) * 100),
      esperançoso: Math.round((distribution.esperançoso / total) * 100),
      grato: Math.round((distribution.grato / total) * 100),
      triste: Math.round((distribution.triste / total) * 100),
      ansioso: Math.round((distribution.ansioso / total) * 100),
      frustrado: Math.round((distribution.frustrado / total) * 100),
      irritado: Math.round((distribution.irritado / total) * 100),
      preocupado: Math.round((distribution.preocupado / total) * 100)
    }

    // Ajustar para garantir soma = 100%
    const sum = Object.values(percentages).reduce((a, b) => a + b, 0)
    if (sum !== 100) {
      const diff = 100 - sum
      const maxKey = Object.entries(percentages).reduce((a, b) => 
        percentages[a[0] as keyof typeof percentages] > percentages[b[0] as keyof typeof percentages] ? a : b
      )[0]
      percentages[maxKey as keyof typeof percentages] += diff
    }

    return NextResponse.json({ distribution: percentages })
  } catch (error) {
    console.error('Erro ao analisar sentimentos:', error)
    return NextResponse.json(
      { error: 'Erro ao analisar sentimentos' },
      { status: 500 }
    )
  }
}

