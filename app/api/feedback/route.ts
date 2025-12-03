import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { feedback } = await request.json()
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    if (!feedback || !feedback.trim()) {
      return NextResponse.json({ error: 'Feedback não pode estar vazio' }, { status: 400 })
    }

    // Salvar feedback no banco
    const { error } = await supabase
      .from('user_feedback')
      .insert({
        user_id: session.user.id,
        user_email: session.user.email || 'sem-email',
        feedback: feedback.trim(),
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('Erro ao salvar feedback:', error)
      return NextResponse.json(
        { error: 'Erro ao salvar feedback' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Feedback enviado com sucesso' })
  } catch (error: any) {
    console.error('Erro ao processar feedback:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao processar feedback' },
      { status: 500 }
    )
  }
}

