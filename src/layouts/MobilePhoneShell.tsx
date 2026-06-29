import { type CSSProperties, type ReactNode, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  Home,
  Image as ImageIcon,
  Settings2,
  ShieldCheck,
  Store,
  UserRound,
} from 'lucide-react'

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
import { cn } from '@/lib/utils'
import {
  defaultMobileHomeSettings,
  type MobileHomeSettings,
  useAppStore,
} from '@/store/useAppStore'

export type MobilePhoneActiveTab = 'home' | 'app-store' | 'profile' | 'services' | 'admin'

type PhoneShortcut = {
  key: MobilePhoneActiveTab | 'settings'
  label: string
  icon: typeof Settings2
  onClick: () => void
}

export const phoneWallpaperOptions: Array<{
  value: MobileHomeSettings['wallpaper']
  label: string
  className: string
}> = [
  {
    value: 'aurora',
    label: 'Aurora',
    className:
      'bg-[radial-gradient(circle_at_15%_15%,rgba(20,184,166,0.8),transparent_32%),radial-gradient(circle_at_88%_24%,rgba(249,115,22,0.7),transparent_30%),linear-gradient(145deg,#111827_0%,#1f2937_46%,#0f172a_100%)]',
  },
  {
    value: 'daylight',
    label: 'Daylight',
    className:
      'bg-[radial-gradient(circle_at_20%_18%,rgba(56,189,248,0.9),transparent_35%),radial-gradient(circle_at_84%_74%,rgba(34,197,94,0.65),transparent_34%),linear-gradient(145deg,#f8fafc_0%,#dbeafe_48%,#fef3c7_100%)]',
  },
  {
    value: 'graphite',
    label: 'Graphite',
    className:
      'bg-[radial-gradient(circle_at_18%_18%,rgba(148,163,184,0.45),transparent_32%),radial-gradient(circle_at_82%_18%,rgba(45,212,191,0.35),transparent_28%),linear-gradient(145deg,#020617_0%,#1e293b_55%,#111827_100%)]',
  },
]

