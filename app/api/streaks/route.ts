import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Atualizar streak do usuário
export async function POST(request: Request) {
  try {
    const { action } = await request.json() // 'chat' ou 'journal'
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]

    // Buscar streak atual
    const { data: existingStreak } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('type', action)
      .single()

    if (existingStreak) {
      const lastDate = new Date(existingStreak.last_activity_date)
      lastDate.setHours(0, 0, 0, 0)
      const lastDateStr = lastDate.toISOString().split('T')[0]
      const todayDate = new Date(todayStr)
      const lastDateObj = new Date(lastDateStr)
      const daysDiff = Math.floor((todayDate.getTime() - lastDateObj.getTime()) / (1000 * 60 * 60 * 24))

      if (daysDiff === 0) {
        // Já atualizou hoje, não fazer nada
        return NextResponse.json({ 
          success: true, 
          streak: existingStreak.current_streak,
          isNewRecord: false,
          alreadyUpdated: true
        })
      } else if (daysDiff === 1) {
        // Continua o streak
        const newStreak = existingStreak.current_streak + 1
        const isNewRecord = newStreak > (existingStreak.longest_streak || 0)

        await supabase
          .from('user_streaks')
          .update({
            current_streak: newStreak,
            longest_streak: isNewRecord ? newStreak : existingStreak.longest_streak,
            last_activity_date: todayStr,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingStreak.id)

        return NextResponse.json({ 
          success: true, 
          streak: newStreak,
          isNewRecord,
          alreadyUpdated: false
        })
      } else {
        // Streak quebrado, reiniciar
        await supabase
          .from('user_streaks')
          .update({
            current_streak: 1,
            last_activity_date: todayStr,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingStreak.id)

        return NextResponse.json({ 
          success: true, 
          streak: 1,
          isNewRecord: false,
          streakBroken: true,
          previousStreak: existingStreak.current_streak
        })
      }
    } else {
      // Criar novo streak
      const { data: newStreak, error } = await supabase
        .from('user_streaks')
        .insert({
          user_id: session.user.id,
          type: action,
          current_streak: 1,
          longest_streak: 1,
          last_activity_date: todayStr
        })
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({ 
        success: true, 
        streak: 1,
        isNewRecord: false,
        isFirstTime: true
      })
    }
  } catch (error) {
    console.error('Erro ao atualizar streak:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar streak' },
      { status: 500 }
    )
  }
}

// Buscar streaks do usuário
export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { data: streaks, error } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', session.user.id)

    if (error) throw error

    // Verificar se algum streak está em risco (última atividade foi hoje, mas pode perder amanhã)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const streaksWithStatus = (streaks || []).map((streak: any) => {
      const lastDate = new Date(streak.last_activity_date)
      lastDate.setHours(0, 0, 0, 0)
      const daysSinceLastActivity = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
      
      return {
        ...streak,
        isAtRisk: daysSinceLastActivity === 0 && streak.current_streak > 0, // Pode perder amanhã se não usar
        daysSinceLastActivity
      }
    })

    return NextResponse.json({ streaks: streaksWithStatus })
  } catch (error) {
    console.error('Erro ao buscar streaks:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar streaks' },
      { status: 500 }
    )
  }
}

