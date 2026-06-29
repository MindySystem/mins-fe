import { useEffect, useMemo, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import {
  ArrowRight,
  CheckCircle2,
  Pencil,
  Plus,
  RefreshCw,
  Settings2,
  ShieldCheck,
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
import { Input } from '@/components/ui/input'
import {
  getPlatformApp,
  getWorkspaceTypeLabel,
  type PlatformAppCode,
  platformApps,
  platformUsers,
  platformWorkspaces,
} from '@/core/platform/registry'
import { AdminLayout } from '@/layouts/AdminLayout'
import { cn } from '@/lib/utils'
import {
  platformApi,
  type PlatformAppDto,
  type PlatformAppReleaseStatus,
} from '@/services/platform'
import { useAppStore } from '@/store/useAppStore'

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

type AdminAppFormState = {
  name: string
  description: string
  category: string
  icon: string
  release_status: PlatformAppReleaseStatus
  launch_path: string
  open_path: string
  customer_entry_path: string
  admin_only: boolean
}

function getLucideIcon(iconName?: string | null): LucideIcon | null {
  if (!iconName) return null

  const icon = (LucideIcons as unknown as Record<string, LucideIcon | undefined>)[iconName]
  return icon ?? null
}

function toAdminAppForm(app: PlatformAppDto): AdminAppFormState {
  return {
    name: app.name ?? '',
    description: app.description ?? '',
    category: app.category ?? '',
    icon: app.icon ?? '',
    release_status: app.release_status ?? 'draft',
    launch_path: app.launch_path ?? '',
    open_path: app.open_path ?? '',
    customer_entry_path: app.customer_entry_path ?? '',
    admin_only: Boolean(app.admin_only),
  }
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
  const [editingApp, setEditingApp] = useState<PlatformAppDto | null>(null)
  const [appForm, setAppForm] = useState<AdminAppFormState | null>(null)
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
        if (active)
          toast.error(error instanceof Error ? error.message : 'Không tải được danh sách app')
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
      setAdminApps(response.apps ?? response.synced)
      toast.success(response.message)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Reload app registry thất bại')
    } finally {
      setLoadingApps(false)
    }
  }

  const handleReleaseStatus = async (
    app: PlatformAppDto,
    releaseStatus: PlatformAppReleaseStatus,
  ) => {
    if ((app.release_status ?? 'draft') === releaseStatus) return

    setUpdatingAppCode(app.code)
    try {
      const updated = await platformApi.updateAdminApp(app.code, { release_status: releaseStatus })
      setAdminApps((current) =>
        current.map((item) => (item.code === updated.code ? updated : item)),
      )
      toast.success(`Đã cập nhật ${updated.name}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Cập nhật trạng thái app thất bại')
    } finally {
      setUpdatingAppCode(null)
    }
  }

  const handleEditApp = (app: PlatformAppDto) => {
    setEditingApp(app)
    setAppForm(toAdminAppForm(app))
  }

  const handleSaveApp = async () => {
    if (!editingApp || !appForm) return

    setUpdatingAppCode(editingApp.code)
    try {
      const updated = await platformApi.updateAdminApp(editingApp.code, {
        name: appForm.name.trim(),
        description: appForm.description.trim(),
        category: appForm.category.trim(),
        icon: appForm.icon.trim() || null,
        release_status: appForm.release_status,
        launch_path: appForm.launch_path.trim() || null,
        open_path: appForm.open_path.trim() || null,
        customer_entry_path: appForm.customer_entry_path.trim() || null,
        admin_only: appForm.admin_only,
      })

      setAdminApps((current) =>
        current.map((item) => (item.code === updated.code ? updated : item)),
      )
      setEditingApp(null)
      setAppForm(null)
      toast.success(`Đã cập nhật ${updated.name}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Cập nhật app thất bại')
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
              {
                label: 'Đã cài',
                value: installedCodes.length,
                hint: workspace?.name ?? 'Workspace hiện tại',
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[2rem] border border-white/10 bg-white/7 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl"
              >
                <div className="text-sm text-slate-400">{item.label}</div>
                <div className="mt-3 text-3xl font-semibold text-white">{item.value}</div>
                <div className="mt-2 text-sm text-slate-300">{item.hint}</div>
              </div>
            ))}
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <p className="text-xs tracking-[0.35em] text-slate-400 uppercase">Thao tác</p>
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
              <div
                key={item.id}
                className="rounded-[2rem] border border-white/10 bg-white/7 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl"
              >
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
                          {allowed ? (
                            <Trash2 className="h-3.5 w-3.5" />
                          ) : (
                            <Plus className="h-3.5 w-3.5" />
                          )}
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
              <div
                key={item.id}
                className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl"
              >
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

                <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                  {item.note}
                </div>

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
                Danh sách app có sẵn và app được quét từ source.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                {managedApps.length} apps
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                {
                  managedApps.filter(
                    (app) => app.is_builtin ?? Boolean(getPlatformApp(app.code as PlatformAppCode)),
                  ).length
                }{' '}
                có sẵn
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                {
                  managedApps.filter(
                    (app) =>
                      !(app.is_builtin ?? Boolean(getPlatformApp(app.code as PlatformAppCode))),
                  ).length
                }{' '}
                scan thêm
              </span>
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

          <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950/45 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div className="hidden grid-cols-[minmax(240px,1.2fr)_minmax(180px,0.8fr)_minmax(150px,0.6fr)_220px] gap-4 border-b border-white/10 px-5 py-3 text-xs font-semibold tracking-[0.12em] text-slate-400 uppercase md:grid">
              <span>App</span>
              <span>Source</span>
              <span>Trạng thái</span>
              <span className="text-right">Actions</span>
            </div>

            {managedApps.map((app) => {
              const registryApp = getPlatformApp(app.code as PlatformAppCode)
              const Icon = registryApp?.icon ?? getLucideIcon(app.icon) ?? ShieldCheck
              const releaseStatus = app.release_status ?? 'draft'
              const isBuiltin = app.is_builtin ?? Boolean(registryApp)

              return (
                <div
                  key={app.code}
                  className="grid gap-4 border-b border-white/10 px-5 py-4 last:border-b-0 md:grid-cols-[minmax(240px,1.2fr)_minmax(180px,0.8fr)_minmax(150px,0.6fr)_220px] md:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-white">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-white">{app.name}</span>
                        <span className="mt-1 block truncate text-sm text-slate-400">
                          {app.code} • {app.category}
                        </span>
                      </span>
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-300 md:hidden">
                      {app.description}
                    </p>
                  </div>

                  <div className="min-w-0 text-sm text-slate-300">
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={cn(
                          'rounded-full px-3 py-1 text-xs font-semibold',
                          isBuiltin
                            ? 'bg-indigo-400/15 text-indigo-200'
                            : 'bg-cyan-400/15 text-cyan-200',
                        )}
                      >
                        {isBuiltin ? 'Có sẵn' : 'Scan thêm'}
                      </span>
                      <span
                        className={cn(
                          'rounded-full px-3 py-1 text-xs font-semibold',
                          app.route_exists
                            ? 'bg-emerald-400/15 text-emerald-200'
                            : 'bg-rose-400/15 text-rose-200',
                        )}
                      >
                        {app.route_exists ? 'Route OK' : 'Chưa thấy route'}
                      </span>
                    </div>
                    <div className="mt-2 truncate text-xs text-slate-500">
                      {app.source_path ?? 'No source path'} • {app.source_status ?? 'unchecked'}
                    </div>
                  </div>

                  <div>
                    <span
                      className={cn(
                        'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
                        releaseTone[releaseStatus],
                      )}
                    >
                      {releaseStatus}
                    </span>
                  </div>

                  <div className="flex items-center justify-start gap-2 md:justify-end">
                    <Button
                      type="button"
                      variant="secondary"
                      className="h-10 rounded-full border border-white/10 bg-white/5 px-3 text-slate-100 hover:bg-white/10"
                      onClick={() => handleEditApp(app)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <select
                      value={releaseStatus}
                      disabled={updatingAppCode === app.code}
                      onChange={(event) =>
                        handleReleaseStatus(app, event.target.value as PlatformAppReleaseStatus)
                      }
                      className="h-10 rounded-full border border-white/10 bg-slate-950/70 px-3 text-sm text-slate-100 transition outline-none disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label="Cập nhật trạng thái"
                    >
                      {releaseOptions.map((option) => (
                        <option
                          key={option.value}
                          value={option.value}
                          className="bg-slate-950 text-slate-100"
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )
            })}
          </div>

          <Dialog
            open={Boolean(editingApp)}
            onOpenChange={(open) => {
              if (!open) {
                setEditingApp(null)
                setAppForm(null)
              }
            }}
          >
            {appForm ? (
              <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-[1.5rem] bg-white text-slate-950 sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Chỉnh sửa ứng dụng</DialogTitle>
                  <DialogDescription>
                    {(editingApp?.is_builtin ??
                    Boolean(editingApp && getPlatformApp(editingApp.code as PlatformAppCode)))
                      ? 'App có sẵn'
                      : 'App scan thêm'}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-1.5">
                    <span className="text-xs font-semibold text-slate-600">Tên App</span>
                    <Input
                      value={appForm.name}
                      onChange={(event) =>
                        setAppForm((current) =>
                          current ? { ...current, name: event.target.value } : current,
                        )
                      }
                      className="h-11 rounded-2xl border-slate-200 px-3"
                    />
                  </label>

                  <label className="grid gap-1.5">
                    <span className="text-xs font-semibold text-slate-600">Icon app</span>
                    <Input
                      value={appForm.icon}
                      onChange={(event) =>
                        setAppForm((current) =>
                          current ? { ...current, icon: event.target.value } : current,
                        )
                      }
                      placeholder="LayoutGrid"
                      className="h-11 rounded-2xl border-slate-200 px-3"
                    />
                  </label>

                  <label className="grid gap-1.5">
                    <span className="text-xs font-semibold text-slate-600">Danh mục</span>
                    <Input
                      value={appForm.category}
                      onChange={(event) =>
                        setAppForm((current) =>
                          current ? { ...current, category: event.target.value } : current,
                        )
                      }
                      className="h-11 rounded-2xl border-slate-200 px-3"
                    />
                  </label>

                  <label className="grid gap-1.5">
                    <span className="text-xs font-semibold text-slate-600">Trạng thái</span>
                    <select
                      value={appForm.release_status}
                      onChange={(event) =>
                        setAppForm((current) =>
                          current
                            ? {
                                ...current,
                                release_status: event.target.value as PlatformAppReleaseStatus,
                              }
                            : current,
                        )
                      }
                      className="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none"
                    >
                      {releaseOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-1.5 md:col-span-2">
                    <span className="text-xs font-semibold text-slate-600">Mô tả</span>
                    <textarea
                      value={appForm.description}
                      onChange={(event) =>
                        setAppForm((current) =>
                          current ? { ...current, description: event.target.value } : current,
                        )
                      }
                      className="min-h-24 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
                    />
                  </label>

                  <label className="grid gap-1.5">
                    <span className="text-xs font-semibold text-slate-600">Launch path</span>
                    <Input
                      value={appForm.launch_path}
                      onChange={(event) =>
                        setAppForm((current) =>
                          current ? { ...current, launch_path: event.target.value } : current,
                        )
                      }
                      placeholder="/app-path"
                      className="h-11 rounded-2xl border-slate-200 px-3"
                    />
                  </label>

                  <label className="grid gap-1.5">
                    <span className="text-xs font-semibold text-slate-600">Open path</span>
                    <Input
                      value={appForm.open_path}
                      onChange={(event) =>
                        setAppForm((current) =>
                          current ? { ...current, open_path: event.target.value } : current,
                        )
                      }
                      placeholder="/apps/app-path"
                      className="h-11 rounded-2xl border-slate-200 px-3"
                    />
                  </label>

                  <label className="grid gap-1.5 md:col-span-2">
                    <span className="text-xs font-semibold text-slate-600">
                      Customer entry path
                    </span>
                    <Input
                      value={appForm.customer_entry_path}
                      onChange={(event) =>
                        setAppForm((current) =>
                          current
                            ? { ...current, customer_entry_path: event.target.value }
                            : current,
                        )
                      }
                      placeholder="/public-entry"
                      className="h-11 rounded-2xl border-slate-200 px-3"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      setAppForm((current) =>
                        current ? { ...current, admin_only: !current.admin_only } : current,
                      )
                    }
                    className={cn(
                      'inline-flex h-11 items-center justify-center gap-2 rounded-2xl border text-sm font-semibold transition md:col-span-2',
                      appForm.admin_only
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                    )}
                  >
                    {appForm.admin_only ? <CheckCircle2 className="h-4 w-4" /> : null}
                    Super Admin only
                  </button>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingApp(null)
                      setAppForm(null)
                    }}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="button"
                    disabled={Boolean(editingApp && updatingAppCode === editingApp.code)}
                    onClick={handleSaveApp}
                  >
                    Xác nhận cập nhật
                  </Button>
                </DialogFooter>
              </DialogContent>
            ) : null}
          </Dialog>
        </div>
      ) : null}

      {section === 'subscriptions' ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {platformWorkspaces.map((workspaceItem) => {
            const installed = workspaceAppMap[workspaceItem.id] ?? []
            return (
              <div
                key={workspaceItem.id}
                className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl"
              >
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
                      <div
                        key={code}
                        className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-4 py-3"
                      >
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
