import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { 
      nickname, 
      preferredName, 
      age, 
      gender, 
      profession,
      slangLevel,
      playfulness,
      formality
    } = await request.json()
    
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Verificar se já existe perfil
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .maybeSingle()

    const profileData = {
      user_id: session.user.id,
      nickname: nickname || null,
      preferred_name: preferredName || null,
      age: age ? parseInt(age) : null,
      gender: gender || null,
      profession: profession || null,
      ai_settings: {
        slang_level: slangLevel || 'moderado',
        playfulness: playfulness || 'equilibrado',
        formality: formality || 'informal',
        empathy_level: 'alto',
        response_length: 'medio'
      },
      onboarding_completed: true,
      updated_at: new Date().toISOString()
    }

    if (existingProfile) {
      // Atualizar perfil existente
      const { error } = await supabase
        .from('user_profiles')
        .update(profileData)
        .eq('user_id', session.user.id)

      if (error) throw error
    } else {
      // Criar novo perfil
      const { error } = await supabase
        .from('user_profiles')
        .insert(profileData)

      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao salvar onboarding:', error)
    return NextResponse.json(
      { error: 'Erro ao salvar dados do onboarding' },
      { status: 500 }
    )
  }
}

