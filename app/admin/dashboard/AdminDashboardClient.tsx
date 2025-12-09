'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

interface Stats {
  overview: {
    totalUsers: number
    totalSessions: number
    totalMessages: number
    totalMessagesSent: number
    totalVoiceMinutes: number
    activeSubscriptions: number
  }
  planDistribution: {
    free: number
    essential: number
    pro: number
  }
  monthlyStats: Array<{
    month: string
    messages: number
    voiceMinutes: number
  }>
  recentUsers: Array<any>
  recentSessions: Array<any>
}

interface User {
  id: string
  email: string
  name: string
  createdAt: string
  stats: {
    sessions: number
    messages: number
    messagesThisMonth: number
    voiceMinutesThisMonth: number
    plan: string
    subscriptionStatus: string | null
  }
}

export default function AdminDashboardClient() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'users'>('overview')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    loadStats()
    loadUsers()
  }, [])

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.status === 401) {
        router.push('/admin/login')
        return
      }
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async (page = 1) => {
    try {
      const response = await fetch(`/api/admin/users?page=${page}&limit=50`)
      if (response.status === 401) {
        router.push('/admin/login')
        return
      }
      const data = await response.json()
      setUsers(data.users)
      setCurrentPage(page)
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-red-600">Erro ao carregar dados</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              📊 Admin Dashboard
            </h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex space-x-4 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'overview'
                ? 'text-pink-600 border-b-2 border-pink-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'users'
                ? 'text-pink-600 border-b-2 border-pink-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Usuários
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard
                title="Total de Usuários"
                value={stats.overview.totalUsers}
                icon="👥"
                color="blue"
              />
              <StatCard
                title="Sessões de Chat"
                value={stats.overview.totalSessions}
                icon="💬"
                color="green"
              />
              <StatCard
                title="Mensagens Enviadas"
                value={stats.overview.totalMessagesSent.toLocaleString()}
                icon="📨"
                color="purple"
              />
              <StatCard
                title="Minutos de Voz"
                value={Math.round(stats.overview.totalVoiceMinutes).toLocaleString()}
                icon="🎤"
                color="pink"
              />
              <StatCard
                title="Assinaturas Ativas"
                value={stats.overview.activeSubscriptions}
                icon="⭐"
                color="yellow"
              />
              <StatCard
                title="Mensagens Totais"
                value={stats.overview.totalMessages.toLocaleString()}
                icon="📊"
                color="indigo"
              />
            </div>

            {/* Distribuição de Planos */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Distribuição de Planos
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <PlanCard plan="Free" count={stats.planDistribution.free} color="gray" />
                <PlanCard plan="Essential" count={stats.planDistribution.essential} color="blue" />
                <PlanCard plan="Pro" count={stats.planDistribution.pro} color="pink" />
              </div>
            </div>

            {/* Gráfico de Uso Mensal */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Uso Mensal (Últimos 6 Meses)
              </h2>
              <div className="space-y-4">
                {stats.monthlyStats.map((month, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-24 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(month.month + '-01').toLocaleDateString('pt-BR', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                          <div
                            className="bg-pink-500 h-full"
                            style={{
                              width: `${Math.min((month.messages / 1000) * 100, 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400 w-20 text-right">
                          {month.messages} msgs
                        </span>
                      </div>
                      {month.voiceMinutes > 0 && (
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                            <div
                              className="bg-blue-500 h-full"
                              style={{
                                width: `${Math.min((month.voiceMinutes / 100) * 100, 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400 w-20 text-right">
                            {month.voiceMinutes} min
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Usuários Recentes */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Usuários Recentes
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Data de Criação
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {stats.recentUsers.slice(0, 5).map((user: any) => (
                      <tr key={user.id}>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {user.email}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {new Date(user.created_at).toLocaleDateString('pt-BR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Todos os Usuários
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Nome/Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Plano
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Sessões
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Mensagens
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Este Mês
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Voz (min)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Criado em
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                          {user.id.substring(0, 8)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            user.stats.plan === 'pro'
                              ? 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400'
                              : user.stats.plan === 'essential'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                          }`}
                        >
                          {user.stats.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {user.stats.sessions}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {user.stats.messages}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {user.stats.messagesThisMonth}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {Math.round(user.stats.voiceMinutesThisMonth)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <button
                onClick={() => loadUsers(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Página {currentPage}
              </span>
              <button
                onClick={() => loadUsers(currentPage + 1)}
                disabled={users.length < 50}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string
  value: string | number
  icon: string
  color: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </motion.div>
  )
}

function PlanCard({
  plan,
  count,
  color,
}: {
  plan: string
  count: number
  color: string
}) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-center">
      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{count}</div>
      <div className="text-sm text-gray-600 dark:text-gray-400">{plan}</div>
    </div>
  )
}

