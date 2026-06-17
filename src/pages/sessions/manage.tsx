import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Search, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { registrationService } from '@/features/sessions/services/registration.service'
import { sessionService } from '@/features/sessions/services/session.service'
import { userService } from '@/features/sessions/services/user.service'
import type {
  BadmintonSession,
  Registration,
  RegistrationFormData,
} from '@/features/sessions/types'
import {
  formatSessionDateTime,
  formatVND,
} from '@/features/sessions/utils/format'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/lib/utils'
import type { User } from '@/store/useAppStore'
import { useAppStore } from '@/store/useAppStore'

export default function SessionManagePage() {
  const { id } = useParams<{ id: string }>()
  const isAdmin = useAppStore((s) => s.user?.role === 'admin')

  const [session, setSession] = useState<BadmintonSession | null>(null)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const [toRemove, setToRemove] = useState<Registration | null>(null)
  const [showAdd, setShowAdd] = useState(false)

  const userMap = useMemo(() => new Map(users.map((u) => [u.id, u])), [users])

  const stats = useMemo(() => {
    return {
      total: registrations.length,
      attended: registrations.filter((r) => r.attended).length,
      paidFull: registrations.filter((r) => r.amountDue > 0 && r.amountPaid >= r.amountDue)
        .length,
      collected: registrations.reduce((s, r) => s + r.amountPaid, 0),
      expected: registrations.reduce((s, r) => s + r.amountDue, 0),
    }
  }, [registrations])

  async function load() {
    if (!id) return
    setLoading(true)
    try {
      const [s, r, u] = await Promise.all([
        sessionService.get(id),
        registrationService.listBySession(id).catch(() => []),
        userService.list().catch(() => []),
      ])
      setSession(s)
      setRegistrations(r)
      setUsers(u)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải được buổi')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (loading) {
    return <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
  }

  if (!session) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <p className="text-sm text-slate-500">Buổi không tồn tại.</p>
        <Link to="/sessions" className="mt-3 inline-block text-sm text-slate-900 hover:underline">
          ← Về danh sách
        </Link>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        Bạn không có quyền truy cập trang này.
      </div>
    )
  }

  async function updateReg(reg: Registration, patch: RegistrationFormData) {
    setBusy(true)
    setError(null)
    try {
      const updated = await registrationService.update(reg.id, patch)
      setRegistrations((arr) => arr.map((r) => (r.id === updated.id ? updated : r)))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Cập nhật thất bại')
    } finally {
      setBusy(false)
    }
  }

  async function splitEvenly() {
    if (registrations.length === 0 || !session) return
    const each = Math.round(session.courtFee / registrations.length)
    setBusy(true)
    try {
      await Promise.all(
        registrations.map((r) => registrationService.update(r.id, { amountDue: each })),
      )
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Chia phí thất bại')
    } finally {
      setBusy(false)
    }
  }

  async function markAllAttended() {
    const pending = registrations.filter((r) => !r.attended)
    if (pending.length === 0) return
    setBusy(true)
    try {
      await Promise.all(pending.map((r) => registrationService.update(r.id, { attended: true })))
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Điểm danh thất bại')
    } finally {
      setBusy(false)
    }
  }

  async function closeSession() {
    if (!session) return
    if (!confirm('Đóng đăng ký buổi này? User sẽ không đăng ký mới được nữa.')) return
    setBusy(true)
    try {
      const updated = await sessionService.setStatus(session.id, 'closed')
      setSession(updated)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Cập nhật thất bại')
    } finally {
      setBusy(false)
    }
  }

  async function finishSession() {
    if (!session) return
    if (!confirm('Đánh dấu buổi đã kết thúc?')) return
    setBusy(true)
    try {
      const updated = await sessionService.setStatus(session.id, 'finished')
      setSession(updated)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Cập nhật thất bại')
    } finally {
      setBusy(false)
    }
  }

  async function confirmRemove() {
    if (!toRemove) return
    setBusy(true)
    try {
      await registrationService.cancel(toRemove.id)
      setRegistrations((arr) => arr.filter((r) => r.id !== toRemove.id))
      setToRemove(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Xóa thất bại')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link
          to={`/sessions/${session.id}`}
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          ← Về chi tiết buổi
        </Link>
        <div className="flex gap-2">
          {session.status === 'open' && (
            <Button variant="outline" size="sm" onClick={closeSession} disabled={busy}>
              Đóng đăng ký
            </Button>
          )}
          {session.status !== 'finished' && session.status !== 'cancelled' && (
            <Button variant="outline" size="sm" onClick={finishSession} disabled={busy}>
              Đánh dấu kết thúc
            </Button>
          )}
          <Link
            to={`/sessions/${session.id}/edit`}
            className="inline-flex h-8 items-center rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Sửa thông tin
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-base font-semibold text-slate-900">{session.title}</h2>
        <p className="mt-1 text-sm text-slate-500">
          {formatSessionDateTime(session.date, session.startTime, session.endTime)} ·{' '}
          {session.location}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Mini label="Thành viên" value={`${stats.total}/${session.maxParticipants}`} />
          <Mini label="Đã điểm danh" value={`${stats.attended}/${stats.total}`} />
          <Mini label="Đã đóng đủ" value={`${stats.paidFull}/${stats.total}`} />
          <Mini
            label="Thu / Dự kiến"
            value={`${formatVND(stats.collected)} / ${formatVND(stats.expected || session.courtFee)}`}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" onClick={splitEvenly} disabled={busy}>
          Chia đều phí sân
        </Button>
        <Button size="sm" variant="outline" onClick={markAllAttended} disabled={busy}>
          Điểm danh tất cả
        </Button>
        <div className="ml-auto">
          <Button size="sm" onClick={() => setShowAdd(true)}>
            ＋ Thêm thành viên
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase">
            <tr>
              <th className="px-4 py-3">Thành viên</th>
              <th className="px-4 py-3 text-center">Điểm danh</th>
              <th className="px-4 py-3 text-right">Phải đóng</th>
              <th className="px-4 py-3 text-right">Đã đóng</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Ghi chú</th>
              <th className="px-4 py-3 text-right" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {registrations.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                  Chưa có thành viên nào.
                </td>
              </tr>
            )}
            {registrations.map((r) => {
              const u = userMap.get(r.userId)
              const fullName = u?.name ?? '(đã xóa)'
              const fullyPaid = r.amountDue > 0 && r.amountPaid >= r.amountDue
              return (
                <tr key={r.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                        {fullName[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{fullName}</div>
                        <div className="text-xs text-slate-500">
                          {u?.phone ?? u?.email ?? '—'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={r.attended}
                      disabled={busy}
                      onChange={(e) => updateReg(r, { attended: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <NumberInput
                      value={r.amountDue}
                      disabled={busy}
                      onChange={(v) => updateReg(r, { amountDue: v })}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <NumberInput
                      value={r.amountPaid}
                      disabled={busy}
                      onChange={(v) => updateReg(r, { amountPaid: v })}
                    />
                  </td>
                  <td className="px-4 py-3">
                    {r.amountDue === 0 ? (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                        Chưa thiết lập
                      </span>
                    ) : fullyPaid ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        Đã đóng đủ
                      </span>
                    ) : r.amountPaid > 0 ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                        Đã đóng một phần
                      </span>
                    ) : (
                      <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700">
                        Chưa đóng
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <input
                      defaultValue={r.note ?? ''}
                      disabled={busy}
                      onBlur={(e) => {
                        if ((e.target.value ?? '') !== (r.note ?? '')) {
                          updateReg(r, { note: e.target.value })
                        }
                      }}
                      placeholder="—"
                      className="w-32 rounded border border-slate-200 bg-white px-2 py-1 text-xs focus:border-slate-900 focus:outline-none"
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setToRemove(r)}
                      disabled={busy}
                      className="rounded px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={!!toRemove} onOpenChange={(o) => !o && setToRemove(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa thành viên</DialogTitle>
            <DialogDescription>
              Xóa{' '}
              <span className="font-semibold text-slate-900">
                {toRemove ? userMap.get(toRemove.userId)?.name : ''}
              </span>{' '}
              khỏi buổi này?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => setToRemove(null)}
            >
              Hủy
            </Button>
            <Button variant="destructive" onClick={confirmRemove} disabled={busy}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showAdd && (
        <AddMemberModal
          sessionId={session.id}
          existingUserIds={new Set(registrations.map((r) => r.userId))}
          onClose={() => setShowAdd(false)}
          onAdded={async () => {
            setShowAdd(false)
            await load()
          }}
        />
      )}
    </div>
  )
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      <div className="text-[11px] tracking-wide text-slate-500 uppercase">{label}</div>
      <div className="text-sm font-semibold text-slate-900">{value}</div>
    </div>
  )
}

function NumberInput({
  value,
  onChange,
  disabled,
}: {
  value: number
  onChange: (v: number) => void
  disabled?: boolean
}) {
  const [draft, setDraft] = useState<string>(String(value))

  return (
    <input
      // ép remount khi value thay đổi từ bên ngoài (vd: bấm "Chia đều")
      key={`${value}`}
      type="number"
      min={0}
      step={1000}
      defaultValue={value}
      disabled={disabled}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        const n = Number(draft)
        if (Number.isNaN(n) || n < 0) {
          setDraft('0')
          onChange(0)
        } else {
          onChange(n)
        }
      }}
      className="w-28 rounded border border-slate-200 bg-white px-2 py-1 text-right text-sm focus:border-slate-900 focus:outline-none disabled:opacity-50"
    />
  )
}

function AddMemberModal({
  sessionId,
  existingUserIds,
  onClose,
  onAdded,
}: {
  sessionId: number
  existingUserIds: Set<number>
  onClose: () => void
  onAdded: () => void
}) {
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [candidates, setCandidates] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const debounced = useDebounce(query, 300)

  useEffect(() => {
    let alive = true
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    userService
      .list({
        q: debounced.trim() || undefined,
        excludeIds: Array.from(existingUserIds),
      })
      .then((list) => {
        if (!alive) return
        setCandidates(list.slice(0, 10))
      })
      .catch((e) => alive && setError(e instanceof Error ? e.message : 'Lỗi tải user'))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [debounced, existingUserIds])

  async function add(userId: number) {
    const r = await registrationService.addMember(sessionId, userId, 0)
    if (!r.ok) {
      setError(r.error)
      return
    }
    onAdded()
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Thêm thành viên vào buổi</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setError(null)
              }}
              placeholder="Tìm theo tên, email hoặc SĐT..."
              className="h-10 pl-9"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute top-2.5 right-3 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {error && (
            <div className="rounded bg-rose-50 px-2 py-1 text-xs text-rose-700">{error}</div>
          )}
          <div className="max-h-72 space-y-1 overflow-y-auto">
            {loading ? (
              <div className="py-6 text-center text-xs text-slate-500">Đang tải…</div>
            ) : candidates.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                Không tìm thấy user phù hợp.
              </div>
            ) : (
              candidates.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => add(u.id)}
                  className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm hover:border-slate-300 hover:bg-slate-50"
                >
                  <div>
                    <div className="font-medium text-slate-900">{u.name}</div>
                    <div className="text-xs text-slate-500">
                      {u.email}
                      {u.phone ? ` · ${u.phone}` : ''}
                    </div>
                  </div>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase',
                      u.role === 'admin'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600',
                    )}
                  >
                    {u.role}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
