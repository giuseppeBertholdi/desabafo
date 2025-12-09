import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminDashboardClient from './AdminDashboardClient'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  // Verificar autenticação
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')

  if (!session) {
    redirect('/admin/login')
  }

  return <AdminDashboardClient />
}

