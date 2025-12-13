import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const MAX_VOICE_MINUTES = 500 // Limite máximo de 500 minutos por mês

// GET - Buscar uso de voz do usuário no mês atual
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
      .from('voice_usage')
      .select('minutes_used')
      .eq('user_id', session.user.id)
      .eq('month_year', monthYear)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Erro ao buscar uso de voz:', error)
      return NextResponse.json({ error: 'Erro ao buscar uso de voz' }, { status: 500 })
    }

    const minutesUsed = Number(data?.minutes_used || 0)
    // Garantir que nunca ultrapasse o limite (caso haja algum problema no banco)
    const cappedMinutes = Math.min(minutesUsed, MAX_VOICE_MINUTES)
    const remainingMinutes = Math.max(0, MAX_VOICE_MINUTES - cappedMinutes)
    const isLimitReached = cappedMinutes >= MAX_VOICE_MINUTES

    return NextResponse.json({
      minutesUsed: Number(cappedMinutes),
      maxMinutes: MAX_VOICE_MINUTES,
      remainingMinutes: Number(remainingMinutes),
      isLimitReached,
      monthYear
    })
  } catch (error) {
    console.error('Erro ao buscar uso de voz:', error)
    return NextResponse.json({ error: 'Erro ao buscar uso de voz' }, { status: 500 })
  }
}

// POST - Registrar uso de voz (adicionar minutos)
export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { minutes } = await request.json()

    if (!minutes || minutes <= 0) {
      return NextResponse.json({ error: 'Minutos inválidos' }, { status: 400 })
    }

    // Formato do mês atual: "2024-12"
    const now = new Date()
    const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    // Buscar uso atual
    const { data: existingData } = await supabase
      .from('voice_usage')
      .select('minutes_used')
      .eq('user_id', session.user.id)
      .eq('month_year', monthYear)
      .single()

    const currentMinutes = Number(existingData?.minutes_used || 0)
    
    // Verificar se já atingiu o limite ANTES de adicionar novos minutos
    if (currentMinutes >= MAX_VOICE_MINUTES) {
      return NextResponse.json({
        error: 'Limite de minutos atingido',
        minutesUsed: currentMinutes,
        maxMinutes: MAX_VOICE_MINUTES,
        remainingMinutes: 0,
        isLimitReached: true
      }, { status: 403 })
    }

    const minutesToAdd = Number(minutes)
    const newTotal = currentMinutes + minutesToAdd

    // Verificar se ultrapassaria o limite (RÍGIDO - não permite ultrapassar)
    if (newTotal > MAX_VOICE_MINUTES) {
      // Não permite ultrapassar - retorna erro
      return NextResponse.json({
        error: 'Limite de minutos atingido',
        minutesUsed: currentMinutes,
        maxMinutes: MAX_VOICE_MINUTES,
        remainingMinutes: Math.max(0, MAX_VOICE_MINUTES - currentMinutes),
        isLimitReached: true
      }, { status: 403 })
    }

    // Inserir ou atualizar uso
    const { error: upsertError } = await supabase
      .from('voice_usage')
      .upsert({
        user_id: session.user.id,
        month_year: monthYear,
        minutes_used: newTotal
      }, {
        onConflict: 'user_id,month_year'
      })

    if (upsertError) {
      console.error('Erro ao atualizar uso de voz:', upsertError)
      return NextResponse.json({ error: 'Erro ao atualizar uso de voz' }, { status: 500 })
    }

    const remainingMinutes = Math.max(0, MAX_VOICE_MINUTES - newTotal)

    return NextResponse.json({
      minutesUsed: Number(newTotal),
      maxMinutes: MAX_VOICE_MINUTES,
      remainingMinutes: Number(remainingMinutes),
      isLimitReached: newTotal >= MAX_VOICE_MINUTES,
      monthYear
    })
  } catch (error) {
    console.error('Erro ao registrar uso de voz:', error)
    return NextResponse.json({ error: 'Erro ao registrar uso de voz' }, { status: 500 })
  }
}

