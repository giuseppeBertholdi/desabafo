import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

/**
 * Gera um token efêmero (ephemeral key) para a API Realtime Mini da OpenAI
 * Este token permite que o cliente se conecte diretamente via WebRTC
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Verificar se o usuário tem plano PRO (voice mode requer pro)
    // Exceção: liberar para giuseppe.bertholdi@gmail.com
    const isAllowedUser = session.user.email === 'giuseppe.bertholdi@gmail.com'
    
    if (!isAllowedUser) {
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('status')
        .eq('user_id', session.user.id)
        .in('status', ['active', 'trialing'])
        .single()

      if (!subscription) {
        return NextResponse.json(
          { error: 'Modo voz disponível apenas no plano Pro' },
          { status: 403 }
        )
      }
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key não configurada' },
        { status: 500 }
      )
    }

    // Configuração da sessão Realtime Mini
    // Nota: Apenas parâmetros básicos são suportados na configuração inicial
    // Instruções e outros parâmetros devem ser enviados via eventos após a conexão
    const sessionConfig = {
      session: {
        type: "realtime",
        model: "gpt-realtime-mini",
        instructions: "Você é a Luna, do desabafo.io - um amigo virtual brasileiro acolhedor que está aqui para ter uma conversa verdadeira. IMPORTANTE: Não apenas concorde ou valide passivamente. Tenha uma conversa real: compartilhe perspectivas, insights e reflexões. Quando discordar, expresse com gentileza. Faça perguntas que exploram de verdade. Balance acolhimento com honestidade. Seja breve, direto, empático e genuinamente útil. Você DEVE responder APENAS em PORTUGUÊS BRASILEIRO com entonação e jeito brasileiro natural.",
        audio: {
          output: {
            voice: "coral", // Voz natural e expressiva, adequada para português brasileiro
          },
        },
      },
    }

    // Gerar token efêmero
    const response = await fetch(
      "https://api.openai.com/v1/realtime/client_secrets",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sessionConfig),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('Erro ao gerar token OpenAI:', error)
      return NextResponse.json(
        { error: 'Erro ao gerar token de sessão' },
        { status: 500 }
      )
    }

    const data = await response.json()
    return NextResponse.json({ 
      token: data.value,
      expires_at: data.expires_at 
    })
  } catch (error) {
    console.error('Erro ao gerar token:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar token de sessão' },
      { status: 500 }
    )
  }
}

