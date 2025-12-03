import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

// Extrair e armazenar memórias importantes da conversa
export async function POST(request: Request) {
  try {
    const { messages, sessionId } = await request.json()
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Só extrair memórias se tiver pelo menos 3 mensagens do usuário
    const userMessages = messages.filter((m: any) => m.role === 'user')
    if (userMessages.length < 3) {
      return NextResponse.json({ success: true, message: 'Ainda não há mensagens suficientes' })
    }

    // Buscar memórias existentes para contexto
    const { data: existingMemories } = await supabase
      .from('user_memories')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    // Usar IA para extrair informações importantes
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
    
    const conversationText = messages
      .slice(-20) // Últimas 20 mensagens
      .map((m: any) => `${m.role === 'user' ? 'Usuário' : 'IA'}: ${m.content}`)
      .join('\n')

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

    const result = await model.generateContent(prompt)
    const extractedMemories = result.response.text().trim()

    if (!extractedMemories || extractedMemories === 'NENHUMA' || extractedMemories.toLowerCase().includes('nenhuma')) {
      return NextResponse.json({ success: true, memoriesExtracted: 0 })
    }

    // Processar memórias extraídas
    const memoryLines = extractedMemories
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line && !line.startsWith('-') && line.length > 10)

    // Remover duplicatas comparando com memórias existentes
    const newMemories = memoryLines.filter((memory: string) => {
      if (!existingMemories || existingMemories.length === 0) return true
      return !existingMemories.some((existing: any) => {
        const similarity = calculateSimilarity(memory.toLowerCase(), existing.content.toLowerCase())
        return similarity > 0.7 // Se mais de 70% similar, considerar duplicata
      })
    })

    // Armazenar novas memórias
    if (newMemories.length > 0) {
      const memoriesToInsert = newMemories.map((content: string) => ({
        user_id: session.user.id,
        content: content.substring(0, 500), // Limitar tamanho
        session_id: sessionId,
        created_at: new Date().toISOString()
      }))

      await supabase.from('user_memories').insert(memoriesToInsert)
    }

    return NextResponse.json({ 
      success: true, 
      memoriesExtracted: newMemories.length,
      memories: newMemories
    })
  } catch (error) {
    console.error('Erro ao extrair memórias:', error)
    return NextResponse.json(
      { error: 'Erro ao extrair memórias' },
      { status: 500 }
    )
  }
}

// Buscar memórias relevantes para contexto
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '5')
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Buscar memórias mais recentes e relevantes
    const { data: memories, error } = await supabase
      .from('user_memories')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return NextResponse.json({ memories: memories || [] })
  } catch (error) {
    console.error('Erro ao buscar memórias:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar memórias' },
      { status: 500 }
    )
  }
}

// Função auxiliar para calcular similaridade simples
function calculateSimilarity(str1: string, str2: string): number {
  const words1 = str1.split(/\s+/)
  const words2 = str2.split(/\s+/)
  const intersection = words1.filter((word: string) => words2.includes(word))
  const union = [...new Set([...words1, ...words2])]
  return intersection.length / union.length
}

