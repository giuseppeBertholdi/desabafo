import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function DELETE(request: Request) {
  try {
    const { sessionId } = await request.json()
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    if (!sessionId) {
      return NextResponse.json({ error: 'ID da sessão não fornecido' }, { status: 400 })
    }

    // Verificar se a sessão pertence ao usuário
    const { data: sessionData, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('user_id')
      .eq('id', sessionId)
      .single()

    if (sessionError || !sessionData) {
      return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 404 })
    }

    if (sessionData.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    // Deletar todas as mensagens da sessão
    const { error: messagesError } = await supabase
      .from('chat_messages')
      .delete()
      .eq('session_id', sessionId)

    if (messagesError) {
      console.error('Erro ao deletar mensagens:', messagesError)
      return NextResponse.json({ error: 'Erro ao deletar mensagens' }, { status: 500 })
    }

    // Deletar a sessão
    const { error: deleteError } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', session.user.id)

    if (deleteError) {
      console.error('Erro ao deletar sessão:', deleteError)
      return NextResponse.json({ error: 'Erro ao deletar sessão' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro na API de deleção de sessão:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