export function getPhoneWallpaperStyle(settings: MobileHomeSettings): CSSProperties | undefined {
  const image = settings.backgroundImage.trim().replace(/["'()\\]/g, '')

  if (!image) return undefined

  return {
    backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.22), rgba(15, 23, 42, 0.5)), url(${image})`,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
  }
}

function MobilePhoneDock({ activeTab }: { activeTab: MobilePhoneActiveTab }) {
  const navigate = useNavigate()
  const user = useAppStore((state) => state.user)
  const currentWorkspaceId = useAppStore((state) => state.currentWorkspaceId)
  const mobileHomeSettings = useAppStore((state) => state.mobileHomeSettings)
  const isCustomer = user?.accountType === 'customer' && !user?.isSeedAdmin
  const dockItems = isCustomer
    ? [
        { label: 'Dịch vụ', path: '/services', icon: Store, key: 'services' as const },
        { label: 'Hồ sơ', path: '/profile', icon: UserRound, key: 'profile' as const },
      ]
    : [
        { label: 'Home', path: '/home', icon: Home, key: 'home' as const },
        {
          label: currentWorkspaceId ? 'Store' : 'Setup',
          path: currentWorkspaceId ? '/app-store' : '/platform/setup',
          icon: Store,
          key: 'app-store' as const,
        },
        { label: 'Hồ sơ', path: '/profile', icon: UserRound, key: 'profile' as const },
        ...(user?.isSeedAdmin
          ? [{ label: 'Admin', path: '/admin/apps', icon: ShieldCheck, key: 'admin' as const }]
          : []),
      ]

  if (!mobileHomeSettings.showDock) return null

  return (
    <div className="relative z-10 px-4 pb-[calc(0.85rem+env(safe-area-inset-bottom))] xl:hidden">
      <div
        className={cn(
          'grid gap-2 rounded-[28px] border border-white/20 bg-white/16 p-2.5 shadow-[0_20px_70px_rgba(15,23,42,0.28)] backdrop-blur-2xl',
          dockItems.length === 2
            ? 'grid-cols-2'
            : dockItems.length === 3
              ? 'grid-cols-3'
              : 'grid-cols-4',
        )}
      >
        {dockItems.map((item) => {
          const active = activeTab === item.key

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => navigate(item.path)}
              className="flex min-w-0 flex-col items-center gap-1.5"
            >
              <span
                className={cn(
                  'grid h-10 w-10 place-items-center rounded-[15px] text-white transition',
                  active ? 'bg-white/30' : 'bg-white/14',
                )}
              >
                <item.icon className="h-5 w-5" />
              </span>
              {mobileHomeSettings.showLabels ? (
                <span className="w-full truncate text-center text-[10px] font-medium text-white/85">
                  {item.label}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function PhoneShortcutIcon({
  action,
  active,
  compact = false,
}: {
  action: PhoneShortcut
  active: boolean
  compact?: boolean
}) {
  return (
    <button
      type="button"
      onClick={action.onClick}
      aria-label={action.label}
      className={cn(
        'group flex min-w-0 shrink-0 flex-col items-center gap-1.5 text-center text-white',
        compact ? 'w-10' : 'w-16',
      )}
    >
      <span
        className={cn(
          'grid place-items-center border border-white/18 text-white shadow-[0_12px_35px_rgba(15,23,42,0.22)] backdrop-blur-xl transition group-hover:bg-white/28',
          compact ? 'h-10 w-10 rounded-full' : 'h-14 w-14 rounded-[18px]',
          active ? 'bg-white/32' : 'bg-white/16',
        )}
      >
        <action.icon className={compact ? 'h-5 w-5' : 'h-6 w-6'} />
      </span>
      {!compact ? (
        <span className="w-full truncate text-[10px] leading-3 font-semibold text-white/88 drop-shadow">
          {action.label}
        </span>
      ) : null}
    </button>
  )
}

function MobilePhoneSettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const mobileHomeSettings = useAppStore((state) => state.mobileHomeSettings)
  const updateMobileHomeSettings = useAppStore((state) => state.updateMobileHomeSettings)
  const resetMobileHomeSettings = useAppStore((state) => state.resetMobileHomeSettings)
  const [draftSettings, setDraftSettings] = useState<MobileHomeSettings>(mobileHomeSettings)

  const handleSave = () => {
    updateMobileHomeSettings({
      ...draftSettings,
      backgroundImage: draftSettings.backgroundImage.trim(),
    })
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) setDraftSettings(mobileHomeSettings)
        onOpenChange(nextOpen)
      }}
    >
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
            {[
              { key: 'showLabels' as const, label: 'Tên app' },
              { key: 'showDock' as const, label: 'Dock' },
            ].map((item) => {
              const checked = draftSettings[item.key]

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() =>
                    setDraftSettings((current) => ({ ...current, [item.key]: !current[item.key] }))
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
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button type="button" onClick={handleSave}>
            Cập nhật
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function MobilePhonePageFrame({
  children,
  activeTab,
  title,
  subtitle,
  contentClassName,
  showLauncherControls = false,
}: {
  children: ReactNode
  activeTab: MobilePhoneActiveTab
  title: string
  subtitle?: string
  contentClassName?: string
  showLauncherControls?: boolean
}) {
  const navigate = useNavigate()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const user = useAppStore((state) => state.user)
  const currentWorkspaceId = useAppStore((state) => state.currentWorkspaceId)
  const mobileHomeSettings = useAppStore((state) => state.mobileHomeSettings)
  const isCustomer = user?.accountType === 'customer' && !user?.isSeedAdmin
  const wallpaperClass =
    phoneWallpaperOptions.find((item) => item.value === mobileHomeSettings.wallpaper)?.className ??
    phoneWallpaperOptions[0].className
  const wallpaperStyle = getPhoneWallpaperStyle(mobileHomeSettings)
  const shortcuts: PhoneShortcut[] = showLauncherControls
    ? [
        {
          key: 'settings',
          label: 'Settings',
          icon: Settings2,
          onClick: () => setSettingsOpen(true),
        },
        isCustomer
          ? {
              key: 'services',
              label: 'Dịch vụ',
              icon: Store,
              onClick: () => navigate('/services'),
            }
          : {
              key: 'app-store',
              label: currentWorkspaceId ? 'App Store' : 'Setup',
              icon: Store,
              onClick: () => navigate(currentWorkspaceId ? '/app-store' : '/platform/setup'),
            },
        {
          key: 'home',
          label: 'Home',
          icon: Home,
          onClick: () => navigate('/home'),
        },
        {
          key: 'profile',
          label: 'Hồ sơ',
          icon: UserRound,
          onClick: () => navigate('/profile'),
        },
        ...(user?.isSeedAdmin
          ? [
              {
                key: 'admin' as const,
                label: 'Admin',
                icon: ShieldCheck,
                onClick: () => navigate('/admin/apps'),
              },
            ]
          : []),
      ]
    : []

  return (
    <section
      className={cn(
        'relative flex h-dvh min-h-dvh flex-col overflow-hidden text-white xl:contents',
        !mobileHomeSettings.backgroundImage.trim() && wallpaperClass,
      )}
      style={wallpaperStyle}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.08)_0%,rgba(2,6,23,0.24)_58%,rgba(2,6,23,0.42)_100%)] xl:hidden" />

      <div className="relative z-10 flex items-center gap-3 px-4 pt-4 xl:hidden">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Quay lại"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/18 text-white shadow-[0_12px_35px_rgba(15,23,42,0.2)] backdrop-blur-xl transition hover:bg-white/25"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          {subtitle ? (
            <div className="truncate text-[12px] font-medium text-white/70">{subtitle}</div>
          ) : null}
          <h1 className="truncate text-[20px] font-semibold tracking-normal text-white">{title}</h1>
        </div>
        {showLauncherControls ? (
          <div className="flex max-w-[48vw] shrink-0 items-center gap-1.5 overflow-x-auto pl-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {shortcuts.map((action) => (
              <PhoneShortcutIcon
                key={action.key}
                action={action}
                active={activeTab === action.key}
                compact
              />
            ))}
          </div>
        ) : null}
      </div>

      {showLauncherControls ? (
        <div className="relative z-10 px-4 pt-4 xl:hidden">
          <div className="flex gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {shortcuts.map((action) => (
              <PhoneShortcutIcon
                key={action.key}
                action={action}
                active={activeTab === action.key}
              />
            ))}
          </div>
        </div>
      ) : null}

      <div
        className={cn(
          'relative z-10 mx-3 mt-4 min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-t-[30px] bg-[#f5f7fb]/95 px-4 pt-5 pb-5 text-slate-950 shadow-[0_-12px_50px_rgba(15,23,42,0.16)] xl:contents',
          contentClassName,
        )}
      >
        {children}
      </div>

      {showLauncherControls ? <MobilePhoneDock activeTab={activeTab} /> : null}
      <MobilePhoneSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </section>
  )
}
