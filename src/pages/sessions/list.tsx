import { AdminSessionsView } from '@/features/sessions/components/AdminSessionsView'
import { UserSessionsView } from '@/features/sessions/components/UserSessionsView'
import { useAppStore } from '@/store/useAppStore'

export default function SessionsListPage() {
  const isAdmin = useAppStore((s) => s.user?.role === 'admin')
  return isAdmin ? <AdminSessionsView /> : <UserSessionsView />
}
