import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { authService } from '@/features/auth/services/auth.service'
import { useAppStore } from '@/store/useAppStore'

/**
 * Hook chung để logout: gọi API (best-effort), clear local token, clear store, navigate về /.
 * Trả về handler + trạng thái loading để gắn vào button.
 */
export function useLogout() {
  const navigate = useNavigate()
  const setUser = useAppStore((s) => s.setUser)
  const [busy, setBusy] = useState(false)

  async function logout(redirectTo = '/') {
    setBusy(true)
    try {
      await authService.logout()
    } catch {
      // ignore — client vẫn phải xoá token
    } finally {
      localStorage.removeItem('access_token')
      setUser(null)
      setBusy(false)
      navigate(redirectTo)
    }
  }

  return { logout, busy }
}
