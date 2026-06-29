import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
  Star,
  Trash2,
  Users2,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  getPlatformApp,
  type PlatformAppCode,
  type PlatformWorkspace,
  type WorkspaceType,
} from '@/core/platform/registry'
import { PlatformLayout } from '@/layouts/PlatformLayout'
import { cn } from '@/lib/utils'
import { platformApi, type PlatformAppDto, type PlatformWorkspaceDto } from '@/services/platform'
import { useAppStore } from '@/store/useAppStore'

const categoryFilters = [
  'Tất cả',
  'Kinh doanh',
  'Quản lý',
  'Tài chính',
  'Thể thao',
  'Nhân sự',
  'Bán hàng',
  'Marketing',
  'Công cụ',
  'Khác',
] as const

const statusFilters = ['all', 'installed', 'available'] as const
type StatusFilter = (typeof statusFilters)[number]
const sortOptions = ['recommended', 'rating', 'name'] as const
type SortOption = (typeof sortOptions)[number]

type StoreApp = {
  code?: string
  name: string
  description: string
  category: (typeof categoryFilters)[number]
  icon: LucideIcon
  tone: string
  rating: string
  reviews: number
  users: string
  launchPath?: string
  releaseStatus?: PlatformAppDto['release_status']
  installed: boolean
}

function normalizeCategory(category?: string): (typeof categoryFilters)[number] {
  const found = categoryFilters.find((item) => item === category)
  return found ?? 'Khác'
}

function appTone(code?: string) {
  if (code === 'team_badminton') return 'bg-[linear-gradient(135deg,#36c977,#11a95d)]'
  if (code === 'motorbike_shop') return 'bg-[linear-gradient(135deg,#ff9a28,#ff5f2e)]'
  if (code === 'court_management') return 'bg-[linear-gradient(135deg,#6d5efc,#4d6cf8)]'
  return 'bg-[linear-gradient(135deg,#38a4ff,#2469f5)]'
}

function dtoToStoreApp(app: PlatformAppDto): StoreApp {
  const registry = getPlatformApp(app.code as PlatformAppCode)

  return {
    code: app.code,
    name: app.name,
    description: app.description,
    category: normalizeCategory(app.category),
    icon: registry?.icon ?? Users2,
    tone: appTone(app.code),
    rating: app.rating ?? '4.5',
    reviews: app.reviews_count ?? 0,
    users: String(app.users_count ?? '0'),
    launchPath: app.launch_path ?? undefined,
    releaseStatus: app.release_status,
    installed: app.status === 'installed',
  }
}

function getLaunchPath(code?: string, fallback?: string) {
  return (code ? getPlatformApp(code as PlatformAppCode)?.launchPath : undefined) ?? fallback
}

function toWorkspaceState(workspace: PlatformWorkspaceDto, ownerName: string): PlatformWorkspace {
  const type: WorkspaceType =
    workspace.type === 'court' ||
    workspace.type === 'team' ||
    workspace.type === 'shop' ||
    workspace.type === 'personal' ||
    workspace.type === 'company'
      ? workspace.type
      : 'company'

  const status = (
    workspace.status === 'active' ||
    workspace.status === 'pending' ||
    workspace.status === 'disabled'
      ? workspace.status
      : 'active'
  ) as 'active' | 'pending' | 'disabled'

  return {
    id: String(workspace.slug || workspace.id),
    name: workspace.name,
    type,
    owner: workspace.owner_email || ownerName,
    status,
    memberCount: 0,
    note: '',
  }
}

function toInstalledCodes(apps: StoreApp[]): PlatformAppCode[] {
  return apps.flatMap((app) => {
    if (!app.installed || !app.code) {
      return []
    }

    const registry = getPlatformApp(app.code as PlatformAppCode)
    return registry ? [registry.code] : []
  })
}

