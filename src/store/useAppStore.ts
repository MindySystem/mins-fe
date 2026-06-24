import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

import { getTenantFromHostname, type TenantConfig } from '@/utils/tenant.util'

export type UserRole = 'admin' | 'user' | 'shop_manager' | 'staff'

export interface User {
  id: number
  name: string
  email: string
  phone?: string
  gender?: 'male' | 'female' | 'other'
  role: UserRole
  createdAt?: string
}

interface AppState {
  user: User | null
  tenant: TenantConfig
  isLoading: boolean
  setUser: (user: User | null) => void
  setTenant: (tenant: TenantConfig) => void
  setLoading: (isLoading: boolean) => void
  logout: () => void
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        tenant: getTenantFromHostname(),
        isLoading: false,

        setUser: (user) => set({ user }),
        setTenant: (tenant) => set({ tenant }),
        setLoading: (isLoading) => set({ isLoading }),
        logout: () => {
          localStorage.removeItem('access_token')
          set({ user: null })
        },
      }),
      {
        name: 'sportcenter-storage',
        partialize: (state) => ({ user: state.user }),
      },
    ),
    { name: 'AppStore' },
  ),
)
