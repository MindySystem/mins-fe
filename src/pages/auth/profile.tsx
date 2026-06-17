import { Link } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, Shield, User as UserIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'

export default function ProfilePage() {
  const user = useAppStore((s) => s.user)

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

  const initials = (user.name || user.email).trim().charAt(0).toUpperCase() || '?'

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link
        to="/sessions"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại
      </Link>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
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

        <div className="divide-y divide-slate-100">
          <Row icon={Mail} label="Email" value={user.email} />
          <Row icon={Phone} label="Số điện thoại" value={user.phone || '—'} />
          <Row icon={Shield} label="Vai trò" value={user.role} badge />
          <Row icon={UserIcon} label="Tham gia từ" value={user.createdAt?.slice(0, 10) || '—'} />
        </div>
      </div>

      <p className="text-center text-xs text-slate-400">
        Tính năng chỉnh sửa hồ sơ sẽ được bổ sung ở phiên bản sau.
      </p>
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
