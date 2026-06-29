import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  Grid2x2,
  Headphones,
  Lock,
  Menu,
  ShieldCheck,
  Smile,
  Smartphone,
  Star,
  type LucideIcon,
  Users2,
  Zap,
  Receipt,
} from 'lucide-react'

import { LogoMark } from '@/components/brand/LogoMark'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'

const featureHighlights = [
  {
    title: 'Cài đặt nhanh chóng',
    description: 'Trong 1 phút',
    icon: Zap,
    tone: 'bg-[#eef4ff] text-[#2457f5]',
  },
  {
    title: 'Bảo mật tuyệt đối',
    description: 'Dữ liệu của bạn luôn an toàn',
    icon: ShieldCheck,
    tone: 'bg-[#ebfbef] text-[#16a34a]',
  },
  {
    title: 'Miễn Phí',
    description: 'Dùng thử 14 ngày',
    icon: Receipt,
    tone: 'bg-[#f4ecff] text-[#7c5cff]',
  },
] as const

const platformBenefits = [
  {
    title: 'Tất cả trong một nền tảng',
    description: 'Tích hợp nhiều ứng dụng quản lý dành cho các mô hình kinh doanh khác nhau.',
    icon: Grid2x2,
    tone: 'bg-[#f4ecff] text-[#7c5cff]',
  },
  {
    title: 'Tiết kiệm thời gian',
    description: 'Tự động hóa quy trình, giảm thiểu công việc thủ công và sai sót.',
    icon: Zap,
    tone: 'bg-[#ecfff4] text-[#16a34a]',
  },
  {
    title: 'Bảo mật & ổn định',
    description: 'Hệ thống bảo mật nhiều lớp, dữ liệu được mã hóa và sao lưu định kỳ.',
    icon: ShieldCheck,
    tone: 'bg-[#fff6e9] text-[#f59e0b]',
  },
  {
    title: 'Truy cập mọi lúc, mọi nơi',
    description: 'Sử dụng dễ dàng trên máy tính, máy tính bảng và điện thoại mọi lúc.',
    icon: Smartphone,
    tone: 'bg-[#eef4ff] text-[#2457f5]',
  },
  {
    title: 'Hỗ trợ tận tâm',
    description: 'Đội ngũ hỗ trợ luôn sẵn sàng giúp bạn giải quyết vấn đề nhanh chóng.',
    icon: Headphones,
    tone: 'bg-[#fff0f8] text-[#db2777]',
  },
] as const

const platformStats = [
  {
    label: '5.000+',
    value: 5000,
    suffix: '+',
    decimals: 0,
    description: 'Khách hàng tin tưởng',
    icon: Smile,
    tone: 'from-[#2457f5] to-[#7c5cff]',
  },
  {
    label: '10+',
    value: 10,
    suffix: '+',
    decimals: 0,
    description: 'Ứng dụng đa dạng',
    icon: Grid2x2,
    tone: 'from-[#2563eb] to-[#22c55e]',
  },
  {
    label: '50.000+',
    value: 50000,
    suffix: '+',
    decimals: 0,
    description: 'Người dùng đang sử dụng',
    icon: Users2,
    tone: 'from-[#3b82f6] to-[#06b6d4]',
  },
  {
    label: '99.9%',
    value: 99.9,
    suffix: '%',
    decimals: 1,
    description: 'Thời gian hoạt động',
    icon: ShieldCheck,
    tone: 'from-[#22c55e] to-[#16a34a]',
  },
  {
    label: '4.9/5',
    value: 4.9,
    suffix: '/5',
    decimals: 1,
    description: 'Đánh giá từ khách hàng',
    icon: Star,
    tone: 'from-[#a855f7] to-[#ec4899]',
  },
] as const

