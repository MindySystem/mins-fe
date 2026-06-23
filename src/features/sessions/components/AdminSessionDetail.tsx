import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { StatusBadge } from '@/features/sessions/components/StatusBadge'
import { registrationService } from '@/features/sessions/services/registration.service'
import { sessionService } from '@/features/sessions/services/session.service'
import { userService } from '@/features/sessions/services/user.service'
import type { BadmintonSession, Registration } from '@/features/sessions/types'
import {
  formatSessionDateTime,
  formatVND,
} from '@/features/sessions/utils/format'
import { cn } from '@/lib/utils'
import type { User } from '@/store/useAppStore'
import { useAppStore } from '@/store/useAppStore'

export function AdminSessionDetail() {
  const { id } = useParams<{ id: string }>()
  const isAdmin = useAppStore((s) => s.user?.role === 'admin')
  const [session, setSession] = useState<BadmintonSession | null>(null)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

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
      <NotFound
        message="Buổi không tồn tại hoặc đã bị xóa."
        backTo="/sessions"
        backLabel="Về danh sách buổi"
      />
    )
  }

  if (!isAdmin) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        Bạn không có quyền truy cập trang này.
      </div>
    )
  }

  const stats = {
    total: registrations.length,
    attended: registrations.filter((r) => r.attended).length,
    paidFull: registrations.filter((r) => r.amountDue > 0 && r.amountPaid >= r.amountDue).length,
    collected: registrations.reduce((s, r) => s + r.amountPaid, 0),
    expected: registrations.reduce((s, r) => s + r.amountDue, 0),
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          to="/sessions"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          ← Danh sách buổi
        </Link>
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/sessions/${session.id}/edit`}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Sửa thông tin
          </Link>
          <Link
            to={`/sessions/${session.id}/manage`}
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
          >
            Quản lý
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-900">{session.title}</h2>
              <StatusBadge status={session.status} />
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {formatSessionDateTime(session.date, session.startTime, session.endTime)} ·{' '}
              {session.location}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <InfoCell label="Thành viên" value={`${stats.total}/${session.maxParticipants}`} />
          <InfoCell label="Đã ĐD" value={`${stats.attended}/${stats.total}`} />
          <InfoCell label="Đã đóng" value={`${stats.paidFull}/${stats.total}`} />
          <InfoCell
            label="Thu / Dự kiến"
            value={`${formatVND(stats.collected)} / ${formatVND(
              stats.expected || session.courtFee,
            )}`}
          />
        </div>

        {session.description && (
          <div className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700">
            {session.description}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-900">
            Thành viên ({registrations.length})
          </h3>
          <Link
            to={`/sessions/${session.id}/manage`}
            className="text-xs font-medium text-emerald-700 hover:underline"
          >
            Mở trang quản lý →
          </Link>
        </div>
        {registrations.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-slate-500">Chưa có ai đăng ký.</div>
        ) : (
          <>
            <ul className="divide-y divide-slate-100 md:hidden">
              {registrations.map((r) => {
                const u = users.find((x) => x.id === r.userId)
                const fullName = u?.name ?? '(đã xóa)'
                return (
                  <li key={r.id} className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                        {fullName[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-slate-900">
                          {fullName}
                        </div>
                        <div className="text-xs text-slate-500">
                          {u?.phone ?? u?.email}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                      {r.attended ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-700">
                          ✓ Có mặt
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-500">
                          Chưa ĐD
                        </span>
                      )}
                      {r.amountDue > 0 && (
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 font-medium',
                            r.amountPaid >= r.amountDue
                              ? 'bg-blue-100 text-blue-700'
                              : r.amountPaid > 0
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-rose-100 text-rose-700',
                          )}
                        >
                          {formatVND(r.amountPaid)} / {formatVND(r.amountDue)}
                        </span>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>

            <table className="hidden min-w-full divide-y divide-slate-200 text-sm md:table">
              <thead className="bg-slate-50 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-2.5">Thành viên</th>
                  <th className="px-4 py-2.5 text-center">ĐD</th>
                  <th className="px-4 py-2.5 text-right">Phải đóng</th>
                  <th className="px-4 py-2.5 text-right">Đã đóng</th>
                  <th className="px-4 py-2.5">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {registrations.map((r) => {
                  const u = users.find((x) => x.id === r.userId)
                  const fullName = u?.name ?? '(đã xóa)'
                  const fullyPaid = r.amountDue > 0 && r.amountPaid >= r.amountDue
                  return (
                    <tr key={r.id}>
                      <td className="px-4 py-2.5">
                        <div className="font-medium text-slate-900">{fullName}</div>
                        <div className="text-xs text-slate-500">{u?.phone ?? u?.email ?? '—'}</div>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {r.attended ? (
                          <span className="text-emerald-600">✓</span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-700">
                        {formatVND(r.amountDue)}
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-700">
                        {formatVND(r.amountPaid)}
                      </td>
                      <td className="px-4 py-2.5">
                        {r.amountDue === 0 ? (
                          <span className="text-xs text-slate-400">—</span>
                        ) : fullyPaid ? (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                            Đã đủ
                          </span>
                        ) : r.amountPaid > 0 ? (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                            1 phần
                          </span>
                        ) : (
                          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-medium text-rose-700">
                            Chưa đóng
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  )
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      <div className="text-[11px] tracking-wide text-slate-500 uppercase">{label}</div>
      <div className="mt-0.5 text-sm font-medium break-words text-slate-900">{value}</div>
    </div>
  )
}

function NotFound({
  message,
  backTo,
  backLabel,
}: {
  message: string
  backTo: string
  backLabel: string
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <div className="text-4xl">🤔</div>
      <p className="mt-2 text-sm text-slate-500">{message}</p>
      <Link to={backTo} className="mt-3 inline-block text-sm text-slate-900 hover:underline">
        ← {backLabel}
      </Link>
    </div>
  )
}
