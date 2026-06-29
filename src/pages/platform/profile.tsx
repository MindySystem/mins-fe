import { type ComponentType, type ReactNode,useMemo, useState } from 'react'
import { Link,Navigate } from 'react-router-dom'
import { Edit2, Lock, Mail, Phone, Shield, Trophy,User as UserIcon } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getPlatformApp } from '@/core/platform/registry'
import { authService } from '@/features/auth/services/auth.service'
import { PlatformLayout } from '@/layouts/PlatformLayout'
import { cn } from '@/lib/utils'
import type { SkillLevel } from '@/store/useAppStore'
import { useAppStore } from '@/store/useAppStore'
import { GENDER_LABELS, SKILL_LEVEL_OPTIONS, skillLevelLabel } from '@/utils/userMeta'

export default function PlatformProfilePage() {
  const user = useAppStore((state) => state.user)
  const setUser = useAppStore((state) => state.setUser)
  const currentWorkspaceId = useAppStore((state) => state.currentWorkspaceId)
  const workspaces = useAppStore((state) => state.workspaces)
  const workspace = workspaces.find((item) => item.id === currentWorkspaceId)
  const workspaceAppMap = useAppStore((state) => state.workspaceAppMap)
  const workspaceUserAccessMap = useAppStore((state) => state.workspaceUserAccessMap)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(user?.gender || 'male')
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(user?.skillLevel || 'beginner')
  const [password, setPassword] = useState('')

  const installedAppCodes = workspaceAppMap[currentWorkspaceId] ?? []
  const isCustomer = user?.accountType === 'customer' && !user?.isSeedAdmin
  const roleLabel = user?.isSeedAdmin
    ? 'Super Admin'
    : user?.accountType === 'customer'
      ? 'Khách hàng'
      : user?.role === 'admin'
        ? 'Quản trị workspace'
        : user?.role === 'shop_manager'
          ? 'Quản lý cửa hàng'
          : user?.role === 'staff'
            ? 'Nhân viên'
            : 'Business'
  const accessAppCodes = useMemo(() => {
    if (!user) return []
    return workspaceUserAccessMap[currentWorkspaceId]?.[user.id] ?? installedAppCodes
  }, [currentWorkspaceId, installedAppCodes, user, workspaceUserAccessMap])

  if (!user) return <Navigate to="/auth/login" replace />

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Họ và tên không được để trống')
      return
    }

    setLoading(true)
    try {
      const response = await authService.updateProfile({
        name,
        phone: phone || undefined,
        gender,
        skillLevel,
        password: password || undefined,
      })
      setUser(response.user)
      toast.success(response.message || 'Cập nhật hồ sơ thành công!')
      setIsEditing(false)
      setPassword('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Có lỗi xảy ra!')
    } finally {
      setLoading(false)
    }
  }

  const initials = (user.name || user.email).trim().charAt(0).toUpperCase() || '?'

  return (
    <PlatformLayout
      activeTab="profile"
      mobileShell="phone-page"
      mobileTitle="Hồ sơ"
      mobileSubtitle="Tài khoản"
    >
      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold tracking-[0.28em] text-slate-400 uppercase">
                Tài khoản
              </div>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">Hồ sơ của tôi</h1>
            </div>

            <Button
              variant={isEditing ? 'ghost' : 'outline'}
              size="sm"
              className="gap-2 rounded-full border-slate-200 text-slate-700"
              onClick={() => {
                if (isEditing) {
                  setName(user.name)
                  setPhone(user.phone || '')
                  setGender(user.gender || 'male')
                  setSkillLevel(user.skillLevel || 'beginner')
                  setPassword('')
                }
                setIsEditing(!isEditing)
              }}
            >
              <Edit2 className="h-4 w-4" />
              {isEditing ? 'Hủy' : 'Chỉnh sửa'}
            </Button>
          </div>

          <div className="mt-6 rounded-[26px] bg-[linear-gradient(135deg,#2457f5_0%,#5e7df7_45%,#8b5cf6_100%)] p-5 text-white shadow-[0_20px_60px_rgba(37,99,235,0.22)]">
            <div className="flex flex-wrap items-center gap-4">
              <div className="grid h-20 w-20 place-items-center rounded-[28px] bg-white/20 text-3xl font-bold backdrop-blur">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs tracking-[0.28em] text-white/70 uppercase">Xin chào</div>
                <h2 className="mt-1 text-2xl font-semibold">{user.name}</h2>
                <p className="mt-1 text-sm text-white/80">{user.email}</p>
              </div>
              <div className="grid gap-2 text-sm">
                <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1.5 font-medium">
                  {roleLabel}
                </span>
                {!isCustomer ? (
                  <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1.5 font-medium">
                    {workspace?.name ?? 'Workspace'}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {isEditing ? (
            <form onSubmit={handleUpdate} className="mt-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Họ và tên">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                  />
                </Field>

                <Field label="Số điện thoại">
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0901234567"
                  />
                </Field>
              </div>

              <Field label="Giới tính">
                <div className="grid grid-cols-3 gap-2">
                  {(['male', 'female', 'other'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={cn(
                        'flex h-11 items-center justify-center rounded-2xl border text-sm font-medium transition',
                        gender === g
                          ? 'border-[#2457f5] bg-[#ebf2ff] text-[#2457f5]'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                      )}
                    >
                      {GENDER_LABELS[g]}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Trình độ tự đánh giá">
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  {SKILL_LEVEL_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSkillLevel(option.value)}
                      className={cn(
                        'flex h-11 items-center justify-center rounded-2xl border px-2 text-center text-sm font-medium transition',
                        skillLevel === option.value
                          ? 'border-[#2457f5] bg-[#ebf2ff] text-[#2457f5]'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Mật khẩu mới">
                <div className="relative">
                  <Lock className="pointer-events-none absolute top-3 left-3 h-4 w-4 text-slate-400" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10"
                  />
                </div>
              </Field>

              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full rounded-2xl bg-[#2457f5] text-white"
              >
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </form>
          ) : (
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <InfoCard icon={Mail} label="Email" value={user.email} />
              <InfoCard icon={Phone} label="Số điện thoại" value={user.phone || '—'} />
              <InfoCard
                icon={UserIcon}
                label="Giới tính"
                value={GENDER_LABELS[user.gender || 'male']}
              />
              <InfoCard icon={Trophy} label="Trình độ" value={skillLevelLabel(user.skillLevel)} />
              <InfoCard icon={Shield} label="Vai trò" value={roleLabel} />
              <InfoCard
                icon={UserIcon}
                label="Tham gia từ"
                value={user.createdAt?.slice(0, 10) || '—'}
              />
            </div>
          )}
        </div>

        <div className="grid gap-4">
          {isCustomer ? (
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
              <div className="text-xs font-semibold tracking-[0.28em] text-slate-400 uppercase">
                Dịch vụ
              </div>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">Dịch vụ khả dụng</h2>
              <Link
                to="/services"
                className="mt-4 inline-flex h-11 items-center rounded-2xl bg-[#2457f5] px-5 text-sm font-semibold text-white hover:bg-[#1f49cf]"
              >
                Xem dịch vụ
              </Link>
            </div>
          ) : (
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
              <div className="text-xs font-semibold tracking-[0.28em] text-slate-400 uppercase">
                Ứng dụng
              </div>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">Ứng dụng được cấp quyền</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {accessAppCodes.map((code) => {
                  const app = getPlatformApp(code)
                  if (!app) return null
                  return (
                    <span
                      key={code}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700"
                    >
                      <app.icon className="h-4 w-4 text-[#2457f5]" />
                      {app.name}
                    </span>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </section>
    </PlatformLayout>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-semibold tracking-[0.22em] text-slate-400 uppercase">
        {label}
      </span>
      {children}
    </label>
  )
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-[#2457f5] shadow-sm">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-semibold tracking-[0.22em] text-slate-400 uppercase">
            {label}
          </div>
          <div className="truncate text-sm font-medium text-slate-900">{value}</div>
        </div>
      </div>
    </div>
  )
}
