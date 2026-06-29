import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Globe2,
  Monitor,
  MoreHorizontal,
  Settings2,
  ShieldCheck,
  Star,
  Users2,
  Wifi,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { PlatformLayout } from '@/layouts/PlatformLayout'
import { cn } from '@/lib/utils'
import { platformApi, type PlatformAppDto } from '@/services/platform'
import { useAppStore } from '@/store/useAppStore'
import {
  getPlatformApp,
  getPlatformAppBySlug,
  type PlatformAppCode,
} from '@/core/platform/registry'

type AppDetailMeta = {
  displayName: string
  shortDescription: string
  longDescription: string
  category: string
  version: string
  updatedAt: string
  size: string
  support: string
  rating: string
  reviews: number
  users: string
  tone: string
  features: Array<{
    title: string
    description: string
    tone: string
    icon: typeof ShieldCheck
  }>
}

const appDetailMeta: Partial<Record<PlatformAppCode, AppDetailMeta>> = {
  court_management: {
    displayName: 'Quản lý sân cầu',
    shortDescription: 'Quản lý sân, booking, shop, dịch vụ và nhân viên tại sân cầu.',
    longDescription:
      'Ứng dụng giúp chủ sân cầu lông quản lý toàn bộ hoạt động kinh doanh tại sân: đặt sân, quản lý sân, dịch vụ, cửa hàng, đơn hàng và nhân viên một cách dễ dàng và hiệu quả.',
    category: 'Kinh doanh',
    version: '2.3.1',
    updatedAt: '20/05/2024',
    size: '32.5 MB',
    support: 'support@sporthub.vn',
    rating: '4.8',
    reviews: 128,
    users: '1.2k',
    tone: 'bg-[linear-gradient(135deg,#7c5cff,#4d5ef6)]',
    features: [
      {
        title: 'Quản lý sân & Lịch đặt',
        description: 'Quản lý thông tin sân, khung giờ và lịch đặt của khách hàng.',
        tone: 'bg-[#eef4ff] text-[#2457f5]',
        icon: ShieldCheck,
      },
      {
        title: 'Dịch vụ & Shop',
        description: 'Bán hàng, quản lý sản phẩm và dịch vụ tại sân.',
        tone: 'bg-[#f0eaff] text-[#7257ff]',
        icon: CalendarDays,
      },
      {
        title: 'Quản lý nhân viên',
        description: 'Phân quyền, chấm công và theo dõi hiệu suất nhân viên.',
        tone: 'bg-[#f4ecff] text-[#6d5efc]',
        icon: Users2,
      },
      {
        title: 'Báo cáo & Thống kê',
        description: 'Báo cáo doanh thu, lượt đặt sân và hiệu quả kinh doanh.',
        tone: 'bg-[#eaf8ef] text-[#16a34a]',
        icon: BarChart3,
      },
    ],
  },
  team_badminton: {
    displayName: 'Team Badminton',
    shortDescription: 'Quản lý team, thành viên, lịch chơi và chi phí mỗi buổi.',
    longDescription:
      'Ứng dụng giúp team cầu lông tổ chức lịch chơi, chia chi phí, xác nhận thanh toán và theo dõi thành viên rõ ràng.',
    category: 'Thể thao',
    version: '1.8.0',
    updatedAt: '12/05/2024',
    size: '18.4 MB',
    support: 'team@sporthub.vn',
    rating: '4.7',
    reviews: 95,
    users: '842',
    tone: 'bg-[linear-gradient(135deg,#34c759,#12b76a)]',
    features: [
      {
        title: 'Lịch chơi',
        description: 'Tạo lịch, mời thành viên và theo dõi đăng ký.',
        tone: 'bg-[#ecfdf3] text-[#16a34a]',
        icon: CalendarDays,
      },
      {
        title: 'Chia chi phí',
        description: 'Tính tiền sân, cầu nước và chi phí phát sinh.',
        tone: 'bg-[#eef4ff] text-[#2457f5]',
        icon: BarChart3,
      },
      {
        title: 'Thành viên',
        description: 'Quản lý vai trò, trạng thái tham gia và thanh toán.',
        tone: 'bg-[#f4ecff] text-[#6d5efc]',
        icon: Users2,
      },
    ],
  },
  motorbike_shop: {
    displayName: 'Shop Mô tô',
    shortDescription: 'Quản lý bán hàng mô tô, tồn kho, khách hàng và đơn hàng.',
    longDescription:
      'Ứng dụng dành cho shop mô tô, hỗ trợ quản lý sản phẩm, tồn kho, đơn hàng, khách hàng và vận hành bán hàng hằng ngày.',
    category: 'Bán hàng',
    version: '1.4.2',
    updatedAt: '08/05/2024',
    size: '41.8 MB',
    support: 'moto@sporthub.vn',
    rating: '4.6',
    reviews: 76,
    users: '650',
    tone: 'bg-[linear-gradient(135deg,#ff9a28,#ff5f2e)]',
    features: [
      {
        title: 'Sản phẩm',
        description: 'Quản lý xe, phụ kiện, hình ảnh và thông số.',
        tone: 'bg-[#fff7ed] text-[#f97316]',
        icon: ShieldCheck,
      },
      {
        title: 'Đơn hàng',
        description: 'Theo dõi trạng thái đơn và lịch sử khách hàng.',
        tone: 'bg-[#eef4ff] text-[#2457f5]',
        icon: CalendarDays,
      },
      {
        title: 'Doanh thu',
        description: 'Báo cáo bán hàng và hiệu quả vận hành.',
        tone: 'bg-[#eaf8ef] text-[#16a34a]',
        icon: BarChart3,
      },
    ],
  },
}

