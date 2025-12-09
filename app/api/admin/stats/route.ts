import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createSupabaseAdmin } from '@/lib/supabaseAdmin'

// Verificar autenticação do admin
async function checkAdminAuth() {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')
  
  if (!session) {
    return false
  }
  return true
}

export async function GET(request: NextRequest) {
  // Verificar autenticação
  const isAuthenticated = await checkAdminAuth()
  if (!isAuthenticated) {
    return NextResponse.json(
      { error: 'Não autenticado' },
      { status: 401 }
    )
  }

  try {
    const supabase = createSupabaseAdmin()

    // Buscar estatísticas gerais
    const [
      { count: totalSessions },
      { count: totalMessages },
      { count: totalSubscriptions },
      { data: messageUsage },
      { data: voiceUsage },
      { data: recentSessions },
      { data: allSubscriptions },
    ] = await Promise.all([
      supabase.from('chat_sessions').select('*', { count: 'exact', head: true }),
      supabase.from('messages').select('*', { count: 'exact', head: true }),
      supabase.from('user_subscriptions').select('*', { count: 'exact', head: true }).in('status', ['active', 'trialing']),
      supabase.from('message_usage').select('*'),
      supabase.from('voice_usage').select('*'),
      supabase.from('chat_sessions').select('id, user_id, created_at, title').order('created_at', { ascending: false }).limit(10),
      supabase.from('user_subscriptions').select('user_id').in('status', ['active', 'trialing']),
    ])

    // Contar usuários únicos através das sessões e subscriptions
    const { data: uniqueUsersFromSessions } = await supabase
      .from('chat_sessions')
      .select('user_id')
    
    const uniqueUserIds = new Set([
      ...(uniqueUsersFromSessions?.map(s => s.user_id) || []),
      ...(allSubscriptions?.map(s => s.user_id) || []),
    ])
    const totalUsers = uniqueUserIds.size

    // Buscar informações de usuários recentes através de user_profiles se existir
    let recentUsers: any[] = []
    try {
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('user_id, created_at')
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (profiles) {
        recentUsers = profiles.map(p => ({
          id: p.user_id,
          created_at: p.created_at,
        }))
      }
    } catch (error) {
      // Tabela pode não existir, usar dados de sessões
      const recentSessionsData = recentSessions || []
      recentUsers = recentSessionsData.map((s: any) => ({
        id: s.user_id,
        created_at: s.created_at,
      }))
    }

    // Calcular estatísticas de uso de mensagens
    const totalMessagesSent = messageUsage?.reduce((sum, usage) => sum + (usage.messages_sent || 0), 0) || 0
    const totalVoiceMinutes = voiceUsage?.reduce((sum, usage) => sum + (parseFloat(usage.minutes_used) || 0), 0) || 0

    // Buscar distribuição de planos
    const { data: subscriptions } = await supabase
      .from('user_subscriptions')
      .select('plan_type, status')
      .in('status', ['active', 'trialing'])

    const planDistribution = {
      free: (totalUsers || 0) - (subscriptions?.length || 0),
      essential: subscriptions?.filter(s => s.plan_type === 'essential').length || 0,
      pro: subscriptions?.filter(s => s.plan_type === 'pro' || !s.plan_type).length || 0,
    }

    // Estatísticas por mês (últimos 6 meses)
    const now = new Date()
    const monthlyStats = []
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthYear = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`
      
      const monthMessages = messageUsage?.filter(m => m.month_year === monthYear).reduce((sum, m) => sum + (m.messages_sent || 0), 0) || 0
      const monthVoice = voiceUsage?.filter(v => v.month_year === monthYear).reduce((sum, v) => sum + (parseFloat(v.minutes_used) || 0), 0) || 0

      monthlyStats.push({
        month: monthYear,
        messages: monthMessages,
        voiceMinutes: Math.round(monthVoice),
      })
    }

    return NextResponse.json({
      overview: {
        totalUsers: totalUsers || 0,
        totalSessions: totalSessions || 0,
        totalMessages: totalMessages || 0,
        totalMessagesSent,
        totalVoiceMinutes: Math.round(totalVoiceMinutes),
        activeSubscriptions: totalSubscriptions || 0,
      },
      planDistribution,
      monthlyStats,
      recentUsers: recentUsers || [],
      recentSessions: recentSessions || [],
    })
  } catch (error: any) {
    console.error('Erro ao buscar estatísticas:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar estatísticas' },
      { status: 500 }
    )
  }
}

