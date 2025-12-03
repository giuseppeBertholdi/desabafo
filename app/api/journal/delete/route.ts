import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function DELETE(request: Request) {
  try {
    const { entryId } = await request.json()
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    if (!entryId) {
      return NextResponse.json({ error: 'ID da entrada não fornecido' }, { status: 400 })
    }

    // Verificar se a entrada pertence ao usuário
    const { data: entryData, error: entryError } = await supabase
      .from('journal_entries')
      .select('user_id')
      .eq('id', entryId)
      .single()

    if (entryError || !entryData) {
      return NextResponse.json({ error: 'Entrada não encontrada' }, { status: 404 })
    }

    if (entryData.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    // Deletar a entrada
    const { error: deleteError } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', entryId)
      .eq('user_id', session.user.id)

    if (deleteError) {
      console.error('Erro ao deletar entrada:', deleteError)
      return NextResponse.json({ error: 'Erro ao deletar entrada' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro na API de deleção de entrada:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

