import { useState } from 'react'
import { useForm, type FieldErrors, type UseFormRegister } from 'react-hook-form'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, Users2 } from 'lucide-react'
import { toast } from 'sonner'

import { LogoMark } from '@/components/brand/LogoMark'
import { cn } from '@/lib/utils'
import { platformApi, platformSetupSchema, type PlatformSetupRequest } from '@/services/platform'
import { useAppStore, type User } from '@/store/useAppStore'

const setupSteps = [
  {
    title: 'Workspace',
    description: 'Tạo không gian quản trị doanh nghiệp.',
    icon: CheckCircle2,
  },
  {
    title: 'Công ty',
    description: 'Lưu thông tin đơn vị quản lý.',
    icon: Building2,
  },
  {
    title: 'Người dùng',
    description: 'Tạo người quản lý đầu tiên.',
    icon: Users2,
  },
]

const stepFields: Array<Array<keyof PlatformSetupRequest>> = [
  ['workspaceName', 'workspaceSlug'],
  ['companyName', 'companySlug', 'taxCode', 'contactEmail'],
  ['userRole'],
]

export default function PlatformSetupPage() {
  const navigate = useNavigate()
  const user = useAppStore((state) => state.user)
  const upsertWorkspace = useAppStore((state) => state.upsertWorkspace)
  const [step, setStep] = useState(0)
  const userSeed = user?.id ?? 'moi'
  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<PlatformSetupRequest>({
    resolver: zodResolver(platformSetupSchema),
    defaultValues: {
      workspaceName: user ? `Workspace của ${user.name}` : 'Workspace mới',
      workspaceSlug: `workspace-${userSeed}`,
      companyName: user ? `Công ty của ${user.name}` : 'Công ty mới',
      companySlug: `company-${userSeed}`,
      taxCode: '',
      contactEmail: user?.email ?? '',
      userRole: 'owner',
    },
    mode: 'onBlur',
  })

  if (!user) return <Navigate to="/auth/login" replace />
  if (user.accountType === 'customer') return <Navigate to="/services" replace />

  const active = setupSteps[step]
  const isLast = step === setupSteps.length - 1

  const onSubmit = async (data: PlatformSetupRequest) => {
    try {
      const response = await platformApi.setup(data)
      const workspaceId = response.workspace.slug || String(response.workspace.id)

      upsertWorkspace(
        {
          id: workspaceId,
          name: response.workspace.name,
          type: response.workspace.type,
          owner: user.name,
          status: response.workspace.status,
          memberCount: 1,
          note: response.company.name,
        },
        [],
        user.id,
      )

      toast.success(response.message || 'Đã tạo workspace.')
      navigate('/home')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Thiết lập doanh nghiệp thất bại')
    }
  }

  const handleNext = async () => {
    const valid = await trigger(stepFields[step], { shouldFocus: true })

    if (!valid) {
      toast.error('Vui lòng kiểm tra lại thông tin.')
      return
    }

    if (!isLast) {
      setStep((value) => value + 1)
      return
    }

    await handleSubmit(onSubmit)()
  }

  return (
    <div className="relative h-screen overflow-hidden bg-slate-950 text-white">
      <Link to="/" className="absolute top-5 left-5 z-30 inline-flex items-center gap-3">
        <LogoMark className="h-8 w-8 text-emerald-400" title="SportHub" />
        <span className="hidden text-[20px] font-black tracking-tight text-white sm:inline">
          Mindy <span className="text-emerald-400">OS</span>
        </span>
      </Link>

      <div className="absolute inset-y-0 left-0 hidden w-[42%] bg-emerald-950 lg:block">
        <img
          src="/images/auth-bg.png"
          alt="SportHub setup"
          className="h-full w-full object-cover opacity-35 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-emerald-950/65 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-950" />
        <div className="absolute bottom-10 left-10 max-w-[360px]">
          <div className="text-[14px] font-semibold tracking-[0.18em] text-emerald-300 uppercase">
            Business onboarding
          </div>
          <h1 className="mt-3 text-[28px] leading-tight font-black tracking-[-0.04em] text-white">
            Thiết lập workspace cho doanh nghiệp
          </h1>
          <p className="mt-3 text-[14px] leading-6 text-slate-300">
            Hoàn tất thông tin nền tảng, workspace, công ty và người quản lý đầu tiên trong một luồng ngắn gọn.
          </p>
        </div>
      </div>

      <div className="pointer-events-none absolute top-1/2 right-[12%] h-[460px] w-[460px] -translate-y-1/2 rounded-full bg-emerald-500/10 blur-[100px]" />

      <div className="relative z-10 flex h-full items-center justify-center px-4 py-4 lg:pl-[42%]">
        <section className="w-full max-w-[760px] rounded-[28px] border border-slate-800 bg-slate-900/45 p-5 shadow-2xl backdrop-blur-xl">
          <header className="flex items-start justify-between gap-4">
            <div>
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-[14px] font-semibold text-slate-400 transition hover:text-emerald-300"
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại trang chủ
              </Link>
              <h2 className="mt-3 text-[24px] leading-tight font-extrabold tracking-[-0.03em] text-white">
                Đăng ký doanh nghiệp
              </h2>
              <p className="mt-1 text-[14px] text-emerald-400">
                Xin chào {user.name}, hoàn tất thiết lập để vào Platform.
              </p>
            </div>
            <div className="rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-[14px] font-semibold text-slate-300">
              Bước {step + 1}/{setupSteps.length}
            </div>
          </header>

          <div className="mt-5 grid grid-cols-3 gap-2">
            {setupSteps.map((item, index) => (
              <button
                key={item.title}
                type="button"
                onClick={() => setStep(index)}
                className={cn(
                  'group rounded-[16px] border px-3 py-3 text-left transition',
                  index === step
                    ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_22px_rgba(16,185,129,0.14)]'
                    : 'border-slate-800 bg-slate-800/30 hover:border-slate-700 hover:bg-slate-800/60',
                )}
              >
                <item.icon
                  className={cn(
                    'h-4 w-4 transition',
                    index === step ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300',
                  )}
                />
                <div
                  className={cn(
                    'mt-2 truncate text-[14px] font-semibold',
                    index === step ? 'text-white' : 'text-slate-400',
                  )}
                >
                  {item.title}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[0.82fr_1.18fr]">
            <div className="rounded-[22px] border border-slate-800 bg-slate-950/35 p-4">
              <div className="inline-flex rounded-full bg-emerald-500/10 px-3 py-1.5 text-[14px] font-semibold text-emerald-400">
                {active.title}
              </div>
              <h3 className="mt-3 text-[22px] leading-tight font-extrabold tracking-[-0.03em] text-white">
                {active.description}
              </h3>
              <p className="mt-3 text-[14px] leading-6 text-slate-400">
                Chỉ cần thông tin cốt lõi. Sau khi hoàn tất, bạn có thể chỉnh chi tiết trong phần quản trị.
              </p>
              <div className="mt-5 grid gap-2 text-[14px] text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Đồng bộ workspace và công ty
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Gán quyền owner cho tài khoản hiện tại
                </div>
              </div>
            </div>

            <SetupStepContent
              errors={errors}
              register={register}
              step={step}
              user={user}
            />
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-slate-800 pt-4">
            <button
              type="button"
              onClick={() => setStep((value) => Math.max(0, value - 1))}
              className="h-10 rounded-xl border border-slate-700 bg-slate-900/60 px-4 text-[14px] font-semibold text-slate-300 transition hover:bg-slate-800 disabled:opacity-35"
              disabled={step === 0}
            >
              Trước
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-5 text-[14px] font-semibold text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] transition hover:bg-emerald-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.44)]"
            >
              {isSubmitting ? 'Đang tạo...' : isLast ? 'Hoàn tất' : 'Tiếp tục'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

function SetupStepContent({
  errors,
  register,
  step,
  user,
}: {
  errors: FieldErrors<PlatformSetupRequest>
  register: UseFormRegister<PlatformSetupRequest>
  step: number
  user: User
}) {
  if (step === 0) {
    return (
      <div className="grid gap-4">
        <SetupInput error={errors.workspaceName?.message} label="Tên workspace" placeholder="Sân Cầu ABC" registration={register('workspaceName')} />
        <SetupInput error={errors.workspaceSlug?.message} label="Slug" placeholder="san-cau-abc" registration={register('workspaceSlug')} />
      </div>
    )
  }

  if (step === 1) {
    return (
      <div className="grid gap-4">
        <SetupInput error={errors.companyName?.message} label="Tên công ty" placeholder="SportHub Team" registration={register('companyName')} />
        <SetupInput error={errors.companySlug?.message} label="Slug công ty" placeholder="sporthub-team" registration={register('companySlug')} />
        <SetupInput error={errors.contactEmail?.message} label="Email liên hệ" placeholder="contact@sporthub.vn" registration={register('contactEmail')} />
        <SetupInput error={errors.taxCode?.message} label="Mã số thuế" placeholder="Tuỳ chọn" registration={register('taxCode')} />
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      <div className="rounded-[16px] border border-slate-800 bg-slate-800/35 p-3">
        <div className="text-[14px] font-semibold text-slate-400">Tài khoản được gán quyền</div>
        <div className="mt-2 text-[14px] font-semibold text-white">{user.name}</div>
        <div className="mt-0.5 text-[14px] text-slate-500">{user.email}</div>
      </div>
      <SetupSelect
        error={errors.userRole?.message}
        label="Vai trò trong doanh nghiệp"
        options={[
          { label: 'Owner', value: 'owner' },
          { label: 'Workspace admin', value: 'workspace_admin' },
          { label: 'Company admin', value: 'company_admin' },
        ]}
        registration={register('userRole')}
      />
    </div>
  )
}

function SetupInput({
  error,
  label,
  placeholder,
  registration,
}: {
  error?: string
  label: string
  placeholder: string
  registration: ReturnType<UseFormRegister<PlatformSetupRequest>>
}) {
  return (
    <label className="block">
      <span className="text-[14px] font-semibold text-slate-300">{label}</span>
      <input
        placeholder={placeholder}
        {...registration}
        className="mt-1.5 h-10 w-full rounded-xl border border-slate-700 bg-slate-800/50 px-3 text-[14px] text-white outline-none placeholder:text-slate-500 focus:border-emerald-500"
      />
      {error ? <FieldError message={error} /> : null}
    </label>
  )
}

function SetupSelect({
  error,
  label,
  options,
  registration,
}: {
  error?: string
  label: string
  options: Array<{ label: string; value: string }>
  registration: ReturnType<UseFormRegister<PlatformSetupRequest>>
}) {
  return (
    <label className="block">
      <span className="text-[14px] font-semibold text-slate-300">{label}</span>
      <select
        {...registration}
        className="mt-1.5 h-10 w-full rounded-xl border border-slate-700 bg-slate-800/50 px-3 text-[14px] text-white outline-none focus:border-emerald-500"
      >
        {options.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      {error ? <FieldError message={error} /> : null}
    </label>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null

  return <p className="mt-1 text-[12px] font-medium text-red-400">{message}</p>
}
