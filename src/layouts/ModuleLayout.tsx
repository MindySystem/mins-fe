import type { ReactNode } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft, BadgeCheck, Store } from 'lucide-react'

import { PageTitle } from '@/components/PageTitle'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'
import type { PlatformApp } from '@/core/platform/registry'

type ModuleLayoutProps = {
  app: PlatformApp
  children: ReactNode
}

export function ModuleLayout({ app, children }: ModuleLayoutProps) {
  const navigate = useNavigate()
  const user = useAppStore((state) => state.user)
  const currentWorkspaceId = useAppStore((state) => state.currentWorkspaceId)
  const workspaces = useAppStore((state) => state.workspaces)
  const workspaceAppMap = useAppStore((state) => state.workspaceAppMap)
  const workspace = workspaces.find((item) => item.id === currentWorkspaceId)
  const isAdmin = Boolean(user?.isSeedAdmin)
  const installedApps = currentWorkspaceId ? (workspaceAppMap[currentWorkspaceId] ?? []) : []
  const installed = installedApps.includes(app.code)

  if (app.adminOnly && !isAdmin) return <Navigate to="/home" replace />

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <PageTitle title={app.name} />
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 lg:px-6">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              className="rounded-full border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg',
                app.kind === 'admin'
                  ? 'bg-violet-500/90'
                  : app.kind === 'module'
                    ? 'bg-cyan-500/90'
                    : 'bg-slate-600/90',
              )}
            >
              <app.icon className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.32em] text-slate-400">Module</div>
              <h1 className="text-xl font-semibold text-white">{app.name}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold',
                installed ? 'bg-emerald-400/15 text-emerald-200' : 'bg-amber-400/15 text-amber-200',
              )}
            >
              <BadgeCheck className="h-3.5 w-3.5" />
              {installed ? 'Installed' : 'Not installed'}
            </span>
            <Link
              to="/app-store"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 hover:bg-white/10"
            >
              <Store className="h-4 w-4" />
              App Store
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
        <section
          className={cn(
            'rounded-[2rem] border border-white/10 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl',
            app.kind === 'admin'
              ? 'bg-gradient-to-br from-violet-500/25 via-slate-900 to-slate-950'
              : app.kind === 'module'
                ? 'bg-gradient-to-br from-cyan-500/15 via-slate-900 to-slate-950'
                : 'bg-gradient-to-br from-white/8 via-slate-900 to-slate-950',
          )}
        >
          <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200">
                {workspace ? `${workspace.name} • workspace` : 'Workspace unknown'}
              </div>
              <h2 className="mt-4 text-3xl font-semibold text-white">{app.description}</h2>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300">{app.detail}</p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  type="button"
                  className="rounded-full bg-white px-5 text-slate-950 hover:bg-slate-100"
              onClick={() => navigate(app.launchPath)}
            >
                  {app.primaryAction}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="rounded-full border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                  onClick={() => navigate('/home')}
                >
                  Back to home
                </Button>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Highlights</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {app.highlights.map((item) => (
                    <span key={item} className="rounded-full bg-white/8 px-3 py-1.5 text-sm text-slate-100">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4">
                <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Permissions</div>
                <ul className="mt-3 space-y-2 text-sm text-slate-300">
                  {app.permissionNotes.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {app.stats.map((item) => (
            <div key={item} className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              {item}
            </div>
          ))}
        </section>

        <div className="mt-6">{children}</div>
      </main>
    </div>
  )
}