function AppStoreCardSkeleton() {
  return (
    <article className="flex flex-col rounded-[18px] border border-[#e1e7f4] bg-white p-3 shadow-[0_12px_35px_rgba(15,23,42,0.04)] sm:min-h-[268px] sm:p-4 xl:min-h-[300px] xl:rounded-[22px] xl:p-5">
      <div className="animate-pulse">
        <div className="flex items-start justify-between gap-3">
          <div className="h-14 w-14 rounded-[12px] bg-slate-100" />
          <div className="h-7 w-20 rounded-full bg-slate-100" />
        </div>
        <div className="mt-4 h-5 w-40 rounded-full bg-slate-100" />
        <div className="mt-3 h-4 w-full rounded-full bg-slate-100" />
        <div className="mt-2 h-4 w-4/5 rounded-full bg-slate-100" />
        <div className="mt-4 h-4 w-2/3 rounded-full bg-slate-100" />
        <div className="mt-6 h-11 rounded-xl bg-slate-100" />
      </div>
    </article>
  )
}

export default function AppStorePage() {
  const navigate = useNavigate()
  const user = useAppStore((state) => state.user)
  const currentWorkspaceId = useAppStore((state) => state.currentWorkspaceId)
  const syncPlatformContext = useAppStore((state) => state.syncPlatformContext)
  const installApp = useAppStore((state) => state.installApp)
  const uninstallApp = useAppStore((state) => state.uninstallApp)
  const [apiApps, setApiApps] = useState<StoreApp[]>([])
  const [loadingApps, setLoadingApps] = useState(true)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [category, setCategory] = useState<(typeof categoryFilters)[number]>('Tất cả')
  const [sort, setSort] = useState<SortOption>('recommended')
  const [uninstallTarget, setUninstallTarget] = useState<{ code: string; name: string } | null>(
    null,
  )

  useEffect(() => {
    if (!user) return

    let active = true
    setLoadingApps(true)

    platformApi
      .appStore()
      .then((response) => {
        if (!active) return

        const apps = response.apps.map(dtoToStoreApp)
        setApiApps(apps)

        if (response.workspace) {
          const workspace = toWorkspaceState(response.workspace, user.name)

          syncPlatformContext({
            currentWorkspaceId: workspace.id,
            workspaces: [workspace],
            workspaceAppMap: {
              [workspace.id]: toInstalledCodes(apps),
            },
          })
        } else {
          syncPlatformContext({
            currentWorkspaceId: '',
            workspaces: [],
            workspaceAppMap: {},
            workspaceUserAccessMap: {},
          })
        }
      })
      .catch(() => {
        if (!active) return

        setApiApps([])
        syncPlatformContext({
          currentWorkspaceId: '',
          workspaces: [],
          workspaceAppMap: {},
          workspaceUserAccessMap: {},
        })
      })
      .finally(() => {
        if (active) setLoadingApps(false)
      })

    return () => {
      active = false
    }
  }, [syncPlatformContext, user])

  const appsWithStatus = useMemo(() => {
    return apiApps
  }, [apiApps])

  const filteredApps = useMemo(() => {
    const filtered = appsWithStatus.filter((app) => {
      const haystack = `${app.name} ${app.description} ${app.category}`.toLowerCase()
      const matchesQuery = haystack.includes(query.trim().toLowerCase())
      const matchesStatus =
        status === 'all' ? true : status === 'installed' ? app.installed : !app.installed
      const matchesCategory = category === 'Tất cả' ? true : app.category === category
      return matchesQuery && matchesStatus && matchesCategory
    })

    return [...filtered].sort((left, right) => {
      if (sort === 'rating') {
        return Number(right.rating) - Number(left.rating)
      }

      if (sort === 'name') {
        return left.name.localeCompare(right.name, 'vi')
      }

      return Number(right.installed) - Number(left.installed)
    })
  }, [appsWithStatus, category, query, sort, status])

  const sortLabel =
    sort === 'rating' ? 'Đánh giá cao' : sort === 'name' ? 'Tên A-Z' : 'Phù hợp nhất'

  const installedCount = appsWithStatus.filter((app) => app.installed).length
  const availableCount = Math.max(appsWithStatus.length - installedCount, 0)

  const handleUninstallApp = (appCode: string) => {
    if (!currentWorkspaceId) {
      toast.info('Cần thiết lập workspace trước khi quản lý ứng dụng.')
      navigate('/platform/setup')
      return
    }

    platformApi
      .uninstallApp(currentWorkspaceId, appCode)
      .then(() => {
        setApiApps((current) =>
          current.map((item) => (item.code === appCode ? { ...item, installed: false } : item)),
        )
        uninstallApp(appCode as PlatformAppCode)
        toast.success('Đã gỡ cài đặt ứng dụng')
      })
      .catch((error) =>
        toast.error(error instanceof Error ? error.message : 'Gỡ cài đặt ứng dụng thất bại'),
      )
  }

  if (!user) return <Navigate to="/auth/login" replace />

  return (
    <PlatformLayout
      activeTab="app-store"
      mobileShell="phone-page"
      mobileTitle="App Store"
      mobileSubtitle="Ứng dụng"
      headerSearchValue={query}
      onHeaderSearchChange={setQuery}
      headerSearchPlaceholder="Tìm kiếm ứng dụng..."
    >
      <div className="w-full">
        <section className="hidden xl:block">
          <div className="min-w-0">
            <h1 className="text-[28px] leading-tight font-semibold tracking-tight text-slate-950 sm:text-[32px] xl:text-[34px]">
              App Store
            </h1>
            <p className="mt-2 text-[13px] text-slate-500 sm:text-[15px] xl:text-[17px]">
              Khám phá và cài đặt các ứng dụng phù hợp với nhu cầu của bạn
            </p>
          </div>
        </section>

        <section className="mt-5 space-y-4 xl:mt-8 xl:space-y-5">
          <label className="flex h-11 items-center rounded-xl border border-[#d7def7] bg-white px-3 shadow-[0_10px_30px_rgba(59,130,246,0.06)] xl:hidden">
            <Search className="h-4 w-4 shrink-0 text-slate-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm kiếm ứng dụng..."
              className="ml-3 w-full bg-transparent text-[13px] text-slate-700 outline-none placeholder:text-slate-400 sm:text-[14px]"
            />
            <Search className="hidden h-4 w-4 shrink-0 text-slate-500 sm:block" />
          </label>

          <div className="flex items-center gap-3 overflow-x-auto pb-1 xl:hidden">
            <button
              type="button"
              onClick={() => setCategory('Tất cả')}
              className={cn(
                'h-10 shrink-0 rounded-xl border px-4 text-[13px] font-medium transition',
                category === 'Tất cả'
                  ? 'border-[#2457f5] bg-[#2457f5] text-white shadow-[0_10px_24px_rgba(36,87,245,0.22)]'
                  : 'border-[#dbe2f2] bg-white text-slate-700',
              )}
            >
              Tất cả
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-[#dbe2f2] bg-white px-4 text-[13px] font-medium text-slate-700">
                {category === 'Tất cả' ? 'Danh mục' : category}
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="max-h-80 min-w-48 rounded-2xl p-2">
                {categoryFilters.map((item) => (
                  <DropdownMenuItem
                    key={item}
                    className={cn(
                      'cursor-pointer rounded-xl px-3 py-2 text-[13px]',
                      category === item ? 'bg-[#eef4ff] text-[#2457f5]' : '',
                    )}
                    onClick={() => setCategory(item)}
                  >
                    {item}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger className="ml-auto inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-[#dbe2f2] bg-white px-3 text-[13px] font-medium text-slate-700 sm:px-4">
                <SlidersHorizontal className="h-4 w-4" />
                <span>{sortLabel}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-44 rounded-2xl p-2">
                <DropdownMenuItem
                  className={cn(
                    'cursor-pointer rounded-xl px-3 py-2 text-[13px]',
                    sort === 'recommended' ? 'bg-[#eef4ff] text-[#2457f5]' : '',
                  )}
                  onClick={() => setSort('recommended')}
                >
                  Phù hợp nhất
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={cn(
                    'cursor-pointer rounded-xl px-3 py-2 text-[13px]',
                    sort === 'rating' ? 'bg-[#eef4ff] text-[#2457f5]' : '',
                  )}
                  onClick={() => setSort('rating')}
                >
                  Đánh giá cao
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={cn(
                    'cursor-pointer rounded-xl px-3 py-2 text-[13px]',
                    sort === 'name' ? 'bg-[#eef4ff] text-[#2457f5]' : '',
                  )}
                  onClick={() => setSort('name')}
                >
                  Tên A-Z
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="hidden xl:flex xl:items-center xl:justify-between xl:gap-4">
            <div className="flex gap-3">
              {categoryFilters.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={cn(
                    'h-11 shrink-0 rounded-xl border px-4 text-[14px] font-medium transition xl:h-12 xl:px-5 xl:text-[15px]',
                    category === item
                      ? 'border-[#2457f5] bg-[#2457f5] text-white shadow-[0_10px_24px_rgba(36,87,245,0.25)]'
                      : 'border-[#dbe2f2] bg-white text-slate-700 hover:bg-slate-50',
                  )}
                >
                  {item}
                </button>
              ))}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger className="hidden h-12 shrink-0 items-center gap-2 rounded-xl border border-[#dbe2f2] bg-white px-5 text-[15px] font-medium text-slate-700 shadow-sm xl:inline-flex">
                <SlidersHorizontal className="h-5 w-5" />
                Sắp xếp: {sortLabel}
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-48 rounded-2xl p-2">
                <DropdownMenuItem
                  className={cn(
                    'cursor-pointer rounded-xl px-3 py-2',
                    sort === 'recommended' ? 'bg-[#eef4ff] text-[#2457f5]' : '',
                  )}
                  onClick={() => setSort('recommended')}
                >
                  Phù hợp nhất
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={cn(
                    'cursor-pointer rounded-xl px-3 py-2',
                    sort === 'rating' ? 'bg-[#eef4ff] text-[#2457f5]' : '',
                  )}
                  onClick={() => setSort('rating')}
                >
                  Đánh giá cao
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={cn(
                    'cursor-pointer rounded-xl px-3 py-2',
                    sort === 'name' ? 'bg-[#eef4ff] text-[#2457f5]' : '',
                  )}
                  onClick={() => setSort('name')}
                >
                  Tên A-Z
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex gap-7 overflow-x-auto border-b border-[#dbe2f2]">
            {statusFilters.map((item) => {
              const active = status === item
              const label =
                item === 'all'
                  ? 'Tất cả ứng dụng'
                  : item === 'installed'
                    ? `Đã cài đặt (${installedCount})`
                    : `Chưa cài đặt (${availableCount})`
              const shortLabel =
                item === 'all'
                  ? 'Tất cả'
                  : item === 'installed'
                    ? `Đã cài đặt (${installedCount})`
                    : `Chưa cài đặt (${availableCount})`

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setStatus(item)}
                  className={cn(
                    'relative h-12 shrink-0 text-[15px] font-medium transition xl:text-[16px]',
                    active ? 'text-[#2457f5]' : 'text-slate-500 hover:text-slate-800',
                  )}
                >
                  <span className="sm:hidden">{shortLabel}</span>
                  <span className="hidden sm:inline">{label}</span>
                  {active ? (
                    <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#2457f5]" />
                  ) : null}
                </button>
              )
            })}
          </div>
        </section>

        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6">
          {loadingApps
            ? Array.from({ length: 8 }).map((_, index) => (
                <AppStoreCardSkeleton key={`app-store-skeleton-${index}`} />
              ))
            : null}
          {!loadingApps
            ? filteredApps.map((app) => {
                const launchPath = getLaunchPath(app.code, app.launchPath)

                return (
                  <article
                    key={app.name}
                    className="flex flex-col rounded-[18px] border border-[#e1e7f4] bg-white p-3 shadow-[0_12px_35px_rgba(15,23,42,0.04)] sm:min-h-[268px] sm:p-4 xl:min-h-[300px] xl:rounded-[22px] xl:p-5"
                  >
                    <div className="flex items-start gap-3 sm:hidden">
                      <div
                        className={cn(
                          'grid h-12 w-12 shrink-0 place-items-center rounded-[12px] text-white shadow-lg',
                          app.tone,
                        )}
                      >
                        <app.icon className="h-6 w-6" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h2 className="min-w-0 truncate text-[15px] font-semibold text-slate-950">
                            {app.name}
                          </h2>
                          <span
                            className={cn(
                              'inline-flex shrink-0 items-center rounded-lg px-2 py-1 text-[10px] font-semibold',
                              app.installed
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-slate-100 text-slate-700',
                            )}
                          >
                            {app.installed ? 'Đã cài đặt' : 'Chưa cài đặt'}
                          </span>
                        </div>

                        <div className="mt-2 flex min-w-0 items-center gap-2 text-[11px] text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-[#ffb020] text-[#ffb020]" />
                            <span>{app.rating}</span>
                            <span>({app.reviews})</span>
                          </span>
                          <span className="h-4 w-px bg-slate-200" />
                          <span className="inline-flex min-w-0 items-center gap-1 truncate">
                            <Users2 className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                            <span className="truncate">{app.users} người dùng</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="hidden sm:block">
                      <div className="flex items-start justify-between gap-3">
                        <div
                          className={cn(
                            'grid h-14 w-14 place-items-center rounded-[12px] text-white shadow-lg',
                            app.tone,
                          )}
                        >
                          <app.icon className="h-7 w-7" />
                        </div>

                        <span
                          className={cn(
                            'inline-flex items-center rounded-lg px-3 py-1 text-[12px] font-semibold',
                            app.installed
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-700',
                          )}
                        >
                          {app.installed ? 'Đã cài đặt' : 'Chưa cài đặt'}
                        </span>
                      </div>

                      <h2 className="mt-4 truncate text-[16px] font-semibold text-slate-950 xl:text-[18px]">
                        {app.name}
                      </h2>
                      <p className="mt-3 min-h-[54px] text-[14px] leading-6 text-slate-600 xl:min-h-[72px] xl:text-[15px]">
                        {app.description}
                      </p>

                      <div className="mt-3 flex min-w-0 items-center gap-3 text-[13px] text-slate-500 xl:text-[14px]">
                        <span className="inline-flex items-center gap-1">
                          <Star className="h-4 w-4 fill-[#ffb020] text-[#ffb020]" />
                          <span>{app.rating}</span>
                          <span>({app.reviews})</span>
                        </span>
                        <span className="h-4 w-px bg-slate-200" />
                        <span className="inline-flex min-w-0 items-center gap-1 truncate">
                          <Users2 className="h-4 w-4 shrink-0 text-slate-500" />
                          <span className="truncate">{app.users} người dùng</span>
                        </span>
                      </div>
                    </div>

                    <div className="mt-auto flex items-center gap-3 pt-3 sm:pt-6">
                      <button
                        type="button"
                        onClick={() => {
                          if (app.installed) {
                            if (launchPath) navigate(launchPath)
                            return
                          }

                          if (!currentWorkspaceId) {
                            toast.info('Cần thiết lập workspace trước khi cài ứng dụng.')
                            navigate('/platform/setup')
                            return
                          }

                          if (app.code) {
                            platformApi
                              .installApp(currentWorkspaceId, app.code)
                              .then((installedApp) => {
                                setApiApps((current) =>
                                  current.map((item) =>
                                    item.code === app.code
                                      ? {
                                          ...item,
                                          installed: true,
                                          releaseStatus: installedApp.release_status,
                                        }
                                      : item,
                                  ),
                                )
                                const registryApp = getPlatformApp(app.code as PlatformAppCode)
                                if (registryApp) installApp(registryApp.code)
                              })
                              .catch((error) =>
                                toast.error(
                                  error instanceof Error
                                    ? error.message
                                    : 'Cài đặt ứng dụng thất bại',
                                ),
                              )
                          }
                        }}
                        disabled={app.releaseStatus === 'maintenance'}
                        className={cn(
                          'inline-flex h-9 flex-1 items-center justify-center rounded-xl text-[13px] font-medium transition sm:h-10 sm:text-[14px] xl:h-11 xl:text-[15px]',
                          app.releaseStatus === 'maintenance'
                            ? 'cursor-not-allowed bg-amber-100 text-amber-700'
                            : app.installed
                              ? 'border border-[#2457f5] bg-white text-[#2457f5] hover:bg-[#eef4ff]'
                              : 'bg-[#2457f5] text-white shadow-[0_12px_24px_rgba(36,87,245,0.22)] hover:bg-[#1f49cf]',
                        )}
                      >
                        {app.releaseStatus === 'maintenance'
                          ? 'Bảo trì'
                          : app.installed
                            ? 'Mở ứng dụng'
                            : 'Cài đặt'}
                      </button>

                      {app.installed && app.code && app.code !== 'admin_portal' ? (
                        <button
                          type="button"
                          onClick={() => setUninstallTarget({ code: app.code!, name: app.name })}
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-3 text-[12px] font-medium text-red-600 transition hover:bg-red-50 sm:h-10 sm:px-4 sm:text-[13px] xl:h-11 xl:text-[14px]"
                        >
                          <Trash2 className="h-4 w-4 shrink-0" />
                          <span className="hidden sm:inline">Gỡ</span>
                        </button>
                      ) : null}
                    </div>
                  </article>
                )
              })
            : null}
          {!loadingApps && filteredApps.length === 0 ? (
            <div className="col-span-full rounded-[22px] border border-dashed border-[#bfcdfd] bg-white p-8 text-center shadow-[0_12px_35px_rgba(15,23,42,0.04)]">
              <h2 className="text-[18px] font-semibold text-slate-950">Chưa có ứng dụng phù hợp</h2>
              <p className="mt-2 text-[14px] text-slate-500">
                {!currentWorkspaceId
                  ? 'Thiết lập workspace để bắt đầu cài đặt ứng dụng cho doanh nghiệp của bạn.'
                  : 'Thử đổi bộ lọc hoặc từ khóa để xem thêm ứng dụng.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  if (!currentWorkspaceId) {
                    navigate('/platform/setup')
                    return
                  }

                  setQuery('')
                  setCategory('Tất cả')
                  setStatus('all')
                }}
                className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-[#2457f5] px-5 text-[14px] font-medium text-white hover:bg-[#1f49cf]"
              >
                {!currentWorkspaceId ? 'Thiết lập workspace' : 'Xóa bộ lọc'}
              </button>
            </div>
          ) : null}
        </section>

        <Dialog
          open={Boolean(uninstallTarget)}
          onOpenChange={(open) => !open && setUninstallTarget(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Gỡ cài đặt ứng dụng</DialogTitle>
              <DialogDescription>
                {uninstallTarget
                  ? `Bạn có chắc muốn gỡ ${uninstallTarget.name} khỏi workspace hiện tại không?`
                  : 'Bạn có chắc muốn gỡ ứng dụng này khỏi workspace hiện tại không?'}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUninstallTarget(null)}>
                Hủy
              </Button>
              <Button
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={() => {
                  if (!uninstallTarget) return
                  const target = uninstallTarget
                  setUninstallTarget(null)
                  void handleUninstallApp(target.code)
                }}
              >
                Gỡ cài đặt
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {!loadingApps && filteredApps.length > 0 ? (
          <>
            <section className="mt-8 hidden flex-col gap-4 text-[15px] text-slate-500 sm:flex-row sm:items-center sm:justify-between xl:mt-10 xl:flex">
              <div>
                Hiển thị 1 - {Math.min(filteredApps.length, 8)} trong tổng số{' '}
                {appsWithStatus.length} ứng dụng
              </div>

              <div className="flex items-center justify-center gap-3">
                <button className="grid h-10 w-10 place-items-center rounded-xl border border-[#dbe2f2] bg-white text-slate-400">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button className="grid h-10 w-10 place-items-center rounded-xl bg-[#2457f5] text-[15px] font-semibold text-white">
                  1
                </button>
                <button className="grid h-10 w-10 place-items-center rounded-xl border border-[#dbe2f2] bg-white text-[15px] font-semibold text-slate-700">
                  2
                </button>
                <button className="grid h-10 w-10 place-items-center rounded-xl border border-[#dbe2f2] bg-white text-slate-600">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              <div className="hidden items-center gap-3 sm:flex">
                <span>Hiển thị:</span>
                <button className="inline-flex h-10 items-center gap-6 rounded-xl border border-[#dbe2f2] bg-white px-4 text-[15px] font-medium text-slate-700">
                  8
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </section>
          </>
        ) : null}
      </div>
    </PlatformLayout>
  )
}
