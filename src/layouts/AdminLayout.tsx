import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, BadgeCheck, LayoutGrid, ShieldCheck, Store, Users2 } from 'lucide-react'

import { PageTitle } from '@/components/PageTitle'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'
import { getWorkspaceTypeLabel } from '@/core/platform/registry'

type AdminLayoutProps = {
  children: ReactNode
  activeTab: 'dashboard' | 'users' | 'workspaces' | 'apps' | 'subscriptions'
}

const tabs = [
  { to: '/admin', label: 'Dashboard', icon: LayoutGrid, id: 'dashboard' as const },
  { to: '/admin/users', label: 'Users', icon: Users2, id: 'users' as const },
  { to: '/admin/workspaces', label: 'Workspaces', icon: Store, id: 'workspaces' as const },
  { to: '/admin/apps', label: 'Apps', icon: ShieldCheck, id: 'apps' as const },
  { to: '/admin/subscriptions', label: 'Subscriptions', icon: BadgeCheck, id: 'subscriptions' as const },
] as const

export function AdminLayout({ children, activeTab }: AdminLayoutProps) {
  const navigate = useNavigate()
  const user = useAppStore((state) => state.user)
  const tenant = useAppStore((state) => state.tenant)
  const currentWorkspaceId = useAppStore((state) => state.currentWorkspaceId)
  const workspaces = useAppStore((state) => state.workspaces)
  const workspace = workspaces.find((item) => item.id === currentWorkspaceId)
  const isAdmin = Boolean(user?.isSeedAdmin)

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.18),_transparent_30%),linear-gradient(180deg,#09090f_0%,#11111b_45%,#171722_100%)] text-slate-50">
      <PageTitle />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(circle_at_60%_0%,rgba(59,130,246,0.18),transparent_58%)]" />
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 lg:px-6">
          <div>
            <div className="text-xs uppercase tracking-[0.35em] text-violet-200/80">Super Admin</div>
            <h1 className="mt-1 text-xl font-semibold text-white">Quản trị hệ thống</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              className="rounded-full border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
              onClick={() => navigate('/home')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Về trang chủ
            </Button>
            <Button
              type="button"
              className="hidden rounded-full bg-violet-400 px-4 text-slate-950 hover:bg-violet-300 sm:inline-flex"
              onClick={() => navigate('/app-store')}
            >
              App Store
            </Button>
          </div>
        </div>
      </header>

      <div className="relative mx-auto max-w-7xl px-4 pb-28 pt-5 lg:px-6 lg:pb-12">
        <section className="mb-6 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/7 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.35em] text-violet-200/80">Tổng quan</p>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-white">{tenant.name}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                  Quản lý người dùng, workspace, ứng dụng và trạng thái phát hành.
                </p>
              </div>
              <div className="text-right text-sm text-slate-300">
                <div className="font-medium text-white">{workspace?.name ?? 'No workspace selected'}</div>
                <div>{workspace ? getWorkspaceTypeLabel(workspace.type) : 'Chưa có workspace'}</div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Quyền truy cập</p>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400">Tài khoản</div>
                <div className="text-lg font-semibold text-white">{user?.name ?? 'Guest'}</div>
              </div>
              <div
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-semibold',
                  isAdmin ? 'bg-emerald-400/15 text-emerald-200' : 'bg-rose-400/15 text-rose-200',
                )}
              >
                {isAdmin ? 'admin' : 'viewer'}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <Link
                  key={tab.to}
                  to={tab.to}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition',
                    activeTab === tab.id
                      ? 'border-white/20 bg-white text-slate-900'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white',
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {children}
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-slate-950/90 px-3 py-3 backdrop-blur-xl md:hidden">
        <div className="mx-auto grid max-w-7xl grid-cols-5 gap-2">
          {tabs.map((tab) => (
            <Link
              key={tab.to}
              to={tab.to}
              className={cn(
                'flex flex-col items-center gap-1 rounded-2xl px-2 py-3 text-xs font-medium transition',
                activeTab === tab.id ? 'bg-white text-slate-900' : 'text-slate-400',
              )}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
