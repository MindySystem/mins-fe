import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

import { getTenantFromHostname, type TenantConfig } from '@/utils/tenant.util'

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'shop_manager' | 'staff'
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
