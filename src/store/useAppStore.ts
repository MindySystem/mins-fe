import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'shop_manager' | 'staff'
}

interface AppState {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (isLoading: boolean) => void
  logout: () => void
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isLoading: false,

        setUser: (user) => set({ user }),
        setLoading: (isLoading) => set({ isLoading }),
        logout: () => {
          localStorage.removeItem('access_token')
          set({ user: null })
        },
      }),
      {
        name: 'sportcenter-storage', // name of item in localStorage
        partialize: (state) => ({ user: state.user }), // only persist the user
      },
    ),
    { name: 'AppStore' },
  ),
)
