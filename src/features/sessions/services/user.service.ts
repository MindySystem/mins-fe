import api from '@/services/api'

import type { User } from '@/store/useAppStore'
import type { UserDetailResponse, UserStats } from '../types'

export const userService = {
  /**
   * Danh sách user — admin dùng cho trang "Quản lý thành viên".
   */
  async list(params: { q?: string; role?: string; excludeIds?: number[] } = {}): Promise<User[]> {
    const query: Record<string, string> = {}
    if (params.q) query.q = params.q
    if (params.role) query.role = params.role
    if (params.excludeIds && params.excludeIds.length) {
      query.exclude_ids = params.excludeIds.join(',')
    }
    const res = (await api.get('/users', { params: query })) as { data: User[] }
    return (res.data || []).map((u) => ({ ...u, id: Number(u.id) }))
  },

  /**
   * Lookup users theo danh sách ids — dùng cho mọi user authenticated (không cần admin).
   * Tránh phải fetch full list khi chỉ cần render tên 1 vài user.
   */
  async lookup(ids: Array<number | string>): Promise<User[]> {
    if (ids.length === 0) return []
    const res = (await api.get('/users/lookup', {
      params: { ids: ids.join(',') },
    })) as { data: User[] }
    return (res.data || []).map((u) => ({ ...u, id: Number(u.id) }))
  },

  /**
   * Chi tiết user + stats — admin dùng cho trang "Chi tiết thành viên".
   */
  async getWithStats(id: number | string): Promise<{ user: User; stats: UserStats }> {
    const res = (await api.get(`/users/${id}`)) as UserDetailResponse
    return {
      user: { ...res.data, id: Number(res.data.id) },
      stats: res.stats,
    }
  },
}
