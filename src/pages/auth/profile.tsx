import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, Shield, User as UserIcon, Edit2, Lock } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'
import { authService } from '@/features/auth/services/auth.service'

export default function ProfilePage() {
  const user = useAppStore((s) => s.user)
  const setUser = useAppStore((s) => s.setUser)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  // Form states
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(user?.gender || 'male')
  const [password, setPassword] = useState('')

  if (!user) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <div className="text-4xl">🔒</div>
        <p className="mt-2 text-sm text-slate-500">Bạn cần đăng nhập để xem hồ sơ.</p>
        <Link to="/auth/login" className="mt-4 inline-block">
          <Button>Đăng nhập</Button>
        </Link>
      </div>
    )
  }

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

  const genderLabels = {
    male: 'Nam',
    female: 'Nữ',
    other: 'Khác',
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <Link
          to="/sessions"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Link>
        <Button
          variant={isEditing ? 'ghost' : 'outline'}
          size="sm"
          className="gap-2"
          onClick={() => {
            if (isEditing) {
              // Reset values
              setName(user.name)
              setPhone(user.phone || '')
              setGender(user.gender || 'male')
              setPassword('')
            }
            setIsEditing(!isEditing)
          }}
        >
          <Edit2 className="h-4 w-4" />
          {isEditing ? 'Hủy bỏ' : 'Chỉnh sửa'}
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-slate-900 to-slate-700 px-6 py-8 text-white">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/15 text-2xl font-bold backdrop-blur">
              {initials}
            </div>
            <div>
              <h1 className="text-xl font-bold sm:text-2xl">{user.name}</h1>
              <p className="mt-1 text-sm text-white/70">{user.email}</p>
            </div>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleUpdate} className="p-6 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Họ và tên</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="border-slate-200 focus-visible:ring-slate-950"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Số điện thoại</label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0901234567"
                  className="border-slate-200 focus-visible:ring-slate-950"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Giới tính</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['male', 'female', 'other'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={cn(
                        'flex h-10 items-center justify-center rounded-md border text-sm font-medium transition-all',
                        gender === g
                          ? 'border-slate-900 bg-slate-900 text-white font-bold'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      )}
                    >
                      {genderLabels[g]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Mật khẩu mới <span className="text-[10px] lowercase text-slate-400">(để trống nếu không đổi)</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 border-slate-200 focus-visible:ring-slate-950"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 text-white py-6">
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="divide-y divide-slate-100">
            <Row icon={Mail} label="Email" value={user.email} />
            <Row icon={Phone} label="Số điện thoại" value={user.phone || '—'} />
            <Row icon={UserIcon} label="Giới tính" value={genderLabels[user.gender || 'male']} />
            <Row icon={Shield} label="Vai trò" value={user.role} badge />
            <Row icon={UserIcon} label="Tham gia từ" value={user.createdAt?.slice(0, 10) || '—'} />
          </div>
        )}
      </div>
    </div>
  )
}

function Row({
  icon: Icon,
  label,
  value,
  badge,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  badge?: boolean
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-4">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] tracking-wide text-slate-500 uppercase">{label}</div>
        {badge ? (
          <span
            className={cn(
              'mt-0.5 inline-flex rounded-full px-2 py-0.5 text-xs font-medium uppercase',
              value === 'admin'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700',
            )}
          >
            {value}
          </span>
        ) : (
          <div className="mt-0.5 truncate text-sm font-medium text-slate-900">{value}</div>
        )}
      </div>
    </div>
  )
}
