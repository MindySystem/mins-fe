import { useEffect, useState, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { platformApi } from '@/services/platform'
import type { AccountType } from '@/store/useAppStore'
import { useAppStore } from '@/store/useAppStore'
import type { PlatformAppCode } from '@/core/platform/registry'

interface Props {
  children: ReactNode
}

type AccountRouteProps = Props & {
  allow: AccountType[]
  redirectTo?: string
}

type AppAccessRouteProps = Props & {
  appCode: PlatformAppCode
  allowCustomer?: boolean
}

function defaultRedirect(accountType?: AccountType) {
  return accountType === 'customer' ? '/services' : '/home'
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
 * Bảo vệ route admin module; Super Admin Portal sẽ tự kiểm tra isSeedAdmin.
 */
export function AdminRoute({ children }: Props) {
  const isAdmin = useAppStore((s) => Boolean(s.user?.isSeedAdmin || s.user?.role === 'admin'))
  if (!isAdmin) return <Navigate to="/home" replace />
  return <>{children}</>
}

/**
 * Bảo vệ route theo loại tài khoản Platform: customer hoặc business.
 */
export function AccountRoute({ children, allow, redirectTo }: AccountRouteProps) {
  const user = useAppStore((s) => s.user)

  if (!user) return <Navigate to="/auth/login" replace />
  if (user.isSeedAdmin) return <>{children}</>

  const accountType = user.accountType ?? 'customer'
  if (!allow.includes(accountType)) {
    return <Navigate to={redirectTo ?? defaultRedirect(accountType)} replace />
  }

  return <>{children}</>
}

/**
 * Chỉ Super Admin hệ thống được vào portal quản trị platform.
 */
export function SuperAdminRoute({ children }: Props) {
  const isSeedAdmin = useAppStore((s) => Boolean(s.user?.isSeedAdmin))
  if (!isSeedAdmin) return <Navigate to="/home" replace />
  return <>{children}</>
}

/**
 * Chặn truy cập trực tiếp vào app/module nếu workspace chưa có quyền.
 */
export function AppAccessRoute({ children, appCode, allowCustomer = false }: AppAccessRouteProps) {
  const user = useAppStore((s) => s.user)
  const currentWorkspaceId = useAppStore((s) => s.currentWorkspaceId)
  const installedApps = useAppStore((s) => s.workspaceAppMap[s.currentWorkspaceId] ?? [])
  const hasApp = installedApps.includes(appCode)
  const [remoteStatus, setRemoteStatus] = useState<'idle' | 'checking' | 'allowed' | 'denied'>('idle')

  useEffect(() => {
    if (!user || user.isSeedAdmin || user.accountType === 'customer' || hasApp || !currentWorkspaceId) {
      setRemoteStatus('idle')
      return
    }

    let active = true
    setRemoteStatus('checking')

    platformApi
      .openApp(currentWorkspaceId, appCode)
      .then(() => {
        if (active) setRemoteStatus('allowed')
      })
      .catch(() => {
        if (active) setRemoteStatus('denied')
      })

    return () => {
      active = false
    }
  }, [appCode, currentWorkspaceId, hasApp, user])

  if (!user) return <Navigate to="/auth/login" replace />
  if (user.isSeedAdmin) return <>{children}</>

  if (user.accountType === 'customer') {
    return allowCustomer ? <>{children}</> : <Navigate to="/services" replace />
  }

  if (hasApp || remoteStatus === 'allowed') {
    return <>{children}</>
  }

  if (remoteStatus === 'checking') {
    return null
  }

  if (!currentWorkspaceId || remoteStatus === 'denied') {
    return <Navigate to="/app-store" replace />
  }

  return null
}