const tabs = ['Tổng quan', 'Tính năng', 'Ảnh chụp màn hình', 'Đánh giá', 'Thông tin'] as const

function getDetailMeta(code: PlatformAppCode): AppDetailMeta {
  const app = getPlatformApp(code)

  return (
    appDetailMeta[code] ?? {
      displayName: app?.name ?? 'Ứng dụng',
      shortDescription: app?.description ?? 'Ứng dụng trong hệ thống SportHub.',
      longDescription: app?.detail ?? 'Thông tin ứng dụng đang được cập nhật.',
      category: app?.category ?? 'Công cụ',
      version: '1.0.0',
      updatedAt: '20/05/2024',
      size: '24.0 MB',
      support: 'support@sporthub.vn',
      rating: '4.5',
      reviews: 42,
      users: '300',
      tone: 'bg-[linear-gradient(135deg,#2457f5,#7c8cff)]',
      features: [
        {
          title: 'Quản lý tập trung',
          description: 'Theo dõi dữ liệu và thao tác chính trong một nơi.',
          tone: 'bg-[#eef4ff] text-[#2457f5]',
          icon: ShieldCheck,
        },
      ],
    }
  )
}

export default function AppDetailPage() {
  const navigate = useNavigate()
  const { appCode } = useParams()
  const user = useAppStore((state) => state.user)
  const currentWorkspaceId = useAppStore((state) => state.currentWorkspaceId)
  const workspaceAppMap = useAppStore((state) => state.workspaceAppMap)
  const installApp = useAppStore((state) => state.installApp)
  const uninstallApp = useAppStore((state) => state.uninstallApp)
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('Tổng quan')
  const [menuOpen, setMenuOpen] = useState(false)
  const [expandedMobileTab, setExpandedMobileTab] = useState<(typeof tabs)[number]>('Tổng quan')
  const [apiDetail, setApiDetail] = useState<PlatformAppDto | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [uninstallDialogOpen, setUninstallDialogOpen] = useState(false)

  const app = appCode ? getPlatformAppBySlug(appCode) : null
  const installed = app
    ? (workspaceAppMap[currentWorkspaceId] ?? []).includes(app.code) ||
      apiDetail?.status === 'installed'
    : false
  const releaseStatus = apiDetail?.release_status

  useEffect(() => {
    if (!user || !appCode) return

    let active = true

    platformApi
      .appDetail(appCode)
      .then((detail) => {
        if (active) setApiDetail(detail)
      })
      .catch(() => undefined)

    return () => {
      active = false
    }
  }, [appCode, user])

  if (!user) return <Navigate to="/auth/login" replace />
  if (!app) return <Navigate to="/app-store" replace />
  if (app.adminOnly && !user.isSeedAdmin) return <Navigate to="/home" replace />

  const meta = getDetailMeta(app.code)
  const canOpen =
    (installed || app.kind === 'core' || app.adminOnly) && releaseStatus !== 'maintenance'
  const recommendedApps = ['team_badminton', 'motorbike_shop', 'admin_portal']
    .map((code) => getPlatformApp(code as PlatformAppCode))
    .filter((item): item is NonNullable<ReturnType<typeof getPlatformApp>> => Boolean(item))
    .filter((item) => item.code !== app.code)

  const handleInstall = async () => {
    if (!currentWorkspaceId && !app.adminOnly) {
      toast.info('Cần thiết lập workspace trước khi cài ứng dụng.')
      navigate('/platform/setup')
      return
    }

    setSubmitting(true)
    try {
      const installedApp = await platformApi.installApp(currentWorkspaceId, app.code)
      setApiDetail(installedApp)
      installApp(app.code)
      toast.success(`Đã cài ${meta.displayName}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Không cài được ${meta.displayName}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleOpen = async () => {
    if (releaseStatus === 'maintenance') {
      toast.info('Ứng dụng đang bảo trì.')
      return
    }

    if (!currentWorkspaceId && !app.adminOnly) {
      toast.info('Cần thiết lập workspace trước khi truy cập ứng dụng.')
      navigate('/platform/setup')
      return
    }

    if (!canOpen) {
      await handleInstall()
      return
    }

    setSubmitting(true)
    try {
      const response = await platformApi.openApp(currentWorkspaceId, app.code)
      navigate(response.launch_path)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không mở được ứng dụng')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUninstall = async () => {
    if (app.kind === 'core' || app.adminOnly) {
      toast.info('Ứng dụng hệ thống không thể gỡ.')
      return
    }

    if (!currentWorkspaceId) {
      toast.info('Cần thiết lập workspace trước khi quản lý ứng dụng.')
      navigate('/platform/setup')
      return
    }

    setSubmitting(true)
    try {
      await platformApi.uninstallApp(currentWorkspaceId, app.code)
      uninstallApp(app.code)
      setApiDetail((current) => (current ? { ...current, status: 'available' } : current))
      setMenuOpen(false)
      toast.success(`Đã gỡ ${meta.displayName}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Không gỡ được ${meta.displayName}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleStats = () => {
    setMenuOpen(false)
    setActiveTab('Đánh giá')
    setExpandedMobileTab('Đánh giá')
    toast.info('Đã mở thống kê sử dụng.')
  }

  const handleSettings = () => {
    setMenuOpen(false)
    setActiveTab('Thông tin')
    setExpandedMobileTab('Thông tin')
    toast.info('Đã mở thông tin ứng dụng.')
  }

  return (
    <PlatformLayout activeTab="app-store" headerSearchPlaceholder="Tìm kiếm ứng dụng...">
      <div className="w-full">
        <section className="flex items-center gap-4">
          <Link
            to="/app-store"
            className="inline-flex items-center gap-2 text-[15px] font-semibold text-slate-950 transition hover:text-[#2457f5]"
          >
            <ArrowLeft className="h-5 w-5" />
            App Store
          </Link>
        </section>

        <section className="mt-8 grid gap-5 xl:grid-cols-[1fr_auto]">
          <div className="flex gap-4 sm:gap-6">
            <div
              className={cn(
                'grid h-[76px] w-[76px] shrink-0 place-items-center rounded-[18px] text-white shadow-[0_18px_45px_rgba(15,23,42,0.16)] sm:h-[112px] sm:w-[112px] sm:rounded-[28px] xl:h-[150px] xl:w-[150px]',
                meta.tone,
              )}
            >
              <app.icon className="h-10 w-10 sm:h-16 sm:w-16 xl:h-20 xl:w-20" />
            </div>

            <div className="min-w-0 flex-1 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[22px] leading-tight font-semibold tracking-tight text-slate-950 sm:text-[28px] xl:text-[34px]">
                  {meta.displayName}
                </h1>
                <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 sm:text-[12px]">
                  {installed ? 'Đã cài đặt' : 'Chưa cài đặt'}
                </span>
              </div>

              <p className="mt-2 max-w-3xl text-[13px] leading-6 text-slate-600 sm:text-[15px] xl:text-[17px]">
                {meta.shortDescription}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-[12px] text-slate-500 sm:text-[14px]">
                <span className="inline-flex items-center gap-1">
                  <Star className="h-4 w-4 fill-[#ffb020] text-[#ffb020]" />
                  <span>{meta.rating}</span>
                  <span>({meta.reviews})</span>
                </span>
                <span className="h-4 w-px bg-slate-200" />
                <span className="inline-flex items-center gap-1">
                  <Users2 className="h-4 w-4" />
                  {meta.users} người dùng
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-[12px] text-slate-500 sm:text-[14px]">
                <span>Phiên bản {meta.version}</span>
                <span className="h-4 w-px bg-slate-200" />
                <span>Cập nhật: {meta.updatedAt}</span>
              </div>
            </div>
          </div>

          <div className="relative flex gap-3 xl:min-w-[260px] xl:items-center">
            <button
              type="button"
              onClick={handleOpen}
              disabled={submitting || releaseStatus === 'maintenance'}
              className={cn(
                'inline-flex h-11 flex-1 items-center justify-center rounded-xl text-[14px] font-medium transition disabled:cursor-not-allowed disabled:opacity-70 sm:h-12 sm:text-[15px] xl:h-[52px]',
                releaseStatus === 'maintenance'
                  ? 'bg-amber-100 text-amber-700'
                  : canOpen
                    ? 'border border-[#2457f5] bg-white text-[#2457f5] hover:bg-[#eef4ff]'
                    : 'bg-[#2457f5] text-white shadow-[0_12px_24px_rgba(36,87,245,0.22)] hover:bg-[#1f49cf]',
              )}
            >
              {releaseStatus === 'maintenance' ? 'Bảo trì' : canOpen ? 'Mở ứng dụng' : 'Cài đặt'}
            </button>

            {installed && app.code !== 'admin_portal' ? (
              <button
                type="button"
                onClick={() => setUninstallDialogOpen(true)}
                disabled={submitting}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-red-200 bg-white px-4 text-[14px] font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70 sm:h-12 sm:text-[15px] xl:h-[52px]"
              >
                Gỡ cài đặt
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              className="grid h-11 w-12 shrink-0 place-items-center rounded-xl border border-[#dbe2f2] bg-white text-slate-700 hover:bg-slate-50 sm:h-12 xl:h-[52px]"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>

            {menuOpen ? (
              <div className="absolute top-[58px] right-0 z-20 w-56 rounded-2xl border border-[#dbe2f2] bg-white p-2 shadow-[0_20px_60px_rgba(15,23,42,0.14)]">
                <button
                  type="button"
                  onClick={handleSettings}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Settings2 className="h-4 w-4" />
                  Cài đặt ứng dụng
                </button>
                <button
                  type="button"
                  onClick={handleStats}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] font-medium text-slate-700 hover:bg-slate-50"
                >
                  <BarChart3 className="h-4 w-4" />
                  Thống kê sử dụng
                </button>
              </div>
            ) : null}
          </div>
        </section>

        <section className="mt-9 hidden border-b border-[#dbe2f2] sm:flex">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                'relative h-14 px-7 text-[15px] font-medium transition',
                activeTab === tab ? 'text-[#2457f5]' : 'text-slate-500 hover:text-slate-900',
              )}
            >
              {tab}
              {activeTab === tab ? (
                <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#2457f5]" />
              ) : null}
            </button>
          ))}
        </section>

        <div className="mt-5 hidden grid-cols-[1.2fr_0.9fr] gap-5 sm:grid xl:grid-cols-[1.2fr_0.9fr]">
          <div className="space-y-5">
            <OverviewCard meta={meta} compact={activeTab !== 'Tổng quan'} />
            <SystemRequirements />
          </div>
          <div className="space-y-5">
            <InfoCard meta={meta} />
            <Recommendations apps={recommendedApps} />
          </div>
        </div>

        <section className="mt-5 space-y-2 sm:hidden">
          {tabs.map((tab) => {
            const open = expandedMobileTab === tab
            return (
              <div
                key={tab}
                className="overflow-hidden rounded-xl border border-[#e1e7f4] bg-white"
              >
                <button
                  type="button"
                  onClick={() => setExpandedMobileTab(open ? 'Tổng quan' : tab)}
                  className={cn(
                    'flex w-full items-center justify-between px-4 py-3 text-left text-[14px] font-semibold',
                    open ? 'bg-[#eef4ff] text-[#2457f5]' : 'text-slate-800',
                  )}
                >
                  {tab}
                  {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {open ? (
                  <div className="border-t border-[#e1e7f4] p-4">
                    {tab === 'Tổng quan' ? <OverviewCard meta={meta} mobile /> : null}
                    {tab === 'Tính năng' ? <FeatureList meta={meta} /> : null}
                    {tab === 'Ảnh chụp màn hình' ? <ScreenshotPlaceholders /> : null}
                    {tab === 'Đánh giá' ? <RatingPanel meta={meta} /> : null}
                    {tab === 'Thông tin' ? <InfoRows meta={meta} /> : null}
                  </div>
                ) : null}
              </div>
            )
          })}
        </section>

        <Dialog open={uninstallDialogOpen} onOpenChange={setUninstallDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Gỡ cài đặt ứng dụng</DialogTitle>
              <DialogDescription>
                Bạn có chắc muốn gỡ {meta.displayName} khỏi workspace hiện tại không?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUninstallDialogOpen(false)}>
                Hủy
              </Button>
              <Button
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={() => {
                  setUninstallDialogOpen(false)
                  void handleUninstall()
                }}
                disabled={submitting}
              >
                Gỡ cài đặt
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PlatformLayout>
  )
}

