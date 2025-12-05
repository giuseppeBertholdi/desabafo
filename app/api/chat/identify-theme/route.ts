import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
if (!GEMINI_API_KEY) {
  console.error('⚠️ GEMINI_API_KEY não está configurada!')
}
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '')

// Lista de temas disponíveis (deve corresponder aos temas no ChatClient)
const temasDisponiveis = [
  'ansiedade', 'relacionamento', 'trabalho', 'tristeza', 'dúvidas', 'conquistas',
  'sono', 'estudos', 'família', 'motivação', 'raiva', 'calma', 'objetivos',
  'amizade', 'crescimento', 'solidão', 'medo', 'estresse', 'autoestima',
  'perdas', 'mudanças', 'decisões', 'futuro', 'passado', 'presente', 'gratidão',
  'esperança', 'desânimo', 'confusão', 'alegria', 'orgulho', 'culpa', 'vergonha',
  'insegurança', 'comparação', 'perfeccionismo', 'procrastinação', 'rotina',
  'criatividade', 'sonhos', 'realidade', 'expectativas', 'aceitação', 'mudança',
  'autocuidado', 'limites', 'comunicação', 'intimidade', 'confiança', 'traição',
  'perdão', 'ciúmes', 'dependência', 'independência', 'liberdade', 'responsabilidade'
]

export async function POST(request: Request) {
  try {
    const { messages } = await request.json()

    if (!messages || messages.length === 0) {
      return NextResponse.json({ tema: null })
    }

    // Pegar apenas mensagens do usuário (últimas 10)
    const userMessages = messages
      .filter((m: any) => m.role === 'user')
      .slice(-10)
      .map((m: any) => m.content)
      .join('\n\n')

    if (userMessages.length < 20) {
      // Se tiver poucas mensagens, retornar null
      return NextResponse.json({ tema: null })
    }

    // Usar IA para identificar o tema
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
    
    const prompt = `Analise as seguintes mensagens de uma conversa e identifique o tema principal. 

Mensagens:
${userMessages}

Temas disponíveis: ${temasDisponiveis.join(', ')}

Responda APENAS com o nome do tema que melhor descreve a conversa. Se nenhum tema se encaixar perfeitamente, escolha o mais próximo. Se não conseguir identificar, responda "outro".

Responda apenas com o nome do tema, sem explicações:`

    const result = await model.generateContent(prompt)
    const temaIdentificado = result.response.text().trim().toLowerCase()

    // Verificar se o tema identificado está na lista
    const temaValido = temasDisponiveis.find(t => 
      temaIdentificado.includes(t) || t.includes(temaIdentificado)
    )

    return NextResponse.json({ 
      tema: temaValido || (temaIdentificado !== 'outro' ? temaIdentificado : null)
    })
  } catch (error) {
    console.error('Erro ao identificar tema:', error)
    return NextResponse.json({ tema: null })
  }
}

