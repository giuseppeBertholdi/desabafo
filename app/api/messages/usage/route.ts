import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const MAX_FREE_MESSAGES = 120 // Limite máximo de 120 mensagens por mês para plano free

// GET - Buscar uso de mensagens do usuário no mês atual
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Formato do mês atual: "2024-12"
    const now = new Date()
    const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    // Buscar uso do mês atual
    const { data, error } = await supabase
      .from('message_usage')
      .select('messages_sent')
      .eq('user_id', session.user.id)
      .eq('month_year', monthYear)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Erro ao buscar uso de mensagens:', error)
      return NextResponse.json({ error: 'Erro ao buscar uso de mensagens' }, { status: 500 })
    }

    const messagesSent = data?.messages_sent || 0
    const remainingMessages = Math.max(0, MAX_FREE_MESSAGES - messagesSent)
    const isLimitReached = messagesSent >= MAX_FREE_MESSAGES
    const percentage = Math.min(100, (messagesSent / MAX_FREE_MESSAGES) * 100)

    return NextResponse.json({
      messagesSent: Number(messagesSent),
      maxMessages: MAX_FREE_MESSAGES,
      remainingMessages: Number(remainingMessages),
      isLimitReached,
      percentage: Number(percentage.toFixed(1)),
      monthYear
    })
  } catch (error) {
    console.error('Erro ao buscar uso de mensagens:', error)
    return NextResponse.json({ error: 'Erro ao buscar uso de mensagens' }, { status: 500 })
  }
}

// POST - Registrar uso de mensagens (incrementar contador)
export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { count = 1 } = await request.json()

    if (!count || count <= 0) {
      return NextResponse.json({ error: 'Contador inválido' }, { status: 400 })
    }

    // Formato do mês atual: "2024-12"
    const now = new Date()
    const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    // Buscar uso atual
    const { data: existingData } = await supabase
      .from('message_usage')
      .select('messages_sent')
      .eq('user_id', session.user.id)
      .eq('month_year', monthYear)
      .single()

    const currentMessages = existingData?.messages_sent || 0
    const newTotal = Number(currentMessages) + Number(count)

    // Verificar se ultrapassou o limite
    if (newTotal > MAX_FREE_MESSAGES) {
      return NextResponse.json({
        error: 'Limite de mensagens atingido',
        messagesSent: Number(currentMessages),
        maxMessages: MAX_FREE_MESSAGES,
        isLimitReached: true,
        percentage: 100
      }, { status: 403 })
    }

    // Inserir ou atualizar uso
    const { error: upsertError } = await supabase
      .from('message_usage')
      .upsert({
        user_id: session.user.id,
        month_year: monthYear,
        messages_sent: newTotal
      }, {
        onConflict: 'user_id,month_year'
      })

    if (upsertError) {
      console.error('Erro ao atualizar uso de mensagens:', upsertError)
      return NextResponse.json({ error: 'Erro ao atualizar uso de mensagens' }, { status: 500 })
    }

    const remainingMessages = Math.max(0, MAX_FREE_MESSAGES - newTotal)
    const percentage = Math.min(100, (newTotal / MAX_FREE_MESSAGES) * 100)

    return NextResponse.json({
      messagesSent: Number(newTotal),
      maxMessages: MAX_FREE_MESSAGES,
      remainingMessages: Number(remainingMessages),
      isLimitReached: newTotal >= MAX_FREE_MESSAGES,
      percentage: Number(percentage.toFixed(1)),
      monthYear
    })
  } catch (error) {
    console.error('Erro ao registrar uso de mensagens:', error)
    return NextResponse.json({ error: 'Erro ao registrar uso de mensagens' }, { status: 500 })
  }
}

