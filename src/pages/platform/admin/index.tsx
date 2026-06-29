import { useEffect, useMemo, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Plus, RefreshCw, Settings2, ShieldCheck, Trash2, Users2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { AdminLayout } from '@/layouts/AdminLayout'
import { cn } from '@/lib/utils'
import { platformApi, type PlatformAppDto, type PlatformAppReleaseStatus } from '@/services/platform'
import { useAppStore } from '@/store/useAppStore'
import {
  getPlatformApp,
  getWorkspaceTypeLabel,
  type PlatformAppCode,
  platformApps,
  platformUsers,
  platformWorkspaces,
} from '@/core/platform/registry'

type Section = 'dashboard' | 'users' | 'workspaces' | 'apps' | 'subscriptions'

const releaseOptions: Array<{ value: PlatformAppReleaseStatus; label: string }> = [
  { value: 'released', label: 'Release' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'draft', label: 'Draft' },
  { value: 'disabled', label: 'Disable' },
]

const releaseTone: Record<PlatformAppReleaseStatus, string> = {
  released: 'bg-emerald-400/15 text-emerald-200',
  maintenance: 'bg-amber-400/15 text-amber-200',
  draft: 'bg-sky-400/15 text-sky-200',
  disabled: 'bg-rose-400/15 text-rose-200',
}

function localAppDtos(): PlatformAppDto[] {
  return platformApps.map((app) => ({
    code: app.code,
    slug: app.slug,
    name: app.name,
    description: app.description,
    category: app.category,
    release_status: app.adminOnly ? 'disabled' : 'released',
    open_path: app.openPath,
    launch_path: app.launchPath,
    admin_only: app.adminOnly,
    route_exists: true,
    source_status: 'unchecked',
  }))
}

function getSection(pathname: string): Section {
  if (pathname.startsWith('/admin/users')) return 'users'
  if (pathname.startsWith('/admin/workspaces')) return 'workspaces'
  if (pathname.startsWith('/admin/apps')) return 'apps'
  if (pathname.startsWith('/admin/subscriptions')) return 'subscriptions'
  return 'dashboard'
}

export default function AdminPortalPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const section = getSection(location.pathname)
  const user = useAppStore((state) => state.user)
  const currentWorkspaceId = useAppStore((state) => state.currentWorkspaceId)
  const workspaces = useAppStore((state) => state.workspaces)
  const workspace = workspaces.find((item) => item.id === currentWorkspaceId)
  const [adminApps, setAdminApps] = useState<PlatformAppDto[]>([])
  const [loadingApps, setLoadingApps] = useState(false)
  const [updatingAppCode, setUpdatingAppCode] = useState<string | null>(null)
  const workspaceAppMap = useAppStore((state) => state.workspaceAppMap)
  const workspaceUserAccessMap = useAppStore((state) => state.workspaceUserAccessMap)
  const uninstallApp = useAppStore((state) => state.uninstallApp)
  const grantUserAppAccess = useAppStore((state) => state.grantUserAppAccess)
  const revokeUserAppAccess = useAppStore((state) => state.revokeUserAppAccess)
  const setCurrentWorkspaceId = useAppStore((state) => state.setCurrentWorkspaceId)
  const installedCodes = workspaceAppMap[currentWorkspaceId] ?? []
  const accessMap = workspaceUserAccessMap[currentWorkspaceId] ?? {}
  const managedApps = useMemo(() => (adminApps.length ? adminApps : localAppDtos()), [adminApps])
  const totalApps = managedApps.length

  useEffect(() => {
    if (!user?.isSeedAdmin) return

    let active = true

    async function loadAdminApps() {
      setLoadingApps(true)
      try {
        const response = await platformApi.adminApps()
        if (active) setAdminApps(response.apps)
      } catch (error) {
        if (active) toast.error(error instanceof Error ? error.message : 'Không tải được danh sách app')
      } finally {
        if (active) setLoadingApps(false)
      }
    }

    loadAdminApps()

    return () => {
      active = false
    }
  }, [user?.isSeedAdmin])

  const handleReloadApps = async () => {
    setLoadingApps(true)
    try {
      const response = await platformApi.reloadApps()
      setAdminApps(response.synced)
      toast.success(response.message)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Reload app registry thất bại')
    } finally {
      setLoadingApps(false)
    }
  }

  const handleReleaseStatus = async (app: PlatformAppDto, releaseStatus: PlatformAppReleaseStatus) => {
    if ((app.release_status ?? 'draft') === releaseStatus) return

    setUpdatingAppCode(app.code)
    try {
      const updated = await platformApi.updateAdminApp(app.code, { release_status: releaseStatus })
      setAdminApps((current) => current.map((item) => (item.code === updated.code ? updated : item)))
      toast.success(`Đã cập nhật ${updated.name}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Cập nhật trạng thái app thất bại')
    } finally {
      setUpdatingAppCode(null)
    }
  }

  if (!user) return <Navigate to="/auth/login" replace />
  if (!user.isSeedAdmin) return <Navigate to="/home" replace />

  return (
    <AdminLayout activeTab={section}>
      {section === 'dashboard' ? (
        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { label: 'Người dùng', value: platformUsers.length, hint: 'Tài khoản hệ thống' },
              { label: 'Workspace', value: platformWorkspaces.length, hint: 'Không gian làm việc' },
              { label: 'Ứng dụng', value: totalApps, hint: 'Danh sách quản lý' },
              { label: 'Đã cài', value: installedCodes.length, hint: workspace?.name ?? 'Workspace hiện tại' },
            ].map((item) => (
              <div key={item.label} className="rounded-[2rem] border border-white/10 bg-white/7 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl">
                <div className="text-sm text-slate-400">{item.label}</div>
                <div className="mt-3 text-3xl font-semibold text-white">{item.value}</div>
                <div className="mt-2 text-sm text-slate-300">{item.hint}</div>
              </div>
            ))}
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Thao tác</p>
            <div className="mt-4 grid gap-3">
              {[
                { label: 'Người dùng', href: '/admin/users', icon: Users2 },
                { label: 'Workspace', href: '/admin/workspaces', icon: Settings2 },
                { label: 'Ứng dụng', href: '/admin/apps', icon: ShieldCheck },
                { label: 'Gói sử dụng', href: '/admin/subscriptions', icon: RefreshCw },
              ].map((item) => (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => navigate(item.href)}
                  className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:bg-white/10"
                >
                  <span className="inline-flex items-center gap-2 text-sm text-slate-200">
                    <item.icon className="h-4 w-4 text-slate-400" />
                    {item.label}
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {section === 'users' ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {platformUsers.map((item) => {
            const access = accessMap[item.id] ?? []
            return (
              <div key={item.id} className="rounded-[2rem] border border-white/10 bg-white/7 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-lg font-semibold text-white">{item.name}</div>
                    <div className="text-sm text-slate-400">{item.email}</div>
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-100">
                    {item.role}
                  </span>
                </div>

                <div className="mt-4 text-sm text-slate-300">{item.title}</div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {access.length ? (
                    access.map((code) => {
                      const app = getPlatformApp(code)
                      if (!app) return null
                      return (
                        <button
                          key={code}
                          type="button"
                          onClick={() => revokeUserAppAccess(currentWorkspaceId, item.id, code)}
                          className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-100"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {app.name}
                        </button>
                      )
                    })
                  ) : (
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
                      Chưa có quyền ứng dụng
                    </span>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {platformApps
                    .filter((app) => app.kind !== 'admin')
                    .slice(0, 3)
                    .map((app) => {
                      const allowed = access.includes(app.code)
                      return (
                        <button
                          key={app.code}
                          type="button"
                          onClick={() =>
                            allowed
                              ? revokeUserAppAccess(currentWorkspaceId, item.id, app.code)
                              : grantUserAppAccess(currentWorkspaceId, item.id, app.code)
                          }
                          className={cn(
                            'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition',
                            allowed
                              ? 'border-rose-300/20 bg-rose-400/10 text-rose-100'
                              : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10',
                          )}
                        >
                          {allowed ? <Trash2 className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                          {allowed ? 'Thu hồi' : 'Cấp quyền'} {app.slug}
                        </button>
                      )
                    })}
                </div>
              </div>
            )
          })}
        </div>
      ) : null}

      {section === 'workspaces' ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {platformWorkspaces.map((item) => {
            const installed = workspaceAppMap[item.id] ?? []
            const active = item.id === currentWorkspaceId
            return (
              <div key={item.id} className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-lg font-semibold text-white">{item.name}</div>
                    <div className="text-sm text-slate-400">
                      {getWorkspaceTypeLabel(item.type)} • {item.memberCount} members
                    </div>
                  </div>
                  {active ? (
                    <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200">
                      Đang chọn
                    </span>
                  ) : null}
                </div>

                <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">{item.note}</div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {installed.map((code) => {
                    const app = getPlatformApp(code)
                    if (!app) return null
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => uninstallApp(code, item.id)}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/10"
                      >
                        {app.slug}
                      </button>
                    )
                  })}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    className="rounded-full bg-white px-4 text-slate-950 hover:bg-slate-100"
                    onClick={() => setCurrentWorkspaceId(item.id)}
                  >
                    Chọn workspace
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="rounded-full border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                    onClick={() => navigate('/app-store')}
                  >
                    Mở App Store
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      ) : null}

      {section === 'apps' ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[2rem] border border-white/10 bg-white/7 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div>
              <div className="text-sm font-semibold text-white">Quản lý ứng dụng</div>
              <p className="mt-1 text-sm text-slate-400">
                Quét ứng dụng, kiểm tra đường dẫn và cập nhật trạng thái phát hành.
              </p>
            </div>
            <Button
              type="button"
              className="rounded-full bg-white px-5 text-slate-950 hover:bg-slate-100"
              disabled={loadingApps}
              onClick={handleReloadApps}
            >
              <RefreshCw className={cn('mr-2 h-4 w-4', loadingApps && 'animate-spin')} />
              Quét ứng dụng
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {managedApps.map((app) => {
              const registryApp = getPlatformApp(app.code as PlatformAppCode)
              const Icon = registryApp?.icon ?? ShieldCheck
              const releaseStatus = app.release_status ?? 'draft'
              const launchPath = app.launch_path ?? registryApp?.launchPath ?? app.open_path

              return (
                <div key={app.code} className="rounded-[2rem] border border-white/10 bg-white/7 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-white">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">{app.name}</div>
                        <div className="text-sm text-slate-400">{app.category}</div>
                      </div>
                    </div>
                    <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', releaseTone[releaseStatus])}>
                      {releaseStatus}
                    </span>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-300">{app.description}</p>

                  <div className="mt-4 grid gap-2 rounded-3xl border border-white/10 bg-slate-950/35 p-3 text-xs text-slate-300">
                    <div className="flex items-center justify-between gap-3">
                      <span>Route</span>
                      <span className={app.route_exists ? 'text-emerald-200' : 'text-rose-200'}>
                        {app.route_exists ? 'Đã tìm thấy' : 'Chưa thấy'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span>Source</span>
                      <span>{app.source_status ?? 'unchecked'}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {releaseOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        disabled={updatingAppCode === app.code}
                        onClick={() => handleReleaseStatus(app, option.value)}
                        className={cn(
                          'rounded-full border px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60',
                          releaseStatus === option.value
                            ? 'border-white/20 bg-white text-slate-950'
                            : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white',
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>

                  {launchPath ? (
                    <Button
                      type="button"
                      variant="secondary"
                      className="mt-4 w-full rounded-full border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                      onClick={() => navigate(launchPath)}
                    >
                    Mở đường dẫn
                    </Button>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>
      ) : null}

      {section === 'subscriptions' ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {platformWorkspaces.map((workspaceItem) => {
            const installed = workspaceAppMap[workspaceItem.id] ?? []
            return (
              <div key={workspaceItem.id} className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold text-white">{workspaceItem.name}</div>
                    <div className="text-sm text-slate-400">{workspaceItem.type}</div>
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">
                    {installed.length} apps
                  </span>
                </div>

                <div className="mt-4 grid gap-2">
                  {installed.map((code) => {
                    const app = getPlatformApp(code)
                    if (!app) return null
                    return (
                      <div key={code} className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-4 py-3">
                        <div>
                          <div className="font-medium text-white">{app.name}</div>
                          <div className="text-sm text-slate-400">{app.slug}</div>
                        </div>
                        <button
                          type="button"
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/10"
                          onClick={() => setCurrentWorkspaceId(workspaceItem.id)}
                        >
                          View
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      ) : null}
    </AdminLayout>
  )
}