const orbitAvatars = [
  {
    className: 'top-[7%] left-[47%] h-16 w-16 bg-[linear-gradient(135deg,#c084fc,#6d5efc)]',
    initials: 'NA',
  },
  {
    className: 'top-[27%] right-[15%] h-14 w-14 bg-[linear-gradient(135deg,#60a5fa,#2457f5)]',
    initials: 'LM',
  },
  {
    className: 'right-[18%] bottom-[24%] h-14 w-14 bg-[linear-gradient(135deg,#fb923c,#ef4444)]',
    initials: 'QT',
  },
  {
    className:
      'bottom-[31%] left-[31%] h-[52px] w-[52px] bg-[linear-gradient(135deg,#22c55e,#16a34a)]',
    initials: 'HN',
  },
] as const

function formatPlatformStat(value: number, decimals: number, suffix: string) {
  const displayValue =
    decimals > 0
      ? value.toFixed(decimals)
      : Math.round(value)
          .toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  return `${displayValue}${suffix}`
}

export default function PlatformWelcomePage() {
  const user = useAppStore((state) => state.user)
  const scrollRootRef = useRef<HTMLDivElement | null>(null)
  const finalSectionRef = useRef<HTMLElement | null>(null)
  const statsAnimationStartedRef = useRef(false)
  const sectionScrollLockedRef = useRef(false)
  const [statsProgress, setStatsProgress] = useState(0)

  const primaryCta = user ? '/platform/setup' : '/auth/register'
  const secondaryCta = user ? '/app-store' : '/auth/login'
  const loginPath = user ? '/home' : '/auth/login'

  useEffect(() => {
    const root = scrollRootRef.current
    if (!root) return

    const revealElements = Array.from(root.querySelectorAll<HTMLElement>('.welcome-reveal'))

    if (typeof IntersectionObserver === 'undefined') {
      revealElements.forEach((element) => element.classList.add('is-visible'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return

          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        })
      },
      {
        root,
        threshold: 0.16,
        rootMargin: '0px 0px -8% 0px',
      },
    )

    revealElements.forEach((element) => observer.observe(element))

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const root = scrollRootRef.current
    const finalSection = finalSectionRef.current
    if (!root || !finalSection) return

    if (typeof IntersectionObserver === 'undefined') {
      setStatsProgress(1)
      return
    }

    let frameId = 0

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || statsAnimationStartedRef.current) return

        statsAnimationStartedRef.current = true
        const startedAt = performance.now()
        const duration = 1800

        const animate = (currentTime: number) => {
          const rawProgress = Math.min((currentTime - startedAt) / duration, 1)
          const easedProgress = 1 - Math.pow(1 - rawProgress, 3)

          setStatsProgress(easedProgress)

          if (rawProgress < 1) {
            frameId = requestAnimationFrame(animate)
          }
        }

        frameId = requestAnimationFrame(animate)
        observer.disconnect()
      },
      {
        root,
        threshold: 0.42,
      },
    )

    observer.observe(finalSection)

    return () => {
      observer.disconnect()
      if (frameId) cancelAnimationFrame(frameId)
    }
  }, [])

  useEffect(() => {
    const root = scrollRootRef.current
    if (!root || typeof window === 'undefined') return

    const desktopQuery = window.matchMedia('(min-width: 1024px)')
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frameId = 0
    let unlockTimer = 0

    const easeInOutCubic = (value: number) =>
      value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2

    const getSections = () =>
      Array.from(root.querySelectorAll<HTMLElement>('[data-welcome-section]'))

    const getCurrentSectionIndex = (sections: HTMLElement[]) => {
      const scrollTop = root.scrollTop

      return sections.reduce((closestIndex, section, index) => {
        const closestDistance = Math.abs(scrollTop - sections[closestIndex].offsetTop)
        const currentDistance = Math.abs(scrollTop - section.offsetTop)

        return currentDistance < closestDistance ? index : closestIndex
      }, 0)
    }

    const unlockSectionScroll = () => {
      window.clearTimeout(unlockTimer)
      unlockTimer = window.setTimeout(() => {
        sectionScrollLockedRef.current = false
      }, 220)
    }

    const animateToSection = (targetTop: number) => {
      window.cancelAnimationFrame(frameId)

      const startTop = root.scrollTop
      const distance = targetTop - startTop
      const startedAt = performance.now()
      const duration = 1500

      const animate = (currentTime: number) => {
        const progress = Math.min((currentTime - startedAt) / duration, 1)
        root.scrollTop = startTop + distance * easeInOutCubic(progress)

        if (progress < 1) {
          frameId = window.requestAnimationFrame(animate)
          return
        }

        root.scrollTop = targetTop
        unlockSectionScroll()
      }

      frameId = window.requestAnimationFrame(animate)
    }

    const handleWheel = (event: WheelEvent) => {
      if (!desktopQuery.matches || reducedMotionQuery.matches) return
      if (Math.abs(event.deltaY) < 4 || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return

      const sections = getSections()
      if (sections.length < 2) return

      event.preventDefault()

      if (sectionScrollLockedRef.current) return

      const currentIndex = getCurrentSectionIndex(sections)
      const direction = event.deltaY > 0 ? 1 : -1
      const targetIndex = Math.min(Math.max(currentIndex + direction, 0), sections.length - 1)

      if (targetIndex === currentIndex) return

      sectionScrollLockedRef.current = true
      animateToSection(sections[targetIndex].offsetTop)
    }

    root.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      root.removeEventListener('wheel', handleWheel)
      window.cancelAnimationFrame(frameId)
      window.clearTimeout(unlockTimer)
      sectionScrollLockedRef.current = false
    }
  }, [])

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-white text-slate-950">
      <style>{`
        @keyframes welcomePreviewFloat {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
          50% { transform: translate3d(0, -8px, 0) rotate(0.8deg); }
        }

        @keyframes welcomeBadgeFloat {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -20px, 0); }
        }

        @keyframes welcomeAvatarPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(124, 92, 255, 0.32), 0 18px 42px rgba(37,87,245,0.28); }
          50% { box-shadow: 0 0 0 10px rgba(124, 92, 255, 0), 0 24px 54px rgba(37,87,245,0.38); }
        }

        @keyframes welcomeGlowPulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.06); }
        }

        @keyframes welcomeRevealUp {
          from { opacity: 0; transform: translate3d(0, 34px, 0); }
          to { opacity: 1; transform: translate3d(0, 0, 0); }
        }

        @keyframes welcomeStarTwinkle {
          0%, 100% { opacity: 0.28; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.18); }
        }

        @keyframes welcomeFloatSoft {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -12px, 0); }
        }

        .welcome-reveal {
          opacity: 0;
          transform: translate3d(0, 34px, 0);
          will-change: opacity, transform;
        }

        .welcome-reveal.is-visible {
          animation: welcomeRevealUp 0.85s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }

        .welcome-float-soft {
          animation: welcomeFloatSoft 5.4s ease-in-out infinite;
        }

        .welcome-avatar-bubble {
          animation:
            welcomeFloatSoft 5.4s ease-in-out infinite,
            welcomeAvatarPulse 3.8s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .welcome-reveal {
            opacity: 1;
            transform: none;
          }

          .welcome-reveal.is-visible,
          .welcome-float-soft,
          .welcome-avatar-bubble {
            animation: none;
          }
        }
      `}</style>

      <div
        ref={scrollRootRef}
        className="h-screen w-full overflow-x-hidden overflow-y-auto scroll-smooth bg-[radial-gradient(circle_at_top_left,#f0f6ff_0%,transparent_34%),linear-gradient(135deg,#ffffff_0%,#f8fbff_45%,#f3efff_100%)] lg:snap-y lg:snap-proximity"
      >
        <header className="absolute inset-x-0 top-0 z-50 flex w-full items-center justify-between gap-4 px-5 py-6 sm:px-7 lg:px-10 lg:py-5">
          <Link to="/" className="flex shrink-0 items-center gap-3">
            <LogoMark className="h-8 w-8 text-[#2457f5]" title="SportHub" />
            <span className="text-[20px] font-semibold tracking-tight text-slate-950">
              SportHub
            </span>
          </Link>

          <nav className="hidden items-center gap-9 lg:flex">
            {[
              { label: 'Trang chủ', href: '#home' },
              { label: 'Tính năng', href: '#features' },
              { label: 'Ứng dụng', href: '#applications' },
              { label: 'Bảng giá', href: '#pricing' },
              { label: 'Hỗ trợ', href: '#support' },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={cn(
                  'relative text-[15px] font-medium text-slate-700 transition hover:text-[#2457f5]',
                )}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-[#d9e2f2] bg-white text-slate-700 shadow-sm lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <span className="hidden max-w-[180px] truncate text-[14px] font-semibold text-slate-900 md:inline-flex">
                  Welcome <b className="ml-1">{user.name}</b>
                </span>
                <Link
                  to="/home"
                  className="group relative inline-flex h-10 items-center justify-center gap-2 overflow-hidden rounded-[12px] bg-[#2457f5] px-5 text-[14px] font-semibold text-white shadow-[0_14px_28px_rgba(36,87,245,0.24)] sm:px-6"
                >
                  <span className="absolute inset-0 translate-x-[-105%] bg-[linear-gradient(90deg,#1f49cf_0%,#2457f5_55%,#4d7dff_100%)] transition-transform duration-500 ease-out group-hover:translate-x-0" />
                  <span className="relative z-10">Platform</span>
                  <ArrowRight className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>
              </div>
            ) : (
              <>
                <Link
                  to={loginPath}
                  className="hidden h-10 items-center justify-center rounded-[12px] border border-[#d9e2f2] bg-white px-6 text-[14px] font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 sm:inline-flex"
                >
                  Đăng nhập
                </Link>
                <Link
                  to={primaryCta}
                  className="hidden h-10 items-center justify-center rounded-[12px] bg-[#2457f5] px-5 text-[14px] font-semibold text-white shadow-[0_14px_28px_rgba(36,87,245,0.24)] transition hover:bg-[#1f49cf] sm:inline-flex sm:px-6"
                >
                  Dùng thử miễn phí
                </Link>
              </>
            )}
          </div>
        </header>

        <main className="w-full">
          <section
            data-welcome-section
            className="relative w-full overflow-hidden px-5 pt-28 pb-10 sm:px-7 lg:min-h-screen lg:snap-start lg:px-10 lg:pt-32 lg:pb-16"
          >
            <div className="pointer-events-none absolute top-20 left-1/2 h-[460px] w-[460px] -translate-x-1/2 rounded-full bg-[#dbeafe]/60 blur-3xl" />
            <div className="grid w-full gap-12 lg:min-h-[620px] lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:items-center xl:min-h-[680px]">
              <div className="welcome-reveal relative z-10 max-w-[760px]">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-[14px] font-medium text-[#3556b4] shadow-[0_10px_30px_rgba(37,87,245,0.08)] ring-1 ring-[#dbe5ff]">
                  <Star className="h-4 w-4 fill-[#fbbf24] text-[#fbbf24]" />
                  Nền tảng quản lý toàn diện cho mọi loại hình kinh doanh
                </div>

                <h1 className="mt-6 text-[42px] leading-[1.06] font-semibold tracking-[-0.04em] text-[#10194b] sm:text-[58px] lg:text-[68px] xl:text-[76px]">
                  Quản lý dễ dàng,
                  <span className="mt-2 block bg-[linear-gradient(135deg,#2457f5_0%,#7b7ffb_85%)] bg-clip-text text-transparent">
                    phát triển vượt trội
                  </span>
                </h1>

                <p className="mt-6 max-w-[620px] text-[16px] leading-8 text-[#52607d] sm:text-[17px]">
                  SportHub là nền tảng tích hợp nhiều ứng dụng mạnh mẽ, giúp bạn quản lý công việc,
                  đội nhóm và doanh nghiệp hiệu quả trên một hệ thống duy nhất.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to={primaryCta}
                    className="group relative inline-flex h-[54px] items-center justify-center gap-3 overflow-hidden rounded-[14px] bg-[#2457f5] px-7 text-[16px] font-semibold text-white shadow-[0_18px_34px_rgba(36,87,245,0.25)]"
                  >
                    <span className="absolute inset-0 translate-x-[-105%] bg-[linear-gradient(90deg,#1f49cf_0%,#2457f5_55%,#4d7dff_100%)] transition-transform duration-500 ease-out group-hover:translate-x-0" />
                    <span className="relative z-10">Dùng thử miễn phí</span>
                    <ArrowRight className="relative z-10 h-6 w-6 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                  <Link
                    to={secondaryCta}
                    className="group relative inline-flex h-[54px] items-center justify-center gap-3 overflow-hidden rounded-[14px] border border-[#d9e2f2] bg-white/90 px-7 text-[16px] font-semibold text-[#243253] shadow-sm backdrop-blur"
                  >
                    <span className="absolute inset-0 translate-x-[-105%] bg-[linear-gradient(90deg,#edf3ff_0%,#dfe9ff_55%,#f6f9ff_100%)] transition-transform duration-500 ease-out group-hover:translate-x-0" />
                    <span className="relative z-10">Khám phá ứng dụng</span>
                    <Grid2x2 className="relative z-10 h-5 w-5 text-[#54627e] transition-transform duration-300 group-hover:rotate-6" />
                  </Link>
                </div>

                <div className="mt-9 grid sm:grid-cols-3">
                  {featureHighlights.map((item, index) => (
                    <div
                      key={item.title}
                      className="welcome-reveal group flex items-start gap-2 rounded-[18px] bg-white/45 p-3 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:bg-white/80 hover:shadow-[0_18px_40px_rgba(37,58,121,0.08)]"
                      style={{ animationDelay: `${260 + index * 120}ms` }}
                    >
                      <span
                        className={cn(
                          'grid h-11 w-11 shrink-0 place-items-center rounded-full transition-transform duration-300 group-hover:scale-110',
                          item.tone,
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                      </span>
                      <div>
                        <div className="text-[13px] font-semibold text-[#1f2e50]">{item.title}</div>
                        <div className="mt-1 text-[12px] text-[#687691]">{item.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <WelcomePreviewImage />
            </div>
          </section>

          <section
            data-welcome-section
            id="features"
            className="relative flex w-full items-center overflow-hidden px-5 py-24 sm:px-7 lg:min-h-screen lg:snap-start lg:px-10"
          >
            <div className="pointer-events-none absolute inset-x-[-10%] top-0 h-[1px] bg-gradient-to-r from-transparent via-[#c7d7ff] to-transparent" />
            <div className="pointer-events-none absolute top-16 left-[-160px] h-[380px] w-[380px] rounded-full border border-[#d8e3ff]" />
            <div className="pointer-events-none absolute right-[-220px] bottom-0 h-[520px] w-[520px] rounded-full bg-[#eef4ff] blur-3xl" />

            <div className="w-full">
              <div className="welcome-reveal mx-auto max-w-[680px] text-center">
                <p className="text-7xl font-semibold text-[#10194b]">Tất cả những gì bạn cần</p>
                <p className="mt-4 text-[16px] leading-8 text-[#64728f]">
                  Tích hợp đầy đủ các công cụ quản lý theo dạng ứng dụng. Bạn có thể cài thêm, gỡ bỏ
                  hoặc mở rộng module theo từng giai đoạn phát triển.
                </p>
              </div>

              <div className="mt-16 grid w-full gap-6 md:grid-cols-2 xl:grid-cols-5">
                {platformBenefits.map((item, index) => (
                  <article
                    key={item.title}
                    className="welcome-reveal group relative overflow-hidden rounded-[30px] border border-[#e4ebf7] bg-white/80 p-7 text-center shadow-[0_22px_60px_rgba(37,58,121,0.08)] backdrop-blur transition duration-500 hover:-translate-y-2 hover:shadow-[0_30px_90px_rgba(37,58,121,0.14)]"
                    style={{ animationDelay: `${index * 90}ms` }}
                  >
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#2457f5]/30 to-transparent opacity-0 transition group-hover:opacity-100" />
                    <span
                      className={cn(
                        'mx-auto grid h-20 w-20 place-items-center rounded-[28px] transition duration-500 group-hover:scale-110 group-hover:rotate-3',
                        item.tone,
                      )}
                    >
                      <item.icon className="h-8 w-8" />
                    </span>
                    <h3 className="mt-7 text-[18px] font-semibold text-[#1c2c4d]">{item.title}</h3>
                    <p className="mt-3 text-[14px] leading-7 text-[#687691]">{item.description}</p>
                    <div className="mt-7 inline-flex items-center gap-2 text-[13px] font-semibold text-[#2457f5] opacity-0 transition duration-300 group-hover:opacity-100">
                      Tìm hiểu thêm
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section
            ref={finalSectionRef}
            data-welcome-section
            id="applications"
            className="relative flex min-h-screen w-full overflow-hidden bg-[#031135] px-5 py-10 text-white sm:px-8 lg:snap-start lg:px-10 lg:py-0"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_58%_36%,rgba(91,122,255,0.34),transparent_24%),radial-gradient(circle_at_80%_7%,rgba(124,92,255,0.18),transparent_22%),linear-gradient(180deg,#07153f_0%,#041235_48%,#031032_100%)]" />
            <div className="pointer-events-none absolute inset-0 opacity-60">
              <span className="absolute top-[10%] left-[24%] h-1 w-1 animate-[welcomeStarTwinkle_3.2s_ease-in-out_infinite] rounded-full bg-white" />
              <span className="absolute top-[24%] left-[31%] h-2 w-2 animate-[welcomeStarTwinkle_4s_ease-in-out_infinite] rounded-full bg-[#8b5cf6]" />
              <span className="absolute top-[8%] right-[19%] h-1 w-1 animate-[welcomeStarTwinkle_5s_ease-in-out_infinite] rounded-full bg-white" />
              <span className="absolute right-[11%] bottom-[42%] h-1.5 w-1.5 animate-[welcomeStarTwinkle_3.6s_ease-in-out_infinite] rounded-full bg-[#a78bfa]" />
              <span className="absolute bottom-[30%] left-[8%] h-1 w-1 animate-[welcomeStarTwinkle_4.4s_ease-in-out_infinite] rounded-full bg-white" />
            </div>

            <div className="relative z-10 flex min-h-screen w-full flex-col justify-between gap-8 py-12 lg:py-16">
              <div className="grid flex-1 items-center gap-10 lg:grid-cols-[minmax(280px,0.34fr)_minmax(0,0.66fr)]">
                <div className="welcome-reveal max-w-[440px]">
                  <div className="text-[13px] font-semibold tracking-[0.14em] text-[#8b5cf6] uppercase">
                    Được tin dùng bởi hàng nghìn doanh nghiệp
                  </div>
                  <h2 className="mt-6 text-[36px] leading-[1.08] font-semibold tracking-[-0.04em] text-white sm:text-[48px] lg:text-[56px]">
                    Con số biết nói
                  </h2>
                  <p className="mt-5 max-w-[360px] text-[15px] leading-8 text-[#b8c4e6]">
                    SportHub không ngừng phát triển để mang đến trải nghiệm tốt nhất cho khách hàng.
                  </p>
                  <Link
                    to={primaryCta}
                    className="group relative mt-8 inline-flex h-[52px] items-center justify-center gap-3 overflow-hidden rounded-[8px] bg-[linear-gradient(135deg,#7c3aed,#2457f5)] px-7 text-[15px] font-semibold text-white shadow-[0_18px_46px_rgba(91,122,255,0.4)] transition hover:-translate-y-0.5"
                  >
                    <span className="absolute inset-0 translate-x-[-110%] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.26),transparent)] transition-transform duration-500 group-hover:translate-x-[110%]" />
                    <span className="relative z-10">Bắt đầu ngay hôm nay</span>
                    <ArrowRight className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>

                <div
                  className="welcome-reveal relative min-h-[330px] lg:min-h-[470px]"
                  style={{ animationDelay: '160ms' }}
                >
                  <div className="absolute top-1/2 left-1/2 h-[128px] w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-[rgba(124,92,255,0.18)] sm:w-[640px] lg:h-[150px] lg:w-[820px]" />
                  <div className="absolute top-1/2 left-1/2 h-[188px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-[rgba(124,92,255,0.16)] sm:w-[760px] lg:h-[210px] lg:w-[990px]" />
                  <div className="absolute top-1/2 left-1/2 h-[248px] w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-[rgba(124,92,255,0.12)] sm:w-[880px] lg:h-[282px] lg:w-[1160px]" />
                  <div className="absolute top-1/2 left-1/2 h-[318px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-[rgba(124,92,255,0.08)] sm:w-[1040px] lg:h-[362px] lg:w-[1320px]" />

                  <FloatingPlanet
                    className="top-[15%] left-[23%] h-8 w-8 sm:h-10 sm:w-10"
                    icon={Users2}
                    tone="from-[#60a5fa] to-[#2457f5]"
                  />
                  <FloatingPlanet
                    className="top-[28%] right-[8%] h-8 w-8 sm:h-10 sm:w-10"
                    icon={Star}
                    tone="from-[#8b5cf6] to-[#6d5efc]"
                  />

                  {orbitAvatars.map((avatar, index) => (
                    <AvatarBubble
                      key={avatar.initials}
                      className={avatar.className}
                      initials={avatar.initials}
                      delay={`${index * 220}ms`}
                    />
                  ))}

                  <div className="absolute top-1/2 left-1/2 grid h-[152px] w-[152px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[radial-gradient(circle_at_34%_24%,#ffffff_0%,#a5b4fc_18%,#635bff_52%,#2537cc_100%)] shadow-[0_0_48px_rgba(165,180,252,0.85),0_0_120px_rgba(37,87,245,0.74)] sm:h-[184px] sm:w-[184px] lg:h-[216px] lg:w-[216px]">
                    <div className="absolute inset-[-18px] animate-[welcomeGlowPulse_4.6s_ease-in-out_infinite] rounded-full border border-blue-200/25" />
                    <div className="absolute inset-[-34px] rounded-full bg-[#2457f5]/20 blur-2xl" />
                    <LogoMark
                      className="relative z-10 h-[72px] w-[72px] text-white sm:h-[88px] sm:w-[88px]"
                      title="SportHub"
                    />
                  </div>
                </div>
              </div>

              <div
                className="welcome-reveal grid gap-6 border-t border-white/0 pt-2 sm:grid-cols-2 lg:grid-cols-5"
                style={{ animationDelay: '260ms' }}
              >
                {platformStats.map((item, index) => (
                  <article
                    key={item.label}
                    className="group flex items-center gap-4 lg:border-l lg:border-white/10 lg:pl-8 lg:first:border-l-0 lg:first:pl-0"
                    style={{ animationDelay: `${360 + index * 80}ms` }}
                  >
                    <span
                      className={cn(
                        'grid h-16 w-16 shrink-0 place-items-center rounded-full bg-gradient-to-br text-white shadow-[0_18px_44px_rgba(37,87,245,0.26)] transition duration-300 group-hover:scale-110',
                        item.tone,
                      )}
                    >
                      <item.icon className="h-8 w-8" />
                    </span>
                    <div>
                      <div className="text-[28px] leading-none font-semibold tracking-[-0.02em] text-white lg:text-[32px]">
                        {formatPlatformStat(item.value * statsProgress, item.decimals, item.suffix)}
                      </div>
                      <div className="mt-3 text-[13px] text-[#aebde3]">{item.description}</div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

function WelcomePreviewImage() {
  return (
    <div className="welcome-reveal relative z-10 lg:pl-0">
      <div className="relative mx-auto w-full lg:translate-x-4">
        <div className="absolute top-[-22px] left-[2%] z-10 hidden h-16 w-16 -rotate-18 animate-[welcomeBadgeFloat_6s_ease-in-out_infinite] items-center justify-center rounded-[20px] bg-[linear-gradient(135deg,#7c5cff,#6d5efc)] text-white shadow-[0_24px_44px_rgba(109,94,252,0.28)] lg:flex">
          <BarChart3 className="h-7 w-7" />
        </div>
        <div className="absolute top-[118px] right-[-10px] z-10 hidden h-16 w-16 rotate-16 animate-[welcomeBadgeFloat_6s_ease-in-out_infinite] items-center justify-center rounded-[20px] bg-[linear-gradient(135deg,#60a5fa,#2563eb)] text-white shadow-[0_24px_44px_rgba(37,99,235,0.25)] lg:flex">
          <Lock className="h-7 w-7" />
        </div>
        <div className="absolute bottom-[-16px] left-[18%] z-10 hidden h-16 w-16 rotate-18 animate-[welcomeBadgeFloat_6s_ease-in-out_infinite] items-center justify-center rounded-[20px] bg-[linear-gradient(135deg,#34d399,#22c55e)] text-white shadow-[0_24px_44px_rgba(34,197,94,0.25)] lg:flex">
          <Users2 className="h-7 w-7" />
        </div>

        <div className="animate-[welcomePreviewFloat_6s_ease-in-out_infinite] overflow-hidden rounded-[28px] border border-[#e6ecf7] bg-white shadow-[0_34px_100px_rgba(37,58,121,0.18)] transition-transform duration-500 hover:-translate-y-1 hover:scale-[1.01]">
          <img
            src="/images/platform-welcome-home.png"
            alt="SportHub home preview"
            className="block h-auto w-full"
          />
        </div>
      </div>
    </div>
  )
}

type FloatingPlanetProps = {
  className?: string
  icon: LucideIcon
  tone: string
}

function FloatingPlanet({ className, icon: Icon, tone }: FloatingPlanetProps) {
  return (
    <div
      className={cn(
        'absolute z-10 grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br text-white shadow-[0_18px_44px_rgba(37,87,245,0.28)] sm:h-14 sm:w-14',
        'welcome-float-soft',
        tone,
        className,
      )}
    >
      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
    </div>
  )
}

type AvatarBubbleProps = {
  className?: string
  delay: string
  initials: string
}

function AvatarBubble({ className, delay, initials }: AvatarBubbleProps) {
  return (
    <div
      className={cn(
        'welcome-avatar-bubble absolute z-10 grid place-items-center rounded-full p-[3px] shadow-[0_18px_42px_rgba(37,87,245,0.28)]',
        className,
      )}
      style={{ animationDelay: `${delay}, ${delay}` }}
    >
      <div className="relative grid h-full w-full place-items-center overflow-hidden rounded-full bg-[#101b4b] text-[11px] font-semibold text-white ring-2 ring-white/20">
        <span className="absolute top-[18%] h-[32%] w-[32%] rounded-full bg-white/90" />
        <span className="absolute bottom-[13%] h-[34%] w-[58%] rounded-t-full bg-white/80" />
        <span className="relative z-10 translate-y-[54%] text-[9px] tracking-[0.12em] text-[#09163d]">
          {initials}
        </span>
      </div>
    </div>
  )
}
