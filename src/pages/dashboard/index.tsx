import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CalendarDays,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  User as UserIcon,
  X,
} from 'lucide-react'

import Footer from '@/components/layout/footer'
import { Badge } from '@/components/ui/badge'
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
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { categoryOptions, groupedSections, modules, quickStats } from '@/data/data'
import { useLogout } from '@/hooks/useLogout'
import { ModuleSection } from '@/pages/dashboard/module/moduleSelection'
import { QuickActionCard, QuickStatCard, SectionHeader } from '@/pages/dashboard/quicks'
import { useAppStore } from '@/store/useAppStore'
import type { ModuleCategory } from '@/types/module'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, tenant } = useAppStore()
  const { logout: doLogout, busy: loggingOut } = useLogout()
  const activeCategory: ModuleCategory = 'all'
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const filteredModules =
    activeCategory === 'all'
      ? modules
      : modules.filter((module) => module.category === activeCategory)

  async function handleLogout() {
    await doLogout('/')
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-3 sm:px-6">
          {/* Left: hamburger (mobile) + logo + tenant */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen((v) => !v)}
              className="-ml-1 inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Mở menu"
            >
              {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link to="/" className="flex items-center gap-2 sm:gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-2xl text-white shadow-sm sm:h-11 sm:w-11"
                style={{ backgroundColor: tenant.primaryColor }}
              >
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <h1
                className="truncate text-lg font-bold sm:text-3xl"
                style={{ color: tenant.primaryColor }}
              >
                {tenant.name}
              </h1>
            </Link>
          </div>

          {/* Search — desktop only */}
          <div className="hidden flex-1 justify-center px-4 lg:flex">
            <div className="relative w-full max-w-sm">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="h-10 rounded-2xl border-slate-200 bg-slate-50 pl-9"
                placeholder="Tìm module như booking, kho, sân, hóa đơn..."
              />
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {user ? (
              <>
                {/* Sessions quick CTA — visible cho cả admin & user */}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5 rounded-xl px-2.5 sm:px-3"
                  onClick={() => navigate('/sessions')}
                >
                  <CalendarDays className="h-4 w-4" />
                  <span className="hidden sm:inline">Buổi cầu lông</span>
                </Button>

                <UserMenu
                  user={user}
                  onLogout={handleLogout}
                  loggingOut={loggingOut}
                  onNavigateProfile={() => navigate('/profile')}
                />
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5 rounded-xl px-2.5 sm:px-3"
                  onClick={() => navigate('/sessions')}
                >
                  <CalendarDays className="h-4 w-4" />
                  <span className="hidden sm:inline">Buổi cầu lông</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden h-9 rounded-xl sm:inline-flex"
                  onClick={() => navigate('/auth/login')}
                >
                  Đăng nhập
                </Button>
                <Button
                  size="sm"
                  className="h-9 rounded-xl px-3 text-white hover:opacity-90 sm:px-4"
                  style={{ backgroundColor: tenant.primaryColor }}
                  onClick={() => navigate('/auth/register')}
                >
                  Đăng ký
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mobile dropdown nav */}
        {mobileNavOpen && (
          <div className="border-t border-slate-200 bg-white px-3 py-3 lg:hidden">
            <div className="relative mb-3 sm:hidden">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="h-9 rounded-xl border-slate-200 bg-slate-50 pl-9"
                placeholder="Tìm kiếm module…"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {quickStats.map((s) => (
                <QuickStatCard key={s.label} value={s.value} label={s.label} />
              ))}
            </div>
          </div>
        )}
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-slate-200 bg-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.14),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.10),_transparent_24%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-8 px-3 py-10 sm:px-6 sm:py-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:px-8 lg:py-20">
            <div>
              <Badge
                variant="outline"
                className="rounded-full border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700 sm:px-4 sm:py-2 sm:text-sm"
              >
                Hệ thống quản lý {tenant.name}
              </Badge>
              <SectionHeader
                title={`Toàn bộ module vận hành của ${tenant.name}`}
                description="Quản lý bán hàng, sân thể thao, booking, đồ ăn thức uống, khách hàng và báo cáo trong một nền tảng duy nhất."
              />
              <div className="mt-6 flex flex-wrap gap-2 sm:mt-8 sm:gap-3">
                <Button
                  size="lg"
                  className="h-10 rounded-2xl bg-slate-900 px-5 text-sm hover:bg-slate-800 sm:h-11 sm:px-6 sm:text-base"
                  onClick={() => navigate('/sessions')}
                >
                  <CalendarDays className="mr-1.5 h-4 w-4" />
                  Quản lý buổi cầu lông
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-10 rounded-2xl px-5 text-sm sm:h-11 sm:px-6 sm:text-base"
                  onClick={() => navigate('/court')}
                >
                  Đặt sân ngay
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-1 xl:grid-cols-3">
              {quickStats.map((stat) => (
                <QuickStatCard key={stat.label} value={stat.value} label={stat.label} />
              ))}
            </div>
          </div>
        </section>

        {/* Quick actions */}
        <section className="mx-auto max-w-7xl px-3 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            <QuickActionCard
              title="Buổi cầu lông"
              description="Tạo buổi, đăng ký tham gia, điểm danh và quản lý thành viên."
              href="/sessions"
              icon={<CalendarDays className="h-4 w-4" />}
            />
            <QuickActionCard
              title="Cửa hàng dụng cụ"
              description="Kinh doanh vợt, giày và phụ kiện thể thao cao cấp."
              href="/shop"
            />
            <QuickActionCard
              title="Đặt sân mới"
              description="Tạo booking mới cho khách lẻ hoặc khách thành viên."
              href="/court"
            />
            <QuickActionCard
              title="Menu & Dịch vụ"
              description="Order nước uống, đồ ăn và dịch vụ hỗ trợ tại sân."
              href="/service"
            />
          </div>
        </section>

        {/* Category tabs */}
        <section className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <Tabs defaultValue="all" className="w-full">
            <div className="overflow-x-auto pb-2">
              <TabsList className="h-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
                {categoryOptions.map((option) => (
                  <TabsTrigger
                    key={option.value}
                    value={option.value}
                    className="rounded-xl px-3 py-2 text-xs data-[state=active]:bg-slate-900 data-[state=active]:text-white sm:px-4 sm:text-sm"
                  >
                    {option.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </Tabs>
        </section>

        {/* Module sections */}
        <section className="mx-auto max-w-7xl space-y-10 px-3 py-6 sm:space-y-14 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          {activeCategory === 'all'
            ? groupedSections.map((section) => {
                const sectionModules = modules.filter((module) =>
                  section.categories.includes(module.category),
                )
                return (
                  <ModuleSection
                    key={section.title}
                    title={section.title}
                    description={section.description}
                    data={sectionModules}
                  />
                )
              })
            : [
                <ModuleSection
                  key="filtered"
                  title="Danh mục theo bộ lọc"
                  description="Các module phù hợp với nhóm chức năng bạn đang quan tâm."
                  data={filteredModules}
                />,
              ]}
        </section>
      </main>
      <Footer />
    </div>
  )
}

function UserMenu({
  user,
  onLogout,
  onNavigateProfile,
  loggingOut,
}: {
  user: { id: number; name: string; email: string; role: string }
  onLogout: () => void
  onNavigateProfile: () => void
  loggingOut: boolean
}) {
  const initials = (user.name || user.email).trim().charAt(0).toUpperCase() || '?'
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-9 items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-1.5 text-xs font-medium text-slate-700 outline-none hover:bg-slate-50 sm:gap-2 sm:px-2.5 sm:text-sm">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-900 text-[11px] font-semibold text-white">
          {initials}
        </span>
        <span className="hidden max-w-[100px] truncate sm:inline">{user.name}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56 rounded-xl p-1">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 py-1.5">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                {initials}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-slate-900">{user.name}</div>
                <div className="truncate text-xs font-normal text-slate-500">{user.email}</div>
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
          <Link to="/sessions" className="flex w-full items-center">
            <CalendarDays className="mr-2 h-4 w-4" />
            Buổi cầu lông
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <Link to="/my-sessions" className="flex w-full items-center">
            <UserIcon className="mr-2 h-4 w-4" />
            Buổi của tôi
          </Link>
        </DropdownMenuItem>
        {user.role === 'admin' && (
          <DropdownMenuItem className="cursor-pointer">
            <Link to="/sessions/new" className="flex w-full items-center">
              <ShieldCheck className="mr-2 h-4 w-4" />
              Tạo buổi mới
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => onNavigateProfile()}
        >
          <UserIcon className="mr-2 h-4 w-4" />
          Hồ sơ
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          className="cursor-pointer"
          onClick={onLogout}
          disabled={loggingOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {loggingOut ? 'Đang đăng xuất…' : 'Đăng xuất'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