function OverviewCard({
  meta,
  compact = false,
  mobile = false,
}: {
  meta: AppDetailMeta
  compact?: boolean
  mobile?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-[22px] border border-[#e1e7f4] bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.04)]',
        mobile ? 'border-0 p-0 shadow-none' : '',
      )}
    >
      <h2 className="text-[18px] font-semibold text-slate-950">Mô tả</h2>
      <p className="mt-4 text-[14px] leading-7 text-slate-600 sm:text-[15px]">
        {meta.longDescription}
      </p>
      {mobile ? (
        <button className="mt-3 text-[13px] font-semibold text-[#2457f5]">Xem thêm</button>
      ) : null}
      {!compact ? <FeatureList meta={meta} className="mt-7" /> : null}
    </div>
  )
}

function FeatureList({ meta, className }: { meta: AppDetailMeta; className?: string }) {
  return (
    <div className={cn('space-y-5', className)}>
      {meta.features.map((feature) => (
        <div key={feature.title} className="flex gap-4">
          <div
            className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-xl', feature.tone)}
          >
            <feature.icon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[15px] font-semibold text-slate-950">{feature.title}</div>
            <div className="mt-1 text-[14px] leading-6 text-slate-600">{feature.description}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function SystemRequirements() {
  const items = [
    { label: 'Trình duyệt', value: 'Chrome 90+, Edge 90+', icon: Globe2 },
    { label: 'Thiết bị', value: 'Desktop, Tablet, Mobile', icon: Monitor },
    { label: 'Kết nối', value: 'Internet ổn định', icon: Wifi },
  ]

  return (
    <div className="rounded-[22px] border border-[#e1e7f4] bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.04)]">
      <h2 className="text-[18px] font-semibold text-slate-950">Yêu cầu hệ thống</h2>
      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-start gap-3">
            <item.icon className="h-6 w-6 text-[#2457f5]" />
            <div>
              <div className="text-[15px] font-semibold text-slate-950">{item.label}</div>
              <div className="mt-1 text-[13px] text-slate-600">{item.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function InfoCard({ meta }: { meta: AppDetailMeta }) {
  return (
    <div className="rounded-[22px] border border-[#e1e7f4] bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.04)]">
      <h2 className="text-[18px] font-semibold text-slate-950">Thông tin ứng dụng</h2>
      <InfoRows meta={meta} />
    </div>
  )
}

function InfoRows({ meta }: { meta: AppDetailMeta }) {
  const rows = [
    ['Nhà phát triển', 'SportHub Team'],
    ['Danh mục', meta.category],
    ['Ngôn ngữ', 'Tiếng Việt'],
    ['Kích thước', meta.size],
    ['Hỗ trợ', meta.support],
    ['Chính sách bảo mật', 'Xem chi tiết'],
    ['Điều khoản sử dụng', 'Xem chi tiết'],
  ]

  return (
    <div className="mt-5 space-y-4 text-[14px]">
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-center justify-between gap-4">
          <span className="text-slate-500">{label}</span>
          <span
            className={cn(
              'text-right font-medium text-slate-950',
              value.includes('@') || value.includes('Xem') ? 'text-[#2457f5]' : '',
            )}
          >
            {value}
          </span>
        </div>
      ))}
    </div>
  )
}

function Recommendations({
  apps,
}: {
  apps: Array<NonNullable<ReturnType<typeof getPlatformApp>>>
}) {
  return (
    <div className="rounded-[22px] border border-[#e1e7f4] bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between">
        <h2 className="text-[18px] font-semibold text-slate-950">Bạn cũng có thể thích</h2>
        <Link to="/app-store" className="text-[14px] font-medium text-[#2457f5]">
          Xem tất cả
        </Link>
      </div>
      <div className="mt-5 space-y-4">
        {apps.map((app, index) => (
          <Link
            key={app.code}
            to={`/app-store/${app.slug}`}
            className="flex items-center gap-4 rounded-2xl p-2 transition hover:bg-slate-50"
          >
            <div
              className={cn(
                'grid h-12 w-12 place-items-center rounded-xl text-white',
                app.code === 'team_badminton'
                  ? 'bg-[linear-gradient(135deg,#34c759,#12b76a)]'
                  : app.code === 'motorbike_shop'
                    ? 'bg-[linear-gradient(135deg,#ff922b,#ff5f57)]'
                    : 'bg-[linear-gradient(135deg,#2f8cff,#2469f5)]',
              )}
            >
              <app.icon className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[15px] font-semibold text-slate-950">
                {app.code === 'motorbike_shop' ? 'Shop Mô tô' : app.name}
              </div>
              <div className="mt-1 truncate text-[14px] text-slate-500">{app.description}</div>
            </div>
            <span className="inline-flex items-center gap-1 text-[14px] font-medium text-orange-500">
              <Star className="h-4 w-4 fill-current" />
              {(4.7 - index * 0.1).toFixed(1)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

function ScreenshotPlaceholders() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="h-24 rounded-2xl border border-[#dbe2f2] bg-[linear-gradient(135deg,#eef4ff,#ffffff)] p-4"
        >
          <Monitor className="h-5 w-5 text-[#2457f5]" />
          <div className="mt-3 text-[13px] font-semibold text-slate-700">Màn hình {item}</div>
        </div>
      ))}
    </div>
  )
}

function RatingPanel({ meta }: { meta: AppDetailMeta }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-white text-orange-500">
        <Star className="h-6 w-6 fill-current" />
      </div>
      <div>
        <div className="text-[22px] font-semibold text-slate-950">{meta.rating}</div>
        <div className="text-[13px] text-slate-500">{meta.reviews} đánh giá từ người dùng</div>
      </div>
    </div>
  )
}
