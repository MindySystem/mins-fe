import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin } from 'lucide-react'

import { StatusBadge } from '@/features/sessions/components/StatusBadge'
import { registrationService } from '@/features/sessions/services/registration.service'
import { sessionService } from '@/features/sessions/services/session.service'
import { userService } from '@/features/sessions/services/user.service'
import type { BadmintonSession, Registration } from '@/features/sessions/types'
import {
  formatSessionDateTime,
  formatVND,
  todayIso,
} from '@/features/sessions/utils/format'
import { cn } from '@/lib/utils'
import type { User } from '@/store/useAppStore'
import { useAppStore } from '@/store/useAppStore'

export function UserSessionsView() {
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
