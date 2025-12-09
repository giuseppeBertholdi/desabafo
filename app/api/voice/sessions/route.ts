import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const MAX_SESSIONS = 50
const MAX_DURATION_SECONDS = 600 // 10 minutos

// GET - Listar sessões de voz do usuário
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Buscar todas as sessões do usuário ordenadas por data
    const { data: voiceSessions, error } = await supabase
      .from('voice_sessions')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar sessões de voz:', error)
      return NextResponse.json({ error: 'Erro ao buscar sessões' }, { status: 500 })
    }

    // Contar quantas sessões foram usadas
    const completedSessions = voiceSessions?.filter(s => s.is_completed || s.ended_at).length || 0
    const remainingSessions = MAX_SESSIONS - completedSessions

    // Verificar se existe uma sessão não finalizada
    const incompleteSession = voiceSessions?.find(s => !s.is_completed && !s.ended_at)

    return NextResponse.json({
      sessions: voiceSessions || [],
      stats: {
        total: MAX_SESSIONS,
        used: completedSessions,
        remaining: remainingSessions,
        hasIncompleteSession: !!incompleteSession,
        incompleteSessionId: incompleteSession?.id || null,
        incompleteSessionDuration: incompleteSession?.duration_seconds || 0
      }
    })

  } catch (error) {
    console.error('Erro ao processar requisição:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST - Criar nova sessão de voz
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Verificar se o usuário é PRO
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('tier')
      .eq('user_id', session.user.id)
      .single()

    if (!profile || profile.tier !== 'pro') {
      return NextResponse.json({ error: 'Modo voz disponível apenas no plano PRO' }, { status: 403 })
    }

    // Contar quantas sessões já foram usadas
    const { data: completedCount } = await supabase
      .rpc('count_user_voice_sessions', { p_user_id: session.user.id })

    if (completedCount >= MAX_SESSIONS) {
      return NextResponse.json({ 
        error: 'Você atingiu o limite de 50 sessões de voz',
        limit: true
      }, { status: 429 })
    }

    // Verificar se já existe uma sessão não finalizada
    const { data: incompleteSessionId } = await supabase
      .rpc('get_last_incomplete_voice_session', { p_user_id: session.user.id })

    if (incompleteSessionId) {
      return NextResponse.json({
        error: 'Você tem uma sessão não finalizada. Continue-a ou finalize antes de criar uma nova.',
        hasIncompleteSession: true,
        incompleteSessionId: incompleteSessionId
      }, { status: 400 })
    }

    // Criar nova sessão
    const { data: newSession, error: insertError } = await supabase
      .from('voice_sessions')
      .insert([
        {
          user_id: session.user.id,
          duration_seconds: 0,
          is_completed: false,
          started_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (insertError) {
      console.error('Erro ao criar sessão:', insertError)
      return NextResponse.json({ error: 'Erro ao criar sessão' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      session: newSession,
      message: 'Sessão criada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao processar requisição:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PUT - Atualizar sessão (duração, transcrição, finalizar)
export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { sessionId, duration_seconds, transcript, summary, is_completed } = body

    if (!sessionId) {
      return NextResponse.json({ error: 'ID da sessão é obrigatório' }, { status: 400 })
    }

    // Verificar se a sessão pertence ao usuário
    const { data: voiceSession, error: fetchError } = await supabase
      .from('voice_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', session.user.id)
      .single()

    if (fetchError || !voiceSession) {
      return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 404 })
    }

    // Verificar se não excedeu o tempo máximo
    if (duration_seconds && duration_seconds > MAX_DURATION_SECONDS) {
      return NextResponse.json({ 
        error: 'Tempo máximo de 10 minutos atingido',
        maxDuration: true
      }, { status: 400 })
    }

    // Preparar dados para atualização
    const updateData: any = {}
    if (duration_seconds !== undefined) updateData.duration_seconds = duration_seconds
    if (transcript !== undefined) updateData.transcript = transcript
    if (summary !== undefined) updateData.summary = summary
    if (is_completed !== undefined) {
      updateData.is_completed = is_completed
      if (is_completed) {
        updateData.ended_at = new Date().toISOString()
      }
    }

    // Atualizar sessão
    const { data: updatedSession, error: updateError } = await supabase
      .from('voice_sessions')
      .update(updateData)
      .eq('id', sessionId)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao atualizar sessão:', updateError)
      return NextResponse.json({ error: 'Erro ao atualizar sessão' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      session: updatedSession,
      message: 'Sessão atualizada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao processar requisição:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

