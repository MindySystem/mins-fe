import { type ChangeEvent, type ReactNode, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Bell,
  ChevronDown,
  HelpCircle,
  Home,
  LogOut,
  Menu,
  Search,
  Settings2,
  ShieldCheck,
  Store,
} from 'lucide-react'

import { LogoMark } from '@/components/brand/LogoMark'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { getPlatformApp, getWorkspaceTypeLabel } from '@/core/platform/registry'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'

import { type MobilePhoneActiveTab, MobilePhonePageFrame } from './MobilePhoneShell'

type PlatformLayoutProps = {
  children: ReactNode
  activeTab: 'home' | 'app-store' | 'profile' | 'services'
  mobileShell?: 'default' | 'phone' | 'phone-home' | 'phone-page'
  mobileTitle?: string
  mobileSubtitle?: string
  showHeader?: boolean
  headerSearchValue?: string
  headerSearchPlaceholder?: string
  onHeaderSearchChange?: (value: string) => void
}

function getRoleLabel(user: ReturnType<typeof useAppStore.getState>['user']) {
  if (!user) return 'Guest'
  if (user.isSeedAdmin) return 'Super Admin'
  if (user.accountType === 'customer') return 'Khách hàng'
  if (user.role === 'admin') return 'Quản trị workspace'
  if (user.role === 'shop_manager') return 'Quản lý cửa hàng'
  if (user.role === 'staff') return 'Nhân viên'
  return 'Business'
}

function getScopeText(user: ReturnType<typeof useAppStore.getState>['user']) {
  if (!user) return 'Truy cập hệ thống'
  if (user.isSeedAdmin) return 'Quản trị app, workspace và release hệ thống'
  if (user.accountType === 'customer') return 'Khám phá và sử dụng dịch vụ đang mở'
  return 'Quản lý workspace, công ty và ứng dụng đã cài'
}

