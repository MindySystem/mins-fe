import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

import {
  type PlatformAppCode,
  type PlatformWorkspace,
} from '@/core/platform/registry'
import { getTenantFromHostname, type TenantConfig } from '@/utils/tenant.util'

export type UserRole = 'admin' | 'user' | 'shop_manager' | 'staff'
export type AccountType = 'customer' | 'business'
export type SkillLevel = 'beginner' | 'casual' | 'intermediate' | 'advanced'

export interface User {
  id: number
  name: string
  email: string
  phone?: string
  accountType?: AccountType
  gender?: 'male' | 'female' | 'other'
  skillLevel?: SkillLevel
  isSeedAdmin?: boolean
  role: UserRole
  createdAt?: string
}

type PlatformContextSnapshot = {
  currentWorkspaceId: string
  workspaces: PlatformWorkspace[]
  workspaceAppMap: Record<string, PlatformAppCode[]>
  workspaceUserAccessMap: Record<string, Record<number, PlatformAppCode[]>>
}

type PlatformContextUpdate = Omit<PlatformContextSnapshot, 'workspaceUserAccessMap'> & {
  workspaceUserAccessMap?: Record<string, Record<number, PlatformAppCode[]>>
}

interface AppState {
  user: User | null
  tenant: TenantConfig
  isLoading: boolean
  currentWorkspaceId: string
  workspaces: PlatformWorkspace[]
  workspaceAppMap: Record<string, PlatformAppCode[]>
  workspaceUserAccessMap: Record<string, Record<number, PlatformAppCode[]>>
  setUser: (user: User | null) => void
  setTenant: (tenant: TenantConfig) => void
  setLoading: (isLoading: boolean) => void
  syncPlatformContext: (context: PlatformContextUpdate) => void
  setCurrentWorkspaceId: (workspaceId: string) => void
  upsertWorkspace: (workspace: PlatformWorkspace, appCodes?: PlatformAppCode[], userId?: number) => void
  installApp: (appCode: PlatformAppCode, workspaceId?: string) => void
  uninstallApp: (appCode: PlatformAppCode, workspaceId?: string) => void
  grantUserAppAccess: (workspaceId: string, userId: number, appCode: PlatformAppCode) => void
  revokeUserAppAccess: (workspaceId: string, userId: number, appCode: PlatformAppCode) => void
  logout: () => void
}

const emptyPlatformContext: PlatformContextSnapshot = {
  currentWorkspaceId: '',
  workspaces: [],
  workspaceAppMap: {},
  workspaceUserAccessMap: {},
}

const legacyWorkspaceIds = new Set([
  'court-hub',
  'team-smash',
  'moto-pro',
  'personal-park',
  'platform-admin',
])

function shouldResetLegacyContext(workspaces: unknown): boolean {
  if (!Array.isArray(workspaces) || workspaces.length === 0) {
    return false
  }

  const ids = workspaces
    .map((workspace) =>
      workspace && typeof workspace === 'object' && 'id' in workspace && typeof workspace.id === 'string'
        ? workspace.id
        : null,
    )
    .filter((id): id is string => Boolean(id))

  return ids.length > 0 && ids.every((id) => legacyWorkspaceIds.has(id))
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        tenant: getTenantFromHostname(),
        isLoading: false,
        ...emptyPlatformContext,

        setUser: (user) => set({ user }),
        setTenant: (tenant) => set({ tenant }),
        setLoading: (isLoading) => set({ isLoading }),
        syncPlatformContext: (context) =>
          set((state) => ({
            currentWorkspaceId: context.currentWorkspaceId,
            workspaces: context.workspaces,
            workspaceAppMap: context.workspaceAppMap,
            workspaceUserAccessMap: context.workspaceUserAccessMap ?? state.workspaceUserAccessMap,
          })),
        setCurrentWorkspaceId: (workspaceId) => set({ currentWorkspaceId: workspaceId }),
        upsertWorkspace: (workspace, appCodes = [], userId) =>
          set((state) => {
            const existing = state.workspaces.some((item) => item.id === workspace.id)
            const workspaces = existing
              ? state.workspaces.map((item) => (item.id === workspace.id ? workspace : item))
              : [workspace, ...state.workspaces]

            return {
              currentWorkspaceId: workspace.id,
              workspaces,
              workspaceAppMap: {
                ...state.workspaceAppMap,
                [workspace.id]: appCodes,
              },
              workspaceUserAccessMap: userId
                ? {
                    ...state.workspaceUserAccessMap,
                    [workspace.id]: {
                      ...(state.workspaceUserAccessMap[workspace.id] ?? {}),
                      [userId]: appCodes,
                    },
                  }
                : state.workspaceUserAccessMap,
            }
          }),
        installApp: (appCode, workspaceId) =>
          set((state) => {
            const targetWorkspaceId = workspaceId ?? state.currentWorkspaceId
            const current = state.workspaceAppMap[targetWorkspaceId] ?? []

            if (current.includes(appCode)) return state

            return {
              workspaceAppMap: {
                ...state.workspaceAppMap,
                [targetWorkspaceId]: [...current, appCode],
              },
            }
          }),
        uninstallApp: (appCode, workspaceId) =>
          set((state) => {
            const targetWorkspaceId = workspaceId ?? state.currentWorkspaceId
            const current = state.workspaceAppMap[targetWorkspaceId] ?? []

            return {
              workspaceAppMap: {
                ...state.workspaceAppMap,
                [targetWorkspaceId]: current.filter((code) => code !== appCode),
              },
            }
          }),
        grantUserAppAccess: (workspaceId, userId, appCode) =>
          set((state) => {
            const workspaceAccess = state.workspaceUserAccessMap[workspaceId] ?? {}
            const current = workspaceAccess[userId] ?? []

            if (current.includes(appCode)) return state

            return {
              workspaceUserAccessMap: {
                ...state.workspaceUserAccessMap,
                [workspaceId]: {
                  ...workspaceAccess,
                  [userId]: [...current, appCode],
                },
              },
            }
          }),
        revokeUserAppAccess: (workspaceId, userId, appCode) =>
          set((state) => {
            const workspaceAccess = state.workspaceUserAccessMap[workspaceId] ?? {}
            const current = workspaceAccess[userId] ?? []

            return {
              workspaceUserAccessMap: {
                ...state.workspaceUserAccessMap,
                [workspaceId]: {
                  ...workspaceAccess,
                  [userId]: current.filter((code) => code !== appCode),
                },
              },
            }
          }),
        logout: () => {
          localStorage.removeItem('access_token')
          set({ user: null, ...emptyPlatformContext })
        },
      }),
      {
        name: 'sportcenter-storage',
        version: 2,
        migrate: (persistedState, version) => {
          const state = (persistedState ?? {}) as Partial<AppState>

          if (version < 2 && shouldResetLegacyContext(state.workspaces)) {
            return {
              user: state.user ?? null,
              ...state,
              ...emptyPlatformContext,
            }
          }

          return {
            user: state.user ?? null,
            currentWorkspaceId: state.currentWorkspaceId ?? '',
            workspaces: state.workspaces ?? [],
            workspaceAppMap: state.workspaceAppMap ?? {},
            workspaceUserAccessMap: state.workspaceUserAccessMap ?? {},
          }
        },
        partialize: (state) => ({
          user: state.user,
          currentWorkspaceId: state.currentWorkspaceId,
          workspaces: state.workspaces,
          workspaceAppMap: state.workspaceAppMap,
          workspaceUserAccessMap: state.workspaceUserAccessMap,
        }),
      },
    ),
    { name: 'AppStore' },
  ),
)
