import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { registrationService } from '@/features/sessions/services/registration.service'
import { sessionService } from '@/features/sessions/services/session.service'
import type {
  BadmintonSession,
  Registration,
} from '@/features/sessions/types'
import {
  formatSessionDateTime,
  formatVND,
  SESSION_STATUS_LABELS,
  todayIso,
} from '@/features/sessions/utils/format'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'

type Filter = 'upcoming' | 'past' | 'all'

export default function MySessionsPage() {
  const user = useAppStore((s) => s.user)
  const [regs, setRegs] = useState<Registration[]>([])
  const [sessions, setSessions] = useState<BadmintonSession[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('upcoming')
  const [confirmCancelReg, setConfirmCancelReg] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!user) return
    let alive = true
    async function load() {
      try {
        setLoading(true)
        const [r, s] = await Promise.all([
          registrationService.myRegistrations(),
          sessionService.list(),
        ])
        if (!alive) return
        setRegs(r)
        setSessions(s)
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => {
      alive = false
    }
  }, [user])

  const sessionById = useMemo(
    () => new Map(sessions.map((s) => [s.id, s])),
    [sessions],
  )

  const enriched = useMemo(() => {
    return regs
      .map((r) => {
        const s = sessionById.get(r.sessionId)
        return s ? { reg: r, session: s } : null
      })
      .filter((x): x is { reg: Registration; session: BadmintonSession } => x !== null)
      .sort((a, b) => b.session.date.localeCompare(a.session.date))
  }, [regs, sessionById])

  const today = todayIso()
  const filtered = useMemo(() => {
    if (filter === 'all') return enriched
    if (filter === 'upcoming') {
      return enriched.filter(
        (x) => x.session.date >= today && x.session.status !== 'cancelled',
      )
    }
    return enriched.filter(
      (x) =>
        x.session.date < today ||
        x.session.status === 'finished' ||
        x.session.status === 'cancelled',
    )
  }, [enriched, filter, today])

  const totals = useMemo(() => {
    let owed = 0
    let paid = 0
    let attended = 0
    enriched.forEach(({ reg }) => {
      owed += reg.amountDue
      paid += reg.amountPaid
      if (reg.attended) attended += 1
    })
    return { owed, paid, attended, total: enriched.length }
  }, [enriched])

  if (!user) return null

  async function handleCancel(regId: number) {
    const reg = regs.find((r) => r.id === regId)
    if (!reg) return
    setBusy(true)
    try {
      await registrationService.cancel(regId)
      setRegs((arr) => arr.filter((r) => r.id !== regId))
      setConfirmCancelReg(null)
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-32 animate-pulse rounded-xl bg-slate-100" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Buổi đã đăng ký" value={String(totals.total)} icon="📅" />
        <Stat label="Đã điểm danh" value={String(totals.attended)} icon="✅" />
        <Stat
          label="Còn phải đóng"
          value={formatVND(Math.max(0, totals.owed - totals.paid))}
          icon="💸"
        />
        <Stat label="Đã đóng" value={formatVND(totals.paid)} icon="💰" />
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            { v: 'upcoming', label: 'Sắp tới' },
            { v: 'past', label: 'Đã qua' },
            { v: 'all', label: 'Tất cả' },
          ] as { v: Filter; label: string }[]
        ).map((t) => (
          <button
            key={t.v}
            type="button"
            onClick={() => setFilter(t.v)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-medium transition',
              filter === t.v
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          {filter === 'upcoming'
            ? 'Bạn chưa đăng ký buổi nào sắp tới.'
            : 'Không có buổi nào trong mục này.'}
          <div className="mt-3">
            <Link
              to="/sessions"
              className="inline-block rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
            >
              Xem các buổi đang mở
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(({ reg, session }) => {
            const fullyPaid = reg.amountDue > 0 && reg.amountPaid >= reg.amountDue
            return (
              <div
                key={reg.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/sessions/${session.id}`}
                      className="text-sm font-semibold text-slate-900 hover:text-emerald-700"
                    >
                      {session.title}
                    </Link>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                      {SESSION_STATUS_LABELS[session.status]}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {formatSessionDateTime(session.date, session.startTime, session.endTime)} ·{' '}
                    {session.location}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                    {reg.attended ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-700">
                        ✓ Đã điểm danh
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-500">
                        Chưa điểm danh
                      </span>
                    )}
                    {reg.amountDue > 0 ? (
                      fullyPaid ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-700">
                          ✓ Đã đóng đủ
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-700">
                          Còn thiếu {formatVND(reg.amountDue - reg.amountPaid)}
                        </span>
                      )
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-500">
                        Chưa thiết lập phí
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/sessions/${session.id}`}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Xem chi tiết
                  </Link>
                  {session.status === 'open' && (
                    <button
                      type="button"
                      onClick={() => setConfirmCancelReg(reg.id)}
                      className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
                    >
                      Hủy đăng ký
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Dialog
        open={confirmCancelReg !== null}
        onOpenChange={(o) => !o && setConfirmCancelReg(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hủy đăng ký</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn hủy đăng ký buổi{' '}
              <span className="font-semibold text-slate-900">
                {confirmCancelReg
                  ? sessionById.get(regs.find((r) => r.id === confirmCancelReg)?.sessionId ?? -1)
                      ?.title
                  : ''}
              </span>
              ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => setConfirmCancelReg(null)}
            >
              Đóng
            </Button>
            <Button
              variant="destructive"
              onClick={() => confirmCancelReg && handleCancel(confirmCancelReg)}
              disabled={busy}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Hủy đăng ký'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Stat({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:gap-3 sm:p-4">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-50 text-lg text-emerald-700">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[11px] text-slate-500 sm:text-xs">{label}</div>
        <div className="truncate text-sm font-semibold text-slate-900 sm:text-base">{value}</div>
      </div>
    </div>
  )
}