export function PlatformLayout({
  children,
  activeTab,
  mobileShell = 'default',
  mobileTitle,
  mobileSubtitle,
  showHeader = true,
  headerSearchValue,
  headerSearchPlaceholder = 'Tìm kiếm ứng dụng...',
  onHeaderSearchChange,
}: PlatformLayoutProps) {
  const navigate = useNavigate()
  const user = useAppStore((state) => state.user)
  const tenant = useAppStore((state) => state.tenant)
  const workspaces = useAppStore((state) => state.workspaces)
  const currentWorkspaceId = useAppStore((state) => state.currentWorkspaceId)
  const setCurrentWorkspaceId = useAppStore((state) => state.setCurrentWorkspaceId)
  const logout = useAppStore((state) => state.logout)
  const workspaceAppMap = useAppStore((state) => state.workspaceAppMap)
  const workspace = workspaces.find((item) => item.id === currentWorkspaceId) ?? workspaces[0]
  const hasWorkspace = Boolean(workspace)
  const notificationCount = 12
  const accountType = user?.accountType ?? 'customer'
  const isCustomer = accountType === 'customer' && !user?.isSeedAdmin
  const isBusiness = !isCustomer
  const isPhoneShell = mobileShell !== 'default'
  const isPhonePageShell = mobileShell === 'phone-page'
  const roleLabel = getRoleLabel(user)
  const scopeText = getScopeText(user)
  const [headerSearchDraft, setHeaderSearchDraft] = useState(headerSearchValue ?? '')
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const installedCodes = currentWorkspaceId ? (workspaceAppMap[currentWorkspaceId] ?? []) : []
  const sidebarApps = installedCodes
    .map((code) => getPlatformApp(code))
    .filter((app): app is NonNullable<ReturnType<typeof getPlatformApp>> => Boolean(app))
    .filter((app) => !app.adminOnly || user?.isSeedAdmin)
  const navItems = isCustomer
    ? [
        { to: '/services', label: 'Dịch vụ', icon: Store, key: 'services' },
        { to: '/profile', label: 'Hồ sơ', icon: Settings2, key: 'profile' },
      ]
    : [
        { to: '/home', label: 'Trang chủ', icon: Home, key: 'home' },
        { to: '/app-store', label: 'App Store', icon: Store, key: 'app-store' },
        { to: '/home', label: 'Thông báo', icon: Bell, key: 'notifications', badge: 12 },
        { to: '/profile', label: 'Hồ sơ', icon: Settings2, key: 'profile' },
        ...(user?.isSeedAdmin
          ? [{ to: '/admin/apps', label: 'Super Admin', icon: ShieldCheck, key: 'admin' }]
          : []),
      ]
  const mobileNavItems = isCustomer
    ? [
        { to: '/services', label: 'Dịch vụ', icon: Store, key: 'services' },
        { to: '/profile', label: 'Hồ sơ', icon: Settings2, key: 'profile' },
      ]
    : [
        { to: '/home', label: 'Trang chủ', icon: Home, key: 'home' },
        { to: '/app-store', label: 'App Store', icon: Store, key: 'app-store' },
        { to: '/home', label: 'Thông báo', icon: Bell, key: 'notifications', badge: 12 },
        { to: '/profile', label: 'Hồ sơ', icon: Settings2, key: 'profile' },
      ]

  useEffect(() => {
    setHeaderSearchDraft(headerSearchValue ?? '')
  }, [headerSearchValue])

  const resolvedSearchValue = headerSearchValue ?? headerSearchDraft

  const handleHeaderSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    if (onHeaderSearchChange) {
      onHeaderSearchChange(value)
      return
    }

    setHeaderSearchDraft(value)
  }
  const resolvedMobileTitle =
    mobileTitle ??
    (activeTab === 'app-store'
      ? 'App Store'
      : activeTab === 'profile'
        ? 'Hồ sơ'
        : activeTab === 'services'
          ? 'Dịch vụ'
          : 'SportHub')
  const resolvedMobileSubtitle =
    mobileSubtitle ??
    (activeTab === 'app-store'
      ? 'Ứng dụng'
      : activeTab === 'profile'
        ? 'Tài khoản'
        : activeTab === 'services'
          ? 'Khách hàng'
          : 'Workspace')

  return (
    <div
      className={cn(
        'h-dvh overflow-hidden text-[14px] text-slate-900',
        isPhoneShell ? 'overscroll-none bg-[#111827] xl:bg-[#f4f7fb]' : 'bg-[#f4f7fb]',
      )}
    >
      <div className="flex h-dvh">
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-[272px] shrink-0 flex-col overflow-y-auto border-r border-[#e5ebf5] bg-[#f4f7fb] xl:flex">
          <div className="px-8 pt-8 pb-6">
            <Link to={isCustomer ? '/services' : '/home'} className="flex items-center gap-3">
              <LogoMark className="h-8 w-8 text-[#2457f5]" title="SportHub" />
              <span className="text-[18px] font-semibold tracking-tight text-slate-950">
                SportHub
              </span>
            </Link>
          </div>

          <nav className="space-y-1 px-4">
            {navItems.map((item) => {
              const active = activeTab === item.key
              const badge = 'badge' in item ? item.badge : undefined

              return (
                <Link
                  key={`${item.key}-${item.to}`}
                  to={item.to}
                  className={cn(
                    'flex items-center gap-3 rounded-[14px] px-4 py-2.5 text-[14px] font-medium transition',
                    active
                      ? 'bg-[#eaf1ff] text-[#2457f5]'
                      : 'text-slate-700 hover:bg-white hover:text-slate-950',
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="flex-1">{item.label}</span>
                  {badge ? (
                    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                      {badge}
                    </span>
                  ) : null}
                </Link>
              )
            })}
          </nav>

          {isBusiness ? (
            <div className="mt-6 border-t border-[#e5ebf5] px-8 pt-6">
              <div className="text-[12px] font-semibold tracking-[0.08em] text-slate-500 uppercase">
                Workspace
              </div>
              {hasWorkspace ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="mt-3 flex w-full items-center justify-between rounded-[14px] px-3 py-2.5 text-left transition hover:bg-white">
                    <div className="min-w-0">
                      <div className="truncate text-[14px] font-medium text-slate-900">
                        {workspace?.name}
                      </div>
                      <div className="truncate text-[12px] text-slate-500">
                        {workspace ? getWorkspaceTypeLabel(workspace.type) : ''} •{' '}
                        {workspace?.owner}
                      </div>
                    </div>
                    <ChevronDown className="ml-3 h-4 w-4 shrink-0 text-slate-500" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="min-w-64 rounded-2xl p-2">
                    {workspaces.map((item) => (
                      <DropdownMenuItem
                        key={item.id}
                        className="cursor-pointer rounded-xl px-3 py-2"
                        onClick={() => setCurrentWorkspaceId(item.id)}
                      >
                        <div className="w-full">
                          <div className="font-medium text-slate-900">{item.name}</div>
                          <div className="text-xs text-slate-500">
                            {getWorkspaceTypeLabel(item.type)} • {item.memberCount} members
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/platform/setup')}
                  className="mt-3 flex w-full items-center justify-between rounded-[14px] border border-dashed border-[#bfcdfd] px-3 py-3 text-left text-[13px] font-medium text-[#2457f5]"
                >
                  Tạo workspace đầu tiên
                </button>
              )}
            </div>
          ) : null}

          {isBusiness ? (
            <div className="mt-6 px-8">
              <div className="text-[12px] font-semibold tracking-[0.08em] text-slate-500 uppercase">
                Ứng dụng
              </div>
              <div className="mt-3 space-y-1">
                {sidebarApps.length ? (
                  sidebarApps.map((app) => (
                    <button
                      key={app.code}
                      type="button"
                      onClick={() => navigate(app.openPath)}
                      className="flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-left transition hover:bg-white"
                    >
                      <span
                        className={cn(
                          'grid h-9 w-9 shrink-0 place-items-center rounded-[12px] text-white',
                          app.code === 'team_badminton'
                            ? 'bg-[linear-gradient(135deg,#34c759,#12b76a)]'
                            : app.code === 'motorbike_shop'
                              ? 'bg-[linear-gradient(135deg,#ff922b,#ff5f57)]'
                              : 'bg-[linear-gradient(135deg,#6d5efc,#4d6cf8)]',
                        )}
                      >
                        <app.icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-slate-800">
                        {app.code === 'court_management'
                          ? 'Quản lý sân cầu'
                          : app.code === 'motorbike_shop'
                            ? 'Shop Mô tô'
                            : app.name}
                      </span>
                    </button>
                  ))
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate(hasWorkspace ? '/app-store' : '/platform/setup')}
                    className="w-full rounded-[14px] border border-dashed border-[#bfcdfd] px-3 py-3 text-left text-[13px] font-medium text-[#2457f5]"
                  >
                    {hasWorkspace ? 'Cài app từ App Store' : 'Thiết lập workspace'}
                  </button>
                )}
              </div>
            </div>
          ) : null}

          <div className="mt-auto px-6 pt-6 pb-8">
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-[14px] px-4 py-2.5 text-[14px] font-medium text-slate-700 transition hover:bg-white hover:text-slate-950"
              onClick={() => navigate(isCustomer ? '/services' : '/home')}
            >
              <HelpCircle className="h-5 w-5" />
              Hỗ trợ
            </button>
            <button
              type="button"
              className="mt-1 flex w-full items-center gap-3 rounded-[14px] px-4 py-2.5 text-[14px] font-medium text-slate-700 transition hover:bg-white hover:text-slate-950"
              onClick={() => navigate(isCustomer ? '/services' : '/profile')}
            >
              {isCustomer ? <Store className="h-5 w-5" /> : <Settings2 className="h-5 w-5" />}
              {isCustomer ? 'Dịch vụ' : 'Cài đặt'}
            </button>
          </div>
        </aside>

        <main
          className={cn(
            'flex h-dvh min-w-0 flex-1 flex-col overflow-y-auto xl:ml-[272px]',
            isPhoneShell ? 'bg-transparent xl:bg-white' : 'bg-white',
          )}
        >
          <header
            className={cn(
              'sticky top-0 z-30 border-b border-[#e8edf5] bg-white px-4 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)] xl:hidden',
              isPhoneShell && 'hidden',
            )}
          >
            <div className="flex items-center gap-3">
              <Sheet>
                <SheetTrigger className="grid h-9 w-9 place-items-center rounded-full text-slate-700 transition hover:bg-slate-50">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Mở menu</span>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-[86vw] max-w-[340px] gap-0 overflow-y-auto border-r border-[#e5ebf5] bg-[#f4f7fb] p-0"
                >
                  <SheetHeader className="border-b border-[#e5ebf5] px-5 py-5 text-left">
                    <SheetTitle className="flex items-center gap-3 text-[18px] font-semibold text-slate-950">
                      <LogoMark className="h-8 w-8 text-[#2457f5]" title="SportHub" />
                      SportHub
                    </SheetTitle>
                    <SheetDescription className="text-[13px] text-slate-500">
                      {scopeText}
                    </SheetDescription>
                  </SheetHeader>

                  <div className="space-y-5 px-4 py-5">
                    <nav className="space-y-1">
                      {navItems.map((item) => {
                        const active = activeTab === item.key
                        const badge = 'badge' in item ? item.badge : undefined

                        return (
                          <SheetClose
                            key={`${item.key}-${item.to}`}
                            render={
                              <Link
                                to={item.to}
                                className={cn(
                                  'flex items-center gap-3 rounded-[14px] px-4 py-3 text-[14px] font-medium transition',
                                  active
                                    ? 'bg-[#eaf1ff] text-[#2457f5]'
                                    : 'text-slate-700 hover:bg-white hover:text-slate-950',
                                )}
                              />
                            }
                          >
                            <item.icon className="h-5 w-5" />
                            <span className="flex-1">{item.label}</span>
                            {badge ? (
                              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                                {badge}
                              </span>
                            ) : null}
                          </SheetClose>
                        )
                      })}
                    </nav>

                    {isBusiness ? (
                      <div className="border-t border-[#e5ebf5] pt-5">
                        <div className="px-2 text-[12px] font-semibold tracking-[0.08em] text-slate-500 uppercase">
                          Workspace
                        </div>
                        {hasWorkspace ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger className="mt-3 flex w-full items-center justify-between rounded-[14px] bg-white px-3 py-3 text-left">
                              <div className="min-w-0">
                                <div className="truncate text-[14px] font-medium text-slate-900">
                                  {workspace?.name}
                                </div>
                                <div className="truncate text-[12px] text-slate-500">
                                  {workspace ? getWorkspaceTypeLabel(workspace.type) : ''} •{' '}
                                  {workspace?.owner}
                                </div>
                              </div>
                              <ChevronDown className="ml-3 h-4 w-4 shrink-0 text-slate-500" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="min-w-64 rounded-2xl p-2">
                              {workspaces.map((item) => (
                                <DropdownMenuItem
                                  key={item.id}
                                  className="cursor-pointer rounded-xl px-3 py-2"
                                  onClick={() => setCurrentWorkspaceId(item.id)}
                                >
                                  <div className="w-full">
                                    <div className="font-medium text-slate-900">{item.name}</div>
                                    <div className="text-xs text-slate-500">
                                      {getWorkspaceTypeLabel(item.type)} • {item.memberCount}{' '}
                                      members
                                    </div>
                                  </div>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <SheetClose
                            render={
                              <button
                                type="button"
                                onClick={() => navigate('/platform/setup')}
                                className="mt-3 flex w-full items-center justify-between rounded-[14px] border border-dashed border-[#bfcdfd] px-3 py-3 text-left text-[13px] font-medium text-[#2457f5]"
                              />
                            }
                          >
                            Tạo workspace đầu tiên
                          </SheetClose>
                        )}
                      </div>
                    ) : null}

                    {isBusiness ? (
                      <div className="border-t border-[#e5ebf5] pt-5">
                        <div className="px-2 text-[12px] font-semibold tracking-[0.08em] text-slate-500 uppercase">
                          Ứng dụng
                        </div>
                        <div className="mt-3 space-y-1">
                          {sidebarApps.length ? (
                            sidebarApps.map((app) => (
                              <SheetClose
                                key={app.code}
                                render={
                                  <button
                                    type="button"
                                    onClick={() => navigate(app.openPath)}
                                    className="flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-left transition hover:bg-white"
                                  />
                                }
                              >
                                <span
                                  className={cn(
                                    'grid h-9 w-9 shrink-0 place-items-center rounded-[12px] text-white',
                                    app.code === 'team_badminton'
                                      ? 'bg-[linear-gradient(135deg,#34c759,#12b76a)]'
                                      : app.code === 'motorbike_shop'
                                        ? 'bg-[linear-gradient(135deg,#ff922b,#ff5f57)]'
                                        : 'bg-[linear-gradient(135deg,#6d5efc,#4d6cf8)]',
                                  )}
                                >
                                  <app.icon className="h-4 w-4" />
                                </span>
                                <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-slate-800">
                                  {app.code === 'court_management'
                                    ? 'Quản lý sân cầu'
                                    : app.code === 'motorbike_shop'
                                      ? 'Shop Mô tô'
                                      : app.name}
                                </span>
                              </SheetClose>
                            ))
                          ) : (
                            <SheetClose
                              render={
                                <button
                                  type="button"
                                  onClick={() =>
                                    navigate(hasWorkspace ? '/app-store' : '/platform/setup')
                                  }
                                  className="w-full rounded-[14px] border border-dashed border-[#bfcdfd] px-3 py-3 text-left text-[13px] font-medium text-[#2457f5]"
                                />
                              }
                            >
                              {hasWorkspace ? 'Cài app từ App Store' : 'Thiết lập workspace'}
                            </SheetClose>
                          )}
                        </div>
                      </div>
                    ) : null}

                    <div className="border-t border-[#e5ebf5] pt-5">
                      <button
                        type="button"
                        onClick={() => {
                          logout()
                          navigate('/auth/login')
                        }}
                        className="flex w-full items-center gap-3 rounded-[14px] px-4 py-3 text-[14px] font-medium text-slate-700 transition hover:bg-white hover:text-slate-950"
                      >
                        <LogOut className="h-5 w-5" />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              <Link
                to={isCustomer ? '/services' : '/home'}
                className="flex min-w-0 items-center gap-2"
              >
                <LogoMark className="h-5 w-5 text-[#2457f5]" title={tenant.name} />
                <span className="truncate text-[14px] font-semibold text-slate-950">
                  {isCustomer ? 'Dịch vụ' : activeTab === 'app-store' ? 'App Store' : 'SportHub'}
                </span>
              </Link>

              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMobileSearchOpen((value) => !value)}
                  className="grid h-9 w-9 place-items-center rounded-full text-slate-600 transition hover:bg-slate-50"
                >
                  <Search className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  className="relative grid h-9 w-9 place-items-center rounded-full text-slate-600 transition hover:bg-slate-50"
                >
                  <Bell className="h-4 w-4" />
                  {notificationCount ? (
                    <span className="absolute top-0 right-0 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                      {notificationCount}
                    </span>
                  ) : null}
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-[#eef4ff] text-xs font-semibold text-[#2457f5]"
                >
                  {user?.name?.trim().charAt(0).toUpperCase() ?? 'G'}
                </button>
              </div>
            </div>
            {onHeaderSearchChange ? (
              <label
                className={cn(
                  'mt-3 flex h-10 items-center rounded-xl border border-[#d7def7] bg-white px-3 transition',
                  mobileSearchOpen ? 'flex' : 'hidden',
                )}
              >
                <Search className="h-4 w-4 shrink-0 text-slate-500" />
                <input
                  value={resolvedSearchValue}
                  onChange={handleHeaderSearchChange}
                  placeholder={headerSearchPlaceholder}
                  className="ml-3 w-full bg-transparent text-[13px] text-slate-700 outline-none placeholder:text-slate-400"
                  autoFocus
                />
              </label>
            ) : null}
          </header>

          {showHeader ? (
            <header className="sticky top-0 z-30 hidden border-b border-[#e8edf5] bg-white px-8 py-3 xl:block">
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-[14px] font-semibold text-slate-950">{tenant.name}</div>
                  <div className="mt-1 text-[12px] text-slate-500">{scopeText}</div>
                </div>

                <label className="ml-6 flex h-10 w-[320px] items-center rounded-[14px] border border-[#dbe2f2] bg-[#f8faff] px-4 text-slate-500">
                  <Search className="h-4 w-4" />
                  <input
                    value={resolvedSearchValue}
                    onChange={handleHeaderSearchChange}
                    placeholder={headerSearchPlaceholder}
                    className="ml-3 w-full bg-transparent text-[13px] text-slate-700 outline-none placeholder:text-slate-400"
                  />
                </label>

                <div className="ml-auto flex items-center gap-3">
                  <button
                    type="button"
                    className="relative grid h-10 w-10 place-items-center rounded-full border border-[#dbe2f2] bg-white text-slate-600"
                  >
                    <Bell className="h-4 w-4" />
                    {notificationCount ? (
                      <span className="absolute -top-0.5 -right-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                        {notificationCount}
                      </span>
                    ) : null}
                  </button>

                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-3 rounded-full border border-[#dbe2f2] bg-white px-2 py-1.5 pr-3 transition hover:bg-slate-50">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-[#eef4ff] text-sm font-semibold text-[#2457f5]">
                        {user?.name?.trim().charAt(0).toUpperCase() ?? 'G'}
                      </span>
                      <span className="text-left">
                        <span className="block text-[14px] font-semibold text-slate-900">
                          {user?.name ?? 'Guest'}
                        </span>
                        <span className="block text-[12px] text-slate-500">{roleLabel}</span>
                      </span>
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-56 rounded-2xl p-2">
                      <DropdownMenuItem
                        className="cursor-pointer rounded-xl px-3 py-2"
                        onClick={() => navigate('/profile')}
                      >
                        Hồ sơ của tôi
                      </DropdownMenuItem>
                      {isCustomer ? (
                        <DropdownMenuItem
                          className="cursor-pointer rounded-xl px-3 py-2"
                          onClick={() => navigate('/services')}
                        >
                          Dịch vụ của tôi
                        </DropdownMenuItem>
                      ) : (
                        <>
                          <DropdownMenuItem
                            className="cursor-pointer rounded-xl px-3 py-2"
                            onClick={() => navigate('/home')}
                          >
                            Trang chủ
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer rounded-xl px-3 py-2"
                            onClick={() => navigate('/app-store')}
                          >
                            App Store
                          </DropdownMenuItem>
                          {user?.isSeedAdmin ? (
                            <DropdownMenuItem
                              className="cursor-pointer rounded-xl px-3 py-2"
                              onClick={() => navigate('/admin/apps')}
                            >
                              Super Admin
                            </DropdownMenuItem>
                          ) : null}
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="cursor-pointer rounded-xl px-3 py-2"
                        onClick={() => {
                          logout()
                          navigate('/auth/login')
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Đăng xuất
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </header>
          ) : null}

          <div
            className={cn(
              'flex-1',
              isPhoneShell
                ? 'px-0 pt-0 pb-0 sm:px-0 xl:px-8 xl:pt-5 xl:pb-8'
                : 'px-4 pt-5 pb-[calc(6.5rem+env(safe-area-inset-bottom))] sm:px-6 xl:pt-5 xl:pb-8',
            )}
          >
            {isPhonePageShell ? (
              <MobilePhonePageFrame
                activeTab={activeTab as MobilePhoneActiveTab}
                title={resolvedMobileTitle}
                subtitle={resolvedMobileSubtitle}
              >
                {children}
              </MobilePhonePageFrame>
            ) : (
              children
            )}
          </div>
        </main>
      </div>

      <nav
        className={cn(
          'fixed inset-x-0 bottom-0 z-40 border-t border-[#e8edf5] bg-white px-3 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_-10px_24px_rgba(15,23,42,0.04)] xl:hidden',
          isPhoneShell && 'hidden',
        )}
      >
        <div
          className={cn('grid gap-1', mobileNavItems.length === 2 ? 'grid-cols-2' : 'grid-cols-4')}
        >
          {mobileNavItems.map((item) => {
            const active = activeTab === item.key
            const badge = 'badge' in item ? item.badge : undefined

            return (
              <Link
                key={item.key}
                to={item.to}
                className={cn(
                  'relative flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-1.5 text-[11px] font-medium transition',
                  active
                    ? 'text-[#2457f5]'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800',
                )}
              >
                <span className="relative">
                  <item.icon className="h-5 w-5" />
                  {badge ? (
                    <span className="absolute -top-2 -right-2.5 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[9px] font-semibold text-white">
                      {badge}
                    </span>
                  ) : null}
                </span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
