import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import {
  BadgeDollarSign,
  Check,
  ChevronDown,
  FileBarChart2,
  Image as ImageIcon,
  LayoutGrid,
  Settings2,
  ShieldCheck,
  Store,
  Trash2,
  UserRound,
  Users2,
  Warehouse,
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
import { Input } from '@/components/ui/input'
import {
  getPlatformApp,
  type PlatformAppCode,
  type PlatformWorkspace,
  type WorkspaceType,
} from '@/core/platform/registry'
import { getPhoneWallpaperStyle, phoneWallpaperOptions } from '@/layouts/MobilePhoneShell'
import { PlatformLayout } from '@/layouts/PlatformLayout'
import { cn } from '@/lib/utils'
import { platformApi, type PlatformAppDto, type PlatformWorkspaceDto } from '@/services/platform'
import {
  defaultMobileHomeSettings,
  type MobileHomeSettings,
  useAppStore,
} from '@/store/useAppStore'

type SuggestedApp = {
  name: string
  subtitle: string
  description: string
  icon: typeof Users2
  tone: string
}

type HomeCard = {
  code: string
  title: string
  description: string
  icon: LucideIcon
  launchPath: string
  adminOnly?: boolean
}

type MobileHomeAction = {
  label: string
  icon: LucideIcon
  tone: string
  onClick: () => void
}

function toHomeCard(app: PlatformAppDto): HomeCard {
  const registry = getPlatformApp(app.code as PlatformAppCode)

  return {
    code: app.code,
    title: app.name,
    description: app.description,
    icon: registry?.icon ?? Users2,
    launchPath: app.launch_path ?? registry?.launchPath ?? '/app-store',
    adminOnly: app.admin_only,
  }
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

function toInstalledCodes(apps: PlatformAppDto[]): PlatformAppCode[] {
  return apps.flatMap((app) => {
    const registry = getPlatformApp(app.code as PlatformAppCode)
    return registry ? [registry.code] : []
  })
}

function HomeCardSkeleton() {
  return (
    <article className="relative min-h-[136px] overflow-hidden rounded-[16px] border border-[#e8edf8] bg-[linear-gradient(180deg,#ffffff_0%,#fbfcff_100%)] p-3 shadow-[0_10px_35px_rgba(15,23,42,0.04)] sm:min-h-[160px] sm:rounded-[18px] sm:p-4 xl:rounded-[24px] xl:p-5">
      <div className="animate-pulse">
        <div className="mx-auto h-14 w-14 rounded-[14px] bg-slate-100 sm:h-16 sm:w-16 sm:rounded-[16px] xl:h-[120px] xl:w-[120px] xl:rounded-[28px]" />
        <div className="mx-auto mt-4 h-4 w-28 rounded-full bg-slate-100 xl:mt-6 xl:h-6 xl:w-40" />
        <div className="mx-auto mt-3 hidden h-4 w-full max-w-[220px] rounded-full bg-slate-100 xl:block" />
        <div className="mx-auto mt-2 hidden h-4 w-3/4 max-w-[180px] rounded-full bg-slate-100 xl:block" />
        <div className="mt-8 hidden h-[52px] rounded-2xl bg-slate-100 xl:block" />
      </div>
    </article>
  )
}

const suggestedApps: SuggestedApp[] = [
  {
    name: 'Quản lý nhân sự',
    subtitle: '(HRM)',
    description: 'Quản lý nhân sự, chấm công, lương thưởng',
    icon: Users2,
    tone: 'bg-[linear-gradient(135deg,#6d5efc,#8c82ff)]',
  },
  {
    name: 'CRM',
    subtitle: '',
    description: 'Quản lý khách hàng và cơ hội bán hàng',
    icon: Users2,
    tone: 'bg-[linear-gradient(135deg,#22c55e,#14b86a)]',
  },
  {
    name: 'Kho hàng',
    subtitle: '',
    description: 'Quản lý kho và nhập xuất tồn',
    icon: Warehouse,
    tone: 'bg-[linear-gradient(135deg,#ffb340,#ff8b22)]',
  },
  {
    name: 'Kế toán',
    subtitle: '',
    description: 'Quản lý thu chi, công nợ',
    icon: BadgeDollarSign,
    tone: 'bg-[linear-gradient(135deg,#12c2c9,#0ea5a8)]',
  },
  {
    name: 'Báo cáo BI',
    subtitle: '',
    description: 'Báo cáo và phân tích dữ liệu',
    icon: FileBarChart2,
    tone: 'bg-[linear-gradient(135deg,#d9467e,#c81e74)]',
  },
]

function getAppTone(code: string) {
  if (code === 'team_badminton') return 'bg-[linear-gradient(135deg,#34c759,#12b76a)]'
  if (code === 'court_management') return 'bg-[linear-gradient(135deg,#ffb347,#ff7e29)]'
  if (code === 'motorbike_shop') return 'bg-[linear-gradient(135deg,#ff922b,#ff5f57)]'
  if (code === 'admin_portal') return 'bg-[linear-gradient(135deg,#0f172a,#334155)]'
  return 'bg-[linear-gradient(135deg,#2457f5,#14b8a6)]'
}

function MobileHomeScreen({
  apps,
  currentWorkspaceId,
  isAdmin,
  loading,
  userName,
  onOpenApp,
}: {
  apps: HomeCard[]
  currentWorkspaceId: string
  isAdmin: boolean
  loading: boolean
  userName: string
  onOpenApp: (path: string) => void
}) {
  const mobileHomeSettings = useAppStore((state) => state.mobileHomeSettings)
  const updateMobileHomeSettings = useAppStore((state) => state.updateMobileHomeSettings)
  const resetMobileHomeSettings = useAppStore((state) => state.resetMobileHomeSettings)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [draftSettings, setDraftSettings] = useState<MobileHomeSettings>(mobileHomeSettings)
  const wallpaperClass =
    phoneWallpaperOptions.find((item) => item.value === mobileHomeSettings.wallpaper)?.className ??
    phoneWallpaperOptions[0].className
  const wallpaperStyle = getPhoneWallpaperStyle(mobileHomeSettings)
  const compact = mobileHomeSettings.layout === 'compact'
  const gridClass = compact ? 'grid-cols-4 gap-x-3 gap-y-5' : 'grid-cols-3 gap-x-5 gap-y-7'
  const iconClass = compact ? 'h-14 w-14 rounded-[17px]' : 'h-[72px] w-[72px] rounded-[22px]'
  const settingsAction: MobileHomeAction = {
    label: 'Settings',
    icon: Settings2,
    tone: 'bg-white/18 text-white',
    onClick: () => setSettingsOpen(true),
  }
  const appStoreAction: MobileHomeAction = {
    label: currentWorkspaceId ? 'App Store' : 'Setup',
    icon: Store,
    tone: 'bg-white/18 text-white',
    onClick: () => onOpenApp(currentWorkspaceId ? '/app-store' : '/platform/setup'),
  }
  const profileAction: MobileHomeAction = {
    label: 'Hồ sơ',
    icon: UserRound,
    tone: 'bg-white/18 text-white',
    onClick: () => onOpenApp('/profile'),
  }
  const adminAction: MobileHomeAction = {
    label: 'Admin',
    icon: ShieldCheck,
    tone: 'bg-white/18 text-white',
    onClick: () => onOpenApp('/admin/apps'),
  }
  const phoneActions = [
    settingsAction,
    appStoreAction,
    profileAction,
    ...(isAdmin ? [adminAction] : []),
  ]

  useEffect(() => {
    if (settingsOpen) {
      setDraftSettings(mobileHomeSettings)
    }
  }, [mobileHomeSettings, settingsOpen])

  const handleSaveSettings = () => {
    updateMobileHomeSettings({
      ...draftSettings,
      backgroundImage: draftSettings.backgroundImage.trim(),
    })
    setSettingsOpen(false)
  }

  return (
    <section
      className={cn(
        'relative flex h-dvh min-h-dvh flex-col overflow-hidden text-white xl:hidden',
        !mobileHomeSettings.backgroundImage.trim() && wallpaperClass,
      )}
      style={wallpaperStyle}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.08)_0%,rgba(2,6,23,0.22)_58%,rgba(2,6,23,0.42)_100%)]" />

      <div className="relative z-10 px-5 pt-6">
        <div className="min-w-0">
          <div className="text-[13px] font-medium text-white/75">SportHub</div>
          <h1 className="truncate text-[26px] font-semibold tracking-normal text-white">
            {userName}
          </h1>
        </div>
      </div>

      <div className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-8 pb-4">
        <div className={cn('grid', gridClass)}>
          {phoneActions.map((item) => (
            <button
              key={`phone-action-${item.label}`}
              type="button"
              onClick={item.onClick}
              className="flex min-w-0 flex-col items-center text-center"
            >
              <span
                className={cn(
                  'grid place-items-center shadow-[0_16px_36px_rgba(15,23,42,0.24)] ring-1 ring-white/20 backdrop-blur-xl',
                  iconClass,
                  item.tone,
                )}
              >
                <item.icon className={compact ? 'h-7 w-7' : 'h-9 w-9'} />
              </span>
              {mobileHomeSettings.showLabels ? (
                <span className="mt-2 w-full truncate px-1 text-[12px] leading-4 font-medium text-white drop-shadow">
                  {item.label}
                </span>
              ) : null}
            </button>
          ))}

          {loading
            ? Array.from({ length: compact ? 8 : 6 }).map((_, index) => (
                <div key={`mobile-home-skeleton-${index}`} className="flex flex-col items-center">
                  <div className={cn('animate-pulse bg-white/25 backdrop-blur-xl', iconClass)} />
                  {mobileHomeSettings.showLabels ? (
                    <div className="mt-2 h-3 w-12 animate-pulse rounded-full bg-white/25" />
                  ) : null}
                </div>
              ))
            : null}

          {!loading
            ? apps.map((item) => {
                const Icon = item.icon

                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => onOpenApp(item.launchPath)}
                    className="flex min-w-0 flex-col items-center text-center"
                  >
                    <span
                      className={cn(
                        'grid place-items-center text-white shadow-[0_16px_36px_rgba(15,23,42,0.24)] ring-1 ring-white/20',
                        iconClass,
                        getAppTone(item.code),
                      )}
                    >
                      <Icon className={compact ? 'h-7 w-7' : 'h-9 w-9'} />
                    </span>
                    {mobileHomeSettings.showLabels ? (
                      <span className="mt-2 w-full truncate px-1 text-[12px] leading-4 font-medium text-white drop-shadow">
                        {item.title}
                      </span>
                    ) : null}
                  </button>
                )
              })
            : null}
        </div>

        {!loading && apps.length === 0 ? (
          <div className="mt-8 rounded-[24px] border border-white/18 bg-white/16 p-5 text-center shadow-[0_20px_60px_rgba(15,23,42,0.24)] backdrop-blur-xl">
            <LayoutGrid className="mx-auto h-9 w-9 text-white/85" />
            <div className="mt-3 text-[17px] font-semibold">Chưa có ứng dụng</div>
            <button
              type="button"
              onClick={() => onOpenApp(currentWorkspaceId ? '/app-store' : '/platform/setup')}
              className="mt-4 inline-flex h-10 items-center justify-center rounded-2xl bg-white px-5 text-[13px] font-semibold text-slate-950"
            >
              {currentWorkspaceId ? 'App Store' : 'Setup'}
            </button>
          </div>
        ) : null}
      </div>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-[24px] bg-white text-slate-950 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>App settings</DialogTitle>
            <DialogDescription>Layout và background mobile</DialogDescription>
          </DialogHeader>

          <div className="grid gap-5">
            <div>
              <div className="mb-2 text-[13px] font-semibold text-slate-700">Lưới ứng dụng</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'comfortable' as const, label: 'Thoáng' },
                  { value: 'compact' as const, label: 'Gọn' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() =>
                      setDraftSettings((current) => ({ ...current, layout: item.value }))
                    }
                    className={cn(
                      'inline-flex h-11 items-center justify-center rounded-2xl border text-[13px] font-semibold transition',
                      draftSettings.layout === item.value
                        ? 'border-slate-950 bg-slate-950 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 text-[13px] font-semibold text-slate-700">Background</div>
              <div className="grid grid-cols-3 gap-2">
                {phoneWallpaperOptions.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() =>
                      setDraftSettings((current) => ({ ...current, wallpaper: item.value }))
                    }
                    className={cn(
                      'rounded-2xl border p-1.5 text-left transition',
                      draftSettings.wallpaper === item.value
                        ? 'border-slate-950 bg-slate-950'
                        : 'border-slate-200 bg-white hover:bg-slate-50',
                    )}
                  >
                    <span className={cn('block h-14 rounded-xl', item.className)} />
                    <span
                      className={cn(
                        'mt-1.5 block text-center text-[11px] font-semibold',
                        draftSettings.wallpaper === item.value ? 'text-white' : 'text-slate-600',
                      )}
                    >
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
              <label className="mt-3 block">
                <span className="mb-1.5 flex items-center gap-2 text-[13px] font-semibold text-slate-700">
                  <ImageIcon className="h-4 w-4" />
                  Ảnh nền
                </span>
                <Input
                  value={draftSettings.backgroundImage}
                  onChange={(event) =>
                    setDraftSettings((current) => ({
                      ...current,
                      backgroundImage: event.target.value,
                    }))
                  }
                  placeholder="https://..."
                  className="h-11 rounded-2xl border-slate-200 bg-white px-3 text-[13px]"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[{ key: 'showLabels' as const, label: 'Tên app' }].map((item) => {
                const checked = draftSettings[item.key]

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() =>
                      setDraftSettings((current) => ({
                        ...current,
                        [item.key]: !current[item.key],
                      }))
                    }
                    className={cn(
                      'inline-flex h-11 items-center justify-center gap-2 rounded-2xl border text-[13px] font-semibold transition',
                      checked
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                    )}
                  >
                    {checked ? <Check className="h-4 w-4" /> : null}
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetMobileHomeSettings()
                setDraftSettings(defaultMobileHomeSettings)
              }}
            >
              Reset
            </Button>
            <Button type="button" variant="outline" onClick={() => setSettingsOpen(false)}>
              Hủy
            </Button>
            <Button type="button" onClick={handleSaveSettings}>
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}

