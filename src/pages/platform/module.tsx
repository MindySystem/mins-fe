import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, ExternalLink, Link as LinkIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ModuleLayout } from '@/layouts/ModuleLayout'
import { platformApi } from '@/services/platform'
import { useAppStore } from '@/store/useAppStore'
import { getPlatformAppBySlug } from '@/core/platform/registry'

export default function ModulePage() {
  const navigate = useNavigate()
  const { appCode } = useParams()
  const user = useAppStore((state) => state.user)
  const currentWorkspaceId = useAppStore((state) => state.currentWorkspaceId)
  const workspaceAppMap = useAppStore((state) => state.workspaceAppMap)
  const installedApps = currentWorkspaceId ? (workspaceAppMap[currentWorkspaceId] ?? []) : []
  const app = appCode ? getPlatformAppBySlug(appCode) : null
  const installed = app ? installedApps.includes(app.code) : false
  const [remoteStatus, setRemoteStatus] = useState<'idle' | 'checking' | 'allowed' | 'denied'>('idle')

  useEffect(() => {
    if (!user || !app || user.isSeedAdmin || app.adminOnly || installed || !currentWorkspaceId) {
      setRemoteStatus('idle')
      return
    }

    let active = true
    setRemoteStatus('checking')

    platformApi
      .openApp(currentWorkspaceId, app.code)
      .then(() => {
        if (active) setRemoteStatus('allowed')
      })
      .catch(() => {
        if (active) setRemoteStatus('denied')
      })

    return () => {
      active = false
    }
  }, [app, currentWorkspaceId, installed, user])

  if (!user) return <Navigate to="/auth/login" replace />
  if (!app) return <Navigate to="/home" replace />
  if (app.adminOnly && !user.isSeedAdmin) return <Navigate to="/home" replace />
  if (remoteStatus === 'checking') return null
  if (!user.isSeedAdmin && !app.adminOnly && (!currentWorkspaceId || (!installed && remoteStatus !== 'allowed'))) {
    return <Navigate to="/app-store" replace />
  }

  return (
    <ModuleLayout app={app}>
      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Ứng dụng</p>
          <h1 className="mt-4 text-2xl font-semibold text-white">{app.name}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">{app.description}</p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              type="button"
              className="rounded-full bg-white px-5 text-slate-950 hover:bg-slate-100"
              onClick={() => navigate(app.launchPath)}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Mở ứng dụng
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="rounded-full border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
              onClick={() => navigate('/app-store')}
            >
              <LinkIcon className="mr-2 h-4 w-4" />
              App Store
            </Button>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/7 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Chức năng</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {app.actions
              .filter((item) => !item.adminOnly || user.isSeedAdmin)
              .map((item) => (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => navigate(item.href)}
                  className="rounded-3xl border border-white/10 bg-slate-950/55 p-4 text-left transition hover:-translate-y-0.5 hover:bg-slate-950/75"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium text-white">{item.label}</div>
                      <div className="mt-1 text-sm text-slate-400">{item.href}</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </div>
                </button>
              ))}
          </div>
        </div>
      </section>
    </ModuleLayout>
  )
}
