import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createSupabaseAdmin } from '@/lib/supabaseAdmin'

async function checkAdminAuth() {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')
  return !!session
}

export async function GET(request: NextRequest) {
  const isAuthenticated = await checkAdminAuth()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  try {
    const supabase = createSupabaseAdmin()
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Buscar usuários únicos através de sessões e subscriptions
    const { data: allSessions } = await supabase
      .from('chat_sessions')
      .select('user_id, created_at')
      .order('created_at', { ascending: false })

    const { data: allSubscriptions } = await supabase
      .from('user_subscriptions')
      .select('user_id')

    // Combinar e obter IDs únicos
    const allUserIds = new Set([
      ...(allSessions?.map(s => s.user_id) || []),
      ...(allSubscriptions?.map(s => s.user_id) || []),
    ])

    const uniqueUserIds = Array.from(allUserIds)
    const totalUsers = uniqueUserIds.length
    const offset = (page - 1) * limit
    const paginatedUserIds = uniqueUserIds.slice(offset, offset + limit)

    // Buscar informações adicionais para cada usuário
    const usersWithStats = await Promise.all(
      paginatedUserIds.map(async (userId) => {
        const [sessions, messages, subscriptionResult, messageUsageResult, voiceUsageResult, firstSessionResult] = await Promise.all([
          supabase.from('chat_sessions').select('*', { count: 'exact', head: true }).eq('user_id', userId),
          supabase.from('messages').select('*', { count: 'exact', head: true }).eq('user_id', userId),
          supabase.from('user_subscriptions').select('plan_type, status').eq('user_id', userId).in('status', ['active', 'trialing']).maybeSingle(),
          supabase.from('message_usage').select('messages_sent').eq('user_id', userId).order('month_year', { ascending: false }).limit(1).maybeSingle(),
          supabase.from('voice_usage').select('minutes_used').eq('user_id', userId).order('month_year', { ascending: false }).limit(1).maybeSingle(),
          supabase.from('chat_sessions').select('created_at').eq('user_id', userId).order('created_at', { ascending: true }).limit(1).maybeSingle(),
        ])

        const subscription = subscriptionResult.data
        const messageUsage = messageUsageResult.data
        const voiceUsage = voiceUsageResult.data
        const firstSession = firstSessionResult.data

        // Tentar buscar perfil do usuário
        let userEmail = 'N/A'
        let userName = 'Sem nome'
        try {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle()
          
          if (profile) {
            userName = profile.name || profile.full_name || 'Sem nome'
          }
        } catch (error) {
          // Tabela pode não existir
        }

        return {
          id: userId,
          email: userEmail,
          name: userName,
          createdAt: firstSession?.created_at || new Date().toISOString(),
          stats: {
            sessions: sessions.count || 0,
            messages: messages.count || 0,
            messagesThisMonth: messageUsage?.messages_sent || 0,
            voiceMinutesThisMonth: parseFloat(voiceUsage?.minutes_used || '0'),
            plan: subscription?.plan_type || (subscription ? 'pro' : 'free'),
            subscriptionStatus: subscription?.status || null,
          },
        }
      })
    )

    return NextResponse.json({
      users: usersWithStats,
      pagination: {
        page,
        limit,
        total: totalUsers || 0,
        totalPages: Math.ceil((totalUsers || 0) / limit),
      },
    })
  } catch (error: any) {
    console.error('Erro ao buscar usuários:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar usuários' },
      { status: 500 }
    )
  }
}

