import { AdminSessionDetail } from '@/features/sessions/components/AdminSessionDetail'
import { UserSessionDetail } from '@/features/sessions/components/UserSessionDetail'
import { useAppStore } from '@/store/useAppStore'

export default function SessionDetailPage() {
  const isAdmin = useAppStore((s) => s.user?.role === 'admin')
  return isAdmin ? <AdminSessionDetail /> : <UserSessionDetail />
}