export default function PlatformHomePage() {
  const navigate = useNavigate()
  const user = useAppStore((state) => state.user)
  const currentWorkspaceId = useAppStore((state) => state.currentWorkspaceId)
  const syncPlatformContext = useAppStore((state) => state.syncPlatformContext)
  const uninstallApp = useAppStore((state) => state.uninstallApp)
  const isAdmin = Boolean(user?.isSeedAdmin)
  const [apiHomeApps, setApiHomeApps] = useState<PlatformAppDto[]>([])
  const [loadingHomeApps, setLoadingHomeApps] = useState(true)
  const [query, setQuery] = useState('')
  const [uninstallTarget, setUninstallTarget] = useState<{ code: string; name: string } | null>(
    null,
  )

  useEffect(() => {
    if (!user) return

    let active = true
    setLoadingHomeApps(true)

    platformApi
      .home()
      .then((response) => {
        if (!active) return

        setApiHomeApps(response.installed_apps)

        if (response.workspace) {
          const workspace = toWorkspaceState(response.workspace, user.name)

          syncPlatformContext({
            currentWorkspaceId: workspace.id,
            workspaces: [workspace],
            workspaceAppMap: {
              [workspace.id]: toInstalledCodes(response.installed_apps),
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

        setApiHomeApps([])
        syncPlatformContext({
          currentWorkspaceId: '',
          workspaces: [],
          workspaceAppMap: {},
          workspaceUserAccessMap: {},
        })
      })
      .finally(() => {
        if (active) setLoadingHomeApps(false)
      })

    return () => {
      active = false
    }
  }, [syncPlatformContext, user])

  const homeApps = useMemo(() => {
    const keyword = query.trim().toLowerCase()

    return apiHomeApps
      .map(toHomeCard)
      .filter((item) => !item.adminOnly || isAdmin)
      .filter((item) => {
        if (!keyword) return true
        return `${item.title} ${item.description}`.toLowerCase().includes(keyword)
      })
  }, [apiHomeApps, isAdmin, query])

  const filteredSuggestedApps = useMemo(() => {
    const keyword = query.trim().toLowerCase()

    return suggestedApps.filter((item) => {
      if (!keyword) return true
      return `${item.name} ${item.subtitle} ${item.description}`.toLowerCase().includes(keyword)
    })
  }, [query])

  const handleUninstallApp = async (appCode: string) => {
    if (!currentWorkspaceId) {
      toast.info('Cần thiết lập workspace trước khi quản lý ứng dụng.')
      navigate('/platform/setup')
      return
    }

    try {
      await platformApi.uninstallApp(currentWorkspaceId, appCode)
      setApiHomeApps((current) => current.filter((item) => item.code !== appCode))
      uninstallApp(appCode as PlatformAppCode)
      toast.success('Đã gỡ cài đặt ứng dụng')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gỡ cài đặt ứng dụng thất bại')
    }
  }

  if (!user) return <Navigate to="/auth/login" replace />

  return (
    <PlatformLayout
      activeTab="home"
      mobileShell="phone-home"
      headerSearchValue={query}
      onHeaderSearchChange={setQuery}
      headerSearchPlaceholder="Tìm kiếm ứng dụng..."
    >
      <MobileHomeScreen
        apps={homeApps}
        currentWorkspaceId={currentWorkspaceId}
        isAdmin={isAdmin}
        loading={loadingHomeApps}
        userName={user.name}
        onOpenApp={(path) => navigate(path)}
      />

      <div className="hidden w-full xl:block">
        <section>
          <div className="pt-1">
            <div className="text-[20px] leading-tight font-semibold tracking-tight text-slate-950 sm:text-[24px] xl:text-[34px]">
              Xin chào, {user.name} 👋
            </div>
            <div className="mt-1 text-[13px] text-slate-500 sm:text-[15px] xl:mt-2 xl:text-[22px]">
              Chọn ứng dụng để bắt đầu làm việc
            </div>
          </div>
        </section>

        <section className="mt-4 xl:mt-6">
          <div className="mb-4 flex items-center justify-between gap-4 xl:mb-5">
            <h2 className="text-[15px] font-semibold text-slate-950 sm:text-[17px] xl:text-[24px]">
              Ứng dụng của tôi
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3 xl:gap-5">
            {loadingHomeApps
              ? Array.from({ length: 3 }).map((_, index) => (
                  <HomeCardSkeleton key={`home-skeleton-${index}`} />
                ))
              : null}
            {!loadingHomeApps
              ? homeApps.map((item) => {
                  const { code, title, description, icon: Icon, launchPath } = item
                  const removable = code !== 'admin_portal'

                  return (
                    <article
                      key={code}
                      className={cn(
                        'relative min-h-[136px] overflow-hidden rounded-[16px] border p-3 shadow-[0_10px_35px_rgba(15,23,42,0.04)] sm:min-h-[160px] sm:rounded-[18px] sm:p-4 xl:min-h-0 xl:rounded-[24px] xl:p-5',
                        'border-[#e8edf8] bg-[linear-gradient(180deg,#ffffff_0%,#fbfcff_100%)]',
                      )}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div
                          className={cn(
                            'grid h-14 w-14 place-items-center rounded-[14px] text-white shadow-[0_14px_35px_rgba(59,130,246,0.14)] sm:h-16 sm:w-16 sm:rounded-[16px] xl:h-[120px] xl:w-[120px] xl:rounded-[28px]',
                            code === 'team_badminton'
                              ? 'bg-[linear-gradient(135deg,#34c759,#12b76a)]'
                              : code === 'court_management'
                                ? 'bg-[linear-gradient(135deg,#ffb347,#ff7e29)]'
                                : code === 'motorbike_shop'
                                  ? 'bg-[linear-gradient(135deg,#ff922b,#ff5f57)]'
                                  : 'bg-[linear-gradient(135deg,#2457f5,#7c8cff)]',
                          )}
                        >
                          <Icon className="h-7 w-7 sm:h-8 sm:w-8 xl:h-14 xl:w-14" />
                        </div>

                        <h3 className="mt-3 text-[12px] font-semibold text-slate-950 sm:text-[13px] xl:mt-6 xl:text-[22px]">
                          {title}
                        </h3>
                        <p className="mt-3 hidden min-h-[48px] text-[15px] leading-6 text-slate-500 xl:block">
                          {description}
                        </p>
                        <div className="flex w-full items-center gap-2">
                          <Link
                            to={launchPath}
                            className={cn(
                              'inline-flex h-[52px] min-w-0 flex-1 items-center justify-center rounded-2xl border text-[16px] font-medium transition',
                              code === 'team_badminton'
                                ? 'border-[#8fd5a2] text-[#16a34a] hover:bg-green-50'
                                : code === 'court_management'
                                  ? 'border-[#ffcf9a] text-[#ff7e29] hover:bg-orange-50'
                                  : 'border-[#bfcdfd] text-[#2457f5] hover:bg-[#eef4ff]',
                            )}
                          >
                            Mở ứng dụng
                          </Link>

                          {removable ? (
                            <button
                              type="button"
                              onClick={() => setUninstallTarget({ code, name: title })}
                              aria-label="Gỡ cài đặt ứng dụng"
                              className="inline-flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl border border-red-100 bg-white text-red-500 shadow-sm transition hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  )
                })
              : null}
            {!loadingHomeApps && homeApps.length === 0 ? (
              <div className="col-span-2 rounded-[20px] border border-dashed border-[#bfcdfd] bg-white p-6 text-center xl:col-span-3">
                <h3 className="text-[18px] font-semibold text-slate-950">
                  Chưa có ứng dụng nào được cài
                </h3>
                <p className="mt-2 text-[14px] text-slate-500">
                  {!currentWorkspaceId
                    ? 'Thiết lập workspace và cài ứng dụng để bắt đầu sử dụng.'
                    : 'Vào App Store để chọn module phù hợp cho workspace của bạn.'}
                </p>
                <Link
                  to={!currentWorkspaceId ? '/platform/setup' : '/app-store'}
                  className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-[#2457f5] px-5 text-[14px] font-medium text-white hover:bg-[#1f49cf]"
                >
                  {!currentWorkspaceId ? 'Thiết lập workspace' : 'Mở App Store'}
                </Link>
              </div>
            ) : null}
          </div>
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

        <section className="mt-7 xl:mt-12">
          <div className="mb-4 flex items-center justify-between gap-4 xl:mb-5">
            <h2 className="text-[15px] font-semibold text-slate-950 sm:text-[17px] xl:text-[24px]">
              Gợi ý cho bạn
            </h2>
            <Link
              to="/app-store"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 xl:text-[15px]"
            >
              Xem tất cả
              <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
            </Link>
          </div>

          <div className="grid gap-3 xl:grid-cols-5 xl:gap-4">
            {filteredSuggestedApps.map((item, index) => (
              <article
                key={item.name}
                className={cn(
                  'flex items-center gap-3 rounded-[14px] border border-[#e6ebf7] bg-white p-3 shadow-[0_10px_30px_rgba(15,23,42,0.04)] xl:min-h-[220px] xl:flex-col xl:items-stretch xl:gap-0 xl:rounded-[20px] xl:p-4',
                  index > 2 ? 'hidden xl:flex' : '',
                )}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3 xl:items-start">
                  <div
                    className={cn(
                      'grid h-9 w-9 shrink-0 place-items-center rounded-[10px] text-white xl:h-10 xl:w-10 xl:rounded-[12px]',
                      item.tone,
                    )}
                  >
                    <item.icon className="h-4 w-4 xl:h-5 xl:w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12px] font-semibold text-slate-950 xl:min-h-[44px] xl:text-[16px]">
                      {item.name} {item.subtitle}
                    </div>
                    <div className="mt-1 truncate text-[11px] leading-5 text-slate-500 xl:mt-3 xl:text-[15px] xl:leading-6 xl:whitespace-normal">
                      {item.description}
                    </div>
                  </div>
                </div>

                <button className="inline-flex h-8 shrink-0 items-center justify-center rounded-xl border border-[#dbe2f2] bg-white px-4 text-[12px] font-medium text-slate-700 hover:bg-slate-50 xl:mt-6 xl:h-11 xl:w-full xl:rounded-2xl xl:px-0 xl:text-[15px]">
                  <span className="xl:hidden">Xem</span>
                  <span className="hidden xl:inline">Xem chi tiết</span>
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </PlatformLayout>
  )
}
