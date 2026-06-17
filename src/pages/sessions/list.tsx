import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, Plus, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/features/sessions/components/StatusBadge'
import { registrationService } from '@/features/sessions/services/registration.service'
import { sessionService } from '@/features/sessions/services/session.service'
import { userService } from '@/features/sessions/services/user.service'
import type {
  BadmintonSession,
  Registration,
  SessionStatus,
} from '@/features/sessions/types'
import {
  formatSessionDateTime,
  formatVND,
  todayIso,
} from '@/features/sessions/utils/format'
import { cn } from '@/lib/utils'
import type { User } from '@/store/useAppStore'
import { useAppStore } from '@/store/useAppStore'

type Filter = 'all' | SessionStatus

export default function SessionsListPage() {
  const isAdmin = useAppStore((s) => s.user?.role === 'admin')
  return isAdmin ? <AdminSessionsView /> : <UserSessionsView />
}

/* ============================================================== */
/* USER VIEW — giao diện đăng ký/xem, ấm, thân thiện             */
/* ============================================================== */

function UserSessionsView() {
  const user = useAppStore((s) => s.user)
  const [sessions, setSessions] = useState<BadmintonSession[]>([])
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    async function load() {
      try {
        setLoading(true)
        const [s, r, u] = await Promise.all([
          sessionService.list(),
          registrationService.myRegistrations().catch(() => []),
          userService.list().catch(() => []),
        ])
        if (!alive) return
        setSessions(s)
        setRegistrations(r)
        setUsers(u)
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => {
      alive = false
    }
  }, [])

  const myRegs = useMemo(
    () => (user ? registrations.filter((r) => r.userId === user.id) : []),
    [user, registrations],
  )
  const registeredSessionIds = new Set(myRegs.map((r) => r.sessionId))
  const today = todayIso()

  const myUpcoming = useMemo(() => {
    return myRegs
      .map((r) => sessions.find((s) => s.id === r.sessionId))
      .filter((s): s is BadmintonSession => Boolean(s))
      .filter((s) => s.status !== 'cancelled' && s.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [myRegs, sessions, today])

  const openSessions = useMemo(
    () =>
      sessions
        .filter((s) => s.status === 'open')
        .filter((s) => s.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [sessions, today],
  )

  const pastSessions = useMemo(
    () =>
      sessions
        .filter((s) => s.status === 'finished' || s.date < today)
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 5),
    [sessions, today],
  )

  const nextSession = myUpcoming[0]
  const nextReg = nextSession
    ? myRegs.find((r) => r.sessionId === nextSession.id)
    : undefined

  if (loading) {
    return <PageSkeleton />
  }

  return (
    <div className="space-y-5">
      {nextSession ? (
        <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-5 sm:p-6">
          <div className="absolute -right-6 -top-6 text-8xl opacity-10 sm:text-9xl">🏸</div>
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-emerald-700 uppercase">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              Buổi tiếp theo của bạn
            </div>
            <h2 className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
              {nextSession.title}
            </h2>
            <p className="mt-1 text-sm text-emerald-800">
              {formatSessionDateTime(
                nextSession.date,
                nextSession.startTime,
                nextSession.endTime,
              )}
            </p>
            <p className="mt-0.5 text-xs text-slate-600">📍 {nextSession.location}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                to={`/sessions/${nextSession.id}`}
                className="inline-flex h-10 items-center rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-700"
              >
                Xem chi tiết
              </Link>
              {nextReg?.attended && (
                <span className="inline-flex h-10 items-center rounded-lg bg-white px-3 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                  ✓ Đã điểm danh
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-emerald-100 bg-white p-6 text-center">
          <div className="text-4xl">🏸</div>
          <h3 className="mt-2 text-base font-semibold text-slate-900">
            Bạn chưa đăng ký buổi nào
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Xem các buổi đang mở bên dưới và đăng ký ngay nhé.
          </p>
        </div>
      )}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 sm:text-base">
            🟢 Đang mở đăng ký
            <span className="ml-1 text-xs font-normal text-slate-500">({openSessions.length})</span>
          </h3>
        </div>
        {openSessions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
            Chưa có buổi nào đang mở.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {openSessions.map((s) => {
              const count = s.registrationsCount ?? 0
              const isFull = count >= s.maxParticipants
              const isRegistered = registeredSessionIds.has(s.id)
              return (
                <SessionJoinCard
                  key={s.id}
                  session={s}
                  count={count}
                  isFull={isFull}
                  isRegistered={isRegistered}
                />
              )
            })}
          </div>
        )}
      </section>

      {pastSessions.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold text-slate-900 sm:text-base">
            📜 Gần đây
          </h3>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <ul className="divide-y divide-slate-100">
              {pastSessions.map((s) => {
                const isMine = registeredSessionIds.has(s.id)
                return (
                  <li key={s.id}>
                    <Link
                      to={`/sessions/${s.id}`}
                      className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-slate-900">
                          {s.title}
                        </div>
                        <div className="text-xs text-slate-500">
                          {formatSessionDateTime(s.date, s.startTime, s.endTime)} ·{' '}
                          {s.registrationsCount ?? 0} người
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isMine && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                            Bạn
                          </span>
                        )}
                        <StatusBadge status={s.status} />
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>
      )}
      {/* users list intentionally loaded to keep parity with API; not rendered */}
      {users.length > 0 && null}
    </div>
  )
}

function SessionJoinCard({
  session,
  count,
  isFull,
  isRegistered,
}: {
  session: BadmintonSession
  count: number
  isFull: boolean
  isRegistered: boolean
}) {
  return (
    <div
      className={cn(
        'group flex flex-col overflow-hidden rounded-xl border-2 bg-white transition hover:border-emerald-300 hover:shadow-md',
        isRegistered ? 'border-emerald-300 bg-emerald-50/40' : 'border-slate-200',
      )}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <Link
            to={`/sessions/${session.id}`}
            className="line-clamp-2 text-base font-semibold text-slate-900 group-hover:text-emerald-700"
          >
            {session.title}
          </Link>
          {isRegistered && (
            <span className="shrink-0 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
              Đã ĐK
            </span>
          )}
        </div>
        <dl className="mt-3 space-y-1.5 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span className="font-medium text-slate-700">
              {formatSessionDateTime(session.date, session.startTime, session.endTime)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            <span className="line-clamp-1">{session.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>💰</span>
            <span>
              Phí sân{' '}
              <strong className="text-slate-800">{formatVND(session.courtFee)}</strong>
            </span>
          </div>
        </dl>
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/60 px-4 py-3">
        <div className="flex items-center gap-2 text-xs">
          <div className="flex -space-x-1.5">
            {[...Array(Math.min(3, count))].map((_, i) => (
              <div
                key={i}
                className="grid h-6 w-6 place-items-center rounded-full border-2 border-white bg-slate-200 text-[9px] font-semibold text-slate-500"
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          <span className="text-slate-500">
            {count}/{session.maxParticipants}
            {isFull && <span className="ml-1 text-rose-600">(đủ)</span>}
          </span>
        </div>
        {isRegistered ? (
          <Link
            to={`/sessions/${session.id}`}
            className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-300 hover:bg-emerald-50"
          >
            Đã đăng ký →
          </Link>
        ) : (
          <Link
            to={`/sessions/${session.id}`}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-medium',
              isFull
                ? 'cursor-not-allowed bg-slate-200 text-slate-500'
                : 'bg-emerald-600 text-white hover:bg-emerald-700',
            )}
          >
            {isFull ? 'Đã đủ' : 'Đăng ký →'}
          </Link>
        )}
      </div>
    </div>
  )
}

/* ============================================================== */
/* ADMIN VIEW — bảng điều khiển, thống kê, action buttons         */
/* ============================================================== */

function AdminSessionsView() {
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
