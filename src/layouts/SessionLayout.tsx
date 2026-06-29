import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Plus,
  ShieldCheck,
  User as UserIcon,
  UserCircle2,
  Settings2,
} from 'lucide-react'

import { LogoMark } from '@/components/brand/LogoMark'
import { PageTitle } from '@/components/PageTitle'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLogout } from '@/hooks/useLogout'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'

const tabs = [
  { to: '/sessions', label: 'Tất cả buổi', icon: CalendarDays },
  { to: '/my-sessions', label: 'Buổi của tôi', icon: UserCircle2 },
] as const

export default function SessionLayout() {
  const { user, tenant } = useAppStore()
  const isAdmin = user?.role === 'admin'
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, busy } = useLogout()

  const atRoot = location.pathname === '/sessions' || location.pathname === '/my-sessions'

  return (
    <div className="min-h-screen bg-slate-50/50">
      <PageTitle />
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-3 sm:px-6">
          {/* Left: Dashboard Logo + back (conditional) + module brand */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Logo Dashboard */}
            <Link
              to="/home"
              className="flex items-center gap-1.5 rounded-lg py-1 hover:opacity-90"
              aria-label="Về trang chủ"
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-xs sm:h-9 sm:w-9"
                style={{ backgroundColor: tenant.primaryColor }}
              >
                <LogoMark className="h-5 w-5 sm:h-6 sm:w-6" title={tenant.name} />
              </div>
            </Link>

            {/* Back button (Only shown when not at root) */}
            {!atRoot && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 rounded-lg p-0 text-slate-500 hover:bg-slate-100"
                onClick={() => navigate(-1)}
                aria-label="Quay lại"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Center: tabs (collapse to icon on mobile) */}
          <nav className="flex flex-1 items-center justify-center gap-1">
            {tabs.map((t) => {
              const Icon = t.icon
              const active = location.pathname === t.to
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  className={cn(
                    'inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium transition sm:px-3',
                    active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{t.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Right: admin create + user menu */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {isAdmin && (
              <div className="flex items-center gap-1.5">
                <Link
                  to="/sessions/admin"
                  className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:gap-1.5 sm:px-3"
                >
                  <Settings2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Quản trị</span>
                </Link>
                <Link
                  to="/sessions/new"
                  className="inline-flex h-9 items-center gap-1 rounded-lg bg-slate-900 px-2.5 text-sm font-medium text-white hover:bg-slate-800 sm:gap-1.5 sm:px-3"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Tạo buổi</span>
                </Link>
              </div>
            )}

            {user ? <UserMenu busy={busy} onLogout={() => logout('/')} /> : <LoginButton />}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  )
}

function UserMenu({ busy, onLogout }: { busy: boolean; onLogout: () => void }) {
  const user = useAppStore((s) => s.user)!
  const initials = (user.name || user.email).trim().charAt(0).toUpperCase() || '?'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-9 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-1.5 text-sm font-medium text-slate-700 outline-none hover:bg-slate-50 sm:gap-2 sm:px-2.5">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-900 text-[11px] font-semibold text-white">
          {initials}
        </span>
        <span className="hidden max-w-[120px] truncate sm:inline">{user.name}</span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56 rounded-xl p-1">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 py-1.5">
            <div className="text-sm font-semibold text-slate-900">{user.name}</div>
            <div className="truncate text-xs font-normal text-slate-500">{user.email}</div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
          <Link to="/my-sessions" className="flex w-full items-center">
            <UserCircle2 className="mr-2 h-4 w-4" />
            Buổi của tôi
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <Link to="/sessions" className="flex w-full items-center">
            <CalendarDays className="mr-2 h-4 w-4" />
            Tất cả buổi
          </Link>
        </DropdownMenuItem>
        {user.role === 'admin' && (
          <DropdownMenuItem className="cursor-pointer">
            <Link to="/sessions/admin" className="flex w-full items-center">
              <Settings2 className="mr-2 h-4 w-4" />
              Quản trị sessions
            </Link>
          </DropdownMenuItem>
        )}
        {user.role === 'admin' && (
          <DropdownMenuItem className="cursor-pointer">
            <Link to="/sessions/new" className="flex w-full items-center">
              <ShieldCheck className="mr-2 h-4 w-4" />
              Tạo buổi mới
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
          <Link to="/" className="flex w-full items-center">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Về Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <Link to="/profile" className="flex w-full items-center">
            <UserIcon className="mr-2 h-4 w-4" />
            Hồ sơ
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={onLogout}
          disabled={busy}
          className="cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {busy ? 'Đang đăng xuất…' : 'Đăng xuất'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function LoginButton() {
  return (
    <Link
      to="/auth/login"
      className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-slate-900 px-3 text-sm font-medium text-white hover:bg-slate-800"
    >
      <UserIcon className="h-4 w-4" />
      <span className="hidden sm:inline">Đăng nhập</span>
    </Link>
  )
}
