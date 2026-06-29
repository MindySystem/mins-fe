import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Building2, Loader2, Search, Store, Users2 } from 'lucide-react'
import { toast } from 'sonner'

import { PageTitle } from '@/components/PageTitle'
import { Button } from '@/components/ui/button'
import { PlatformLayout } from '@/layouts/PlatformLayout'
import { cn } from '@/lib/utils'
import { platformApi, type PlatformCustomerServiceDto } from '@/services/platform'
import { useAppStore } from '@/store/useAppStore'

export default function PlatformCustomerServicesPage() {
  const navigate = useNavigate()
  const user = useAppStore((state) => state.user)
  const [services, setServices] = useState<PlatformCustomerServiceDto[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const isBusinessView = user?.accountType === 'business' || user?.isSeedAdmin

  useEffect(() => {
    if (!user) return

    let active = true

    async function loadServices() {
      setLoading(true)
      try {
        const response = await platformApi.customerServices()
        if (active) setServices(response.services)
      } catch (error) {
        if (active)
          toast.error(error instanceof Error ? error.message : 'Không tải được danh sách dịch vụ')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadServices()

    return () => {
      active = false
    }
  }, [user])

  const filteredServices = useMemo(() => {
    const deduped = Array.from(
      new Map(
        services.map((service) => [`${service.workspace_id}-${service.app_code}`, service]),
      ).values(),
    )
    const keyword = query.trim().toLowerCase()
    if (!keyword) return deduped

    return deduped.filter((service) =>
      [service.app_name, service.category, service.workspace_name, service.company_name ?? ''].some(
        (value) => value.toLowerCase().includes(keyword),
      ),
    )
  }, [query, services])

  const workspaceCount = useMemo(
    () => new Set(filteredServices.map((item) => item.workspace_id)).size,
    [filteredServices],
  )

  return (
    <PlatformLayout
      activeTab="services"
      headerSearchValue={query}
      onHeaderSearchChange={setQuery}
      headerSearchPlaceholder="Tìm dịch vụ, công ty..."
    >
      <PageTitle title="Dịch vụ" />

      <div className="flex w-full flex-col">
        <header>
          <div>
            <h1 className="text-[28px] font-semibold tracking-tight text-slate-950 sm:text-[34px]">
              Dịch vụ
            </h1>
            <p className="mt-2 text-[14px] text-slate-500 sm:text-[16px]">
              {isBusinessView
                ? 'Danh sách dịch vụ đang mở cho khách hàng'
                : 'Chọn dịch vụ bạn muốn sử dụng'}
            </p>
          </div>
        </header>

        <label className="mt-4 flex h-11 items-center rounded-2xl border border-[#d7def7] bg-[#f8faff] px-4 xl:hidden">
          <Search className="h-4 w-4 text-slate-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm dịch vụ, công ty..."
            className="ml-3 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </label>

        <section className="grid flex-1 gap-6 py-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-[32px] border border-[#dbe3f7] bg-white p-6 shadow-[0_18px_45px_rgba(36,87,245,0.08)]">
            <span className="inline-flex rounded-full bg-[#eef4ff] px-4 py-2 text-sm font-semibold text-[#2457f5]">
              {isBusinessView ? 'Đang hoạt động' : 'Khả dụng'}
            </span>
            <h1 className="mt-5 text-[34px] leading-tight font-semibold tracking-tight sm:text-[44px]">
              {filteredServices.length} dịch vụ
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
              {isBusinessView
                ? 'Các dịch vụ đã được cài đặt và mở cho khách hàng.'
                : 'Dịch vụ từ các workspace đang hoạt động.'}
            </p>

            <div className="mt-8 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
              {[
                { label: 'Workspace đang mở', value: `${workspaceCount}` },
                { label: 'Dịch vụ khả dụng', value: `${filteredServices.length}` },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-3xl border border-[#e3e9fb] bg-[#f8faff] p-4"
                >
                  <div className="text-2xl font-semibold text-[#2457f5]">{item.value}</div>
                  <div className="mt-1">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-[#dbe3f7] bg-white p-4 shadow-[0_18px_45px_rgba(36,87,245,0.08)] sm:p-5">
            {loading ? (
              <div className="grid min-h-[420px] place-items-center text-slate-500">
                <div className="text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#2457f5]" />
                  <p className="mt-3 text-sm">Đang tải dịch vụ...</p>
                </div>
              </div>
            ) : filteredServices.length ? (
              <div className="grid gap-4 xl:grid-cols-2">
                {filteredServices.map((service) => (
                  <button
                    key={`${service.workspace_id}-${service.company_id ?? 'workspace'}-${service.app_code}`}
                    type="button"
                    onClick={() => navigate(service.customer_entry_path)}
                    className="group rounded-[26px] border border-[#dbe3f7] bg-white p-5 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#2457f5]/40 hover:shadow-[0_20px_45px_rgba(36,87,245,0.14)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[linear-gradient(135deg,#2457f5,#7c5cff)] text-white">
                        <Users2 className="h-5 w-5" />
                      </span>
                      <span className="rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-semibold text-[#2457f5]">
                        {service.category}
                      </span>
                    </div>

                    <h2 className="mt-5 text-lg font-semibold text-slate-950">
                      {service.app_name}
                    </h2>
                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                      <p className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-slate-400" />
                        {service.company_name ?? service.workspace_name}
                      </p>
                      <p className="line-clamp-1 text-slate-500">{service.workspace_name}</p>
                    </div>

                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#2457f5]">
                      Mở dịch vụ
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid min-h-[420px] place-items-center text-center">
                <div className="max-w-sm">
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-3xl bg-[#eef4ff] text-[#2457f5]">
                    <Store className="h-6 w-6" />
                  </div>
                  <h2 className="mt-4 text-xl font-semibold text-slate-950">
                    Chưa có dịch vụ phù hợp
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Khi workspace/company release dịch vụ cho khách hàng, danh sách sẽ xuất hiện tại
                    đây.
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    className={cn(
                      'mt-5 rounded-2xl border border-[#d7def7] bg-white px-5 text-slate-700',
                    )}
                    onClick={() => setQuery('')}
                  >
                    Xóa bộ lọc
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </PlatformLayout>
  )
}
