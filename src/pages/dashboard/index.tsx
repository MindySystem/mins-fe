import { useNavigate } from 'react-router-dom'
import { LogOut, Sparkles, User as UserIcon } from 'lucide-react'

import Footer from '@/components/layout/footer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { categoryOptions, groupedSections, modules, quickStats } from '@/data/data'
import { ModuleSection } from '@/pages/dashboard/module/moduleSelection'
import { QuickActionCard, QuickStatCard, SectionHeader } from '@/pages/dashboard/quicks'
import { useAppStore } from '@/store/useAppStore'
import type { ModuleCategory } from '@/types/module'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, tenant, logout } = useAppStore()
  const activeCategory: ModuleCategory = 'all'

  const filteredModules =
    activeCategory === 'all'
      ? modules
      : modules.filter((module) => module.category === activeCategory)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 lg:px-3">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-sm"
              style={{ backgroundColor: tenant.primaryColor }}
            >
              <Sparkles className="h-5 w-5" />
            </div>
            <h1 className="m-8 p-0 text-3xl font-bold" style={{ color: tenant.primaryColor }}>
              {tenant.name}
            </h1>
          </div>

          <div className="hidden w-full max-w-sm lg:block">
            <Input
              className="rounded-2xl border-slate-200 bg-slate-50"
              placeholder="Tìm module như booking, kho, sân, hóa đơn..."
            />
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="mr-2 hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 sm:flex">
                  <UserIcon className="h-4 w-4" />
                  <span>Xin chào, {user.name}</span>
                </div>
                <Button
                  variant="outline"
                  className="rounded-2xl"
                  onClick={() => {
                    logout()
                    navigate('/') // Refresh to public view
                  }}
                >
                  Đăng xuất
                  <LogOut className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  className="rounded-2xl text-white shadow-sm"
                  style={{ backgroundColor: tenant.primaryColor }}
                  onClick={() => navigate('/court')}
                >
                  Đặt sân ngay
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="hidden rounded-2xl sm:inline-flex"
                  onClick={() => navigate('/auth/login')}
                >
                  Đăng nhập
                </Button>
                <Button
                  className="rounded-2xl text-white hover:opacity-90"
                  style={{ backgroundColor: tenant.primaryColor }}
                  onClick={() => navigate('/auth/register')}
                >
                  Đăng ký dùng thử
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-slate-200 bg-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.14),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.10),_transparent_24%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:px-8 lg:py-20">
            <div>
              <Badge
                variant="outline"
                className="rounded-full border-emerald-200 bg-emerald-50 px-4 py-2 text-emerald-700"
              >
                Hệ thống quản lý {tenant.name}
              </Badge>
              <SectionHeader
                title={`Toàn bộ module vận hành của ${tenant.name}`}
                description="Quản lý bán hàng, sân thể thao, booking, đồ ăn thức uống, khách hàng và báo cáo trong một nền tảng duy nhất."
              />
              <div className="mt-8 flex flex-wrap gap-3">
                <Button className="rounded-2xl bg-slate-900 px-6 hover:bg-slate-800">
                  Khám phá module
                </Button>
                <Button variant="outline" className="rounded-2xl px-6">
                  Xem demo flow vận hành
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {quickStats.map((stat) => (
                <QuickStatCard key={stat.label} value={stat.value} label={stat.label} />
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <div className="grid gap-4 lg:grid-cols-4">
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
            <QuickActionCard
              title="Xem lịch hôm nay"
              description="Theo dõi sân đang chơi, sân trống và booking sắp tới."
              href="/court"
            />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-6 lg:px-8">
          <Tabs defaultValue="all" className="w-full">
            <div className="overflow-x-auto pb-2">
              <TabsList className="h-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
                {categoryOptions.map((option) => (
                  <TabsTrigger
                    key={option.value}
                    value={option.value}
                    className="rounded-xl px-4 py-2.5 text-sm data-[state=active]:bg-slate-900 data-[state=active]:text-white"
                  >
                    {option.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </Tabs>
        </section>

        <section className="mx-auto max-w-7xl space-y-14 px-6 py-8 lg:px-8 lg:py-10">
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
