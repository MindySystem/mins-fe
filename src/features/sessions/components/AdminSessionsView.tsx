import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/features/sessions/components/StatusBadge'
import { sessionService } from '@/features/sessions/services/session.service'
import { userService } from '@/features/sessions/services/user.service'
import type { BadmintonSession, SessionStatus } from '@/features/sessions/types'
import {
  formatSessionDateTime,
  formatVND,
  todayIso,
} from '@/features/sessions/utils/format'
import { cn } from '@/lib/utils'
import type { User } from '@/store/useAppStore'

type Filter = 'all' | SessionStatus

export function AdminSessionsView() {
  const [filter, setFilter] = useState<Filter>('all')
  const [sessions, setSessions] = useState<BadmintonSession[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const [s, u] = await Promise.all([
        sessionService.list(),
        userService.list().catch(() => []),
      ])
      setSessions(s)
      setUsers(u)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const userMap = useMemo(() => new Map(users.map((u) => [u.id, u])), [users])

  const stats = useMemo(() => {
    const total = sessions.length
    const open = sessions.filter((s) => s.status === 'open').length
    const finished = sessions.filter((s) => s.status === 'finished').length
    const totalRegs = sessions.reduce((acc, s) => acc + (s.registrationsCount ?? 0), 0)
    const today = todayIso()
    const upcoming = sessions.filter((s) => s.status === 'open' && s.date >= today).length
    return { total, open, finished, totalRegs, upcoming }
  }, [sessions])

  const filtered = useMemo(() => {
    const arr = [...sessions].sort((a, b) => b.date.localeCompare(a.date))
    if (filter === 'all') return arr
    return arr.filter((s) => s.status === filter)
  }, [sessions, filter])

  const filterTabs: { value: Filter; label: string; count: number }[] = [
    { value: 'all', label: 'Tất cả', count: sessions.length },
    { value: 'open', label: 'Đang mở', count: sessions.filter((s) => s.status === 'open').length },
    { value: 'closed', label: 'Đã đóng', count: sessions.filter((s) => s.status === 'closed').length },
    {
      value: 'finished',
      label: 'Đã kết thúc',
      count: sessions.filter((s) => s.status === 'finished').length,
    },
  ]

  if (loading) return <PageSkeleton />

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <AdminStatPill label="Tổng buổi" value={stats.total} icon="🏸" tone="brand" />
        <AdminStatPill label="Đang mở ĐK" value={stats.open} icon="🟢" tone="emerald" />
        <AdminStatPill label="Sắp diễn ra" value={stats.upcoming} icon="📅" tone="amber" />
        <AdminStatPill label="Tổng lượt ĐK" value={stats.totalRegs} icon="👥" tone="slate" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {filterTabs.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setFilter(t.value)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition',
              filter === t.value
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50',
            )}
          >
            {t.label}
            <span
              className={cn(
                'rounded-full px-1.5 text-[10px]',
                filter === t.value ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600',
              )}
            >
              {t.count}
            </span>
          </button>
        ))}

        <Link
          to="/sessions/new"
          className="ml-auto inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 text-sm font-medium text-white hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" /> Tạo buổi mới
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <ul className="divide-y divide-slate-100 md:hidden">
          {filtered.length === 0 && (
            <li className="px-4 py-10 text-center text-sm text-slate-500">Không có buổi nào.</li>
          )}
          {filtered.map((s) => (
            <li key={s.id} className="p-3">
              <Link to={`/sessions/${s.id}`} className="block">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-900">{s.title}</div>
                    <div className="text-xs text-slate-500">
                      {formatSessionDateTime(s.date, s.startTime, s.endTime)}
                    </div>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
                <div className="mt-1.5 flex items-center gap-3 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {s.registrationsCount ?? 0}/{s.maxParticipants}
                  </span>
                  <span>💰 {formatVND(s.courtFee)}</span>
                  <span className="line-clamp-1">📍 {s.location.split(',')[0]}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden md:block">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-3">Buổi</th>
                <th className="px-4 py-3">Thời gian</th>
                <th className="px-4 py-3">Địa điểm</th>
                <th className="px-4 py-3 text-right">Phí sân</th>
                <th className="px-4 py-3 text-center">TV</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                    Không có buổi nào.
                  </td>
                </tr>
              )}
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{s.title}</div>
                    <div className="text-xs text-slate-500">
                      Bởi {userMap.get(s.createdBy)?.name ?? '—'}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatSessionDateTime(s.date, s.startTime, s.endTime)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <div className="line-clamp-1 max-w-[180px]">{s.location}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-900">
                    {formatVND(s.courtFee)}
                  </td>
                  <td className="px-4 py-3 text-center text-slate-700">
                    {s.registrationsCount ?? 0}/{s.maxParticipants}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1">
                      <Link
                        to={`/sessions/${s.id}`}
                        className="rounded px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                      >
                        Xem
                      </Link>
                      <Link
                        to={`/sessions/${s.id}/manage`}
                        className="rounded px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
                      >
                        Quản lý
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={load}>
          Tải lại
        </Button>
      </div>
    </div>
  )
}

function AdminStatPill({
  label,
  value,
  icon,
  tone,
}: {
  label: string
  value: number
  icon: string
  tone: 'brand' | 'emerald' | 'amber' | 'slate'
}) {
  const tones: Record<typeof tone, string> = {
    brand: 'bg-slate-900 text-white',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    slate: 'bg-slate-100 text-slate-600',
  }
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 sm:p-4">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'grid h-9 w-9 shrink-0 place-items-center rounded-lg text-base',
            tones[tone],
          )}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-xs text-slate-500">{label}</div>
          <div className="text-lg font-semibold text-slate-900 sm:text-xl">{value}</div>
        </div>
      </div>
    </div>
  )
}

function PageSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
    </div>
  )
}
