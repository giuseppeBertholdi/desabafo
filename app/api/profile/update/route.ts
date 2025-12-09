import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { 
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
      .select('id, ai_settings')
      .eq('user_id', session.user.id)
      .maybeSingle()

    // Mesclar configurações existentes com as novas
    const currentSettings = existingProfile?.ai_settings || {}
    const updatedSettings = {
      ...currentSettings,
      slang_level: slangLevel || currentSettings.slang_level || 'moderado',
      playfulness: playfulness || currentSettings.playfulness || 'equilibrado',
      formality: formality || currentSettings.formality || 'informal',
      empathy_level: currentSettings.empathy_level || 'alto',
      response_length: currentSettings.response_length || 'medio'
    }

    const profileData = {
      age: age ? parseInt(age) : null,
      gender: gender || null,
      profession: profession || null,
      ai_settings: updatedSettings,
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
        .insert({
          user_id: session.user.id,
          ...profileData
        })

      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar perfil' },
      { status: 500 }
    )
  }
}

