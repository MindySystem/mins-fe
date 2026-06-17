import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { useAppStore } from '@/store/useAppStore'

interface Props {
  children: ReactNode
}

/**
 * Bảo vệ route cần đăng nhập — chưa login thì đẩy về /auth/login.
 */
export function ProtectedRoute({ children }: Props) {
  const user = useAppStore((s) => s.user)
  const location = useLocation()

  if (!user) {
    return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />
  }
  return <>{children}</>
}

/**
 * Bảo vệ route chỉ dành cho admin — không phải admin thì đẩy về /sessions.
 */
export function AdminRoute({ children }: Props) {
  const isAdmin = useAppStore((s) => s.user?.role === 'admin')
  if (!isAdmin) return <Navigate to="/sessions" replace />
  return <>{children}</>
}
