import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Receipt, CheckCircle, AlertCircle, QrCode, Navigation } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { StatusBadge } from '@/features/sessions/components/StatusBadge'
import { registrationService } from '@/features/sessions/services/registration.service'
import { sessionService } from '@/features/sessions/services/session.service'
import { userService } from '@/features/sessions/services/user.service'
import type { BadmintonSession, Registration } from '@/features/sessions/types'
import {
  COURT_FEE_TYPE_LABELS,
  formatSessionDateTime,
  formatVND,
} from '@/features/sessions/utils/format'
import { cn } from '@/lib/utils'
import type { User } from '@/store/useAppStore'
import { useAppStore } from '@/store/useAppStore'
import { genderLabel, skillLevelLabel } from '@/utils/userMeta'

export function UserSessionDetail() {
  const { id } = useParams<{ id: string }>()
  const currentUser = useAppStore((s) => s.user)
  const [session, setSession] = useState<BadmintonSession | null>(null)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [extraCosts, setExtraCosts] = useState<any[]>([])
  const [userMap, setUserMap] = useState<Map<number, User>>(new Map())
  const [loading, setLoading] = useState(true)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function load() {
    if (!id) return
    setLoading(true)
    try {
      const [s, r, ec] = await Promise.all([
        sessionService.get(id),
        registrationService.listBySession(id).catch(() => []),
        sessionService.getExtraCosts(id).catch(() => ({ data: [] })),
      ])
      setSession(s)
      setRegistrations(r)
      setExtraCosts(ec.data || [])

      // Eager loaded users or lookup fallback
      const embedded = r.map((reg) => reg.user).filter((u): u is User => Boolean(u))
      const missing = r.map((reg) => reg.userId).filter((uid) => !embedded.some((u) => u.id === uid))

      const pairs: [number, User][] = []
      embedded.forEach((u) => pairs.push([u.id, u]))

      if (missing.length) {
        const looked = await userService.lookup(missing).catch(() => [])
        looked.forEach((u) => pairs.push([u.id, u]))
      }
      setUserMap(new Map(pairs))
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Không tải được buổi')
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

  const myReg = currentUser ? registrations.find((r) => r.userId === currentUser.id) : undefined
  const isFull = registrations.length >= session.maxParticipants
  const isCancelled = session.status === 'cancelled' || session.status === 'finished'
  const isLockedRegistration = Boolean(myReg && (myReg.userConfirmedPaid || myReg.adminConfirmedPaid))
  const canRegister = session.status === 'open' && !isFull && !myReg

  async function handleRegister() {
    if (!session) return
    setBusy(true)
    setActionError(null)
    const result = await registrationService.register(session.id)
    setBusy(false)
    if (!result.ok) {
      setActionError(result.error)
      return
    }
    toast.success('Đã đăng ký tham gia thành công!')
    await load()
  }

  async function handleCancel() {
    if (!myReg) return
    if (isLockedRegistration) return
    setBusy(true)
    try {
      await registrationService.cancel(myReg.id)
      setConfirmCancel(false)
      toast.success('Đã hủy đăng ký thành công')
      await load()
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Không hủy được')
    } finally {
      setBusy(false)
    }
  }

  const handleUserConfirmPayment = async () => {
    if (!myReg) return
    setBusy(true)
    try {
      await sessionService.userConfirmPayment(myReg.id)
      toast.success('Đã gửi yêu cầu xác nhận thanh toán đến Admin')
      await load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Xác nhận thất bại')
    } finally {
      setBusy(false)
    }
  }

  // Calculate costs summary
  const extraCostsTotal = extraCosts.reduce((sum, item) => sum + item.amount, 0)
  const shuttlecockCostTotal = Math.round((session.shuttlecockPricePerTube / 12.0) * session.shuttlecocksUsed)
  const courtDirectionUrl = session.court
    ? session.court.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(session.court.address)}`
    : null

  return (
    <div className="space-y-6">
      <Link
        to="/sessions"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        ← Danh sách buổi
      </Link>

      <div
        className={cn(
          'relative overflow-hidden rounded-2xl border bg-white p-5 sm:p-6 shadow-sm',
          myReg ? 'border-emerald-200' : 'border-slate-200',
        )}
      >
        <div className="absolute -right-6 -top-6 text-9xl opacity-5">🏸</div>
        <div className="relative space-y-4">
          <div className="flex items-center gap-2">
            <StatusBadge status={session.status} />
            {myReg && (
              <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                ✓ Đã đăng ký
              </span>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">{session.title}</h2>
            <p className="text-xs text-slate-400 mt-1">Tạo bởi: {session.creator?.name || 'Ban quản trị'}</p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
            <HeroInfo
              icon="🗓️"
              label="Thời gian"
              value={formatSessionDateTime(session.date, session.startTime, session.endTime)}
            />
            <HeroInfo icon="📍" label="Địa điểm" value={session.location} />
            <HeroInfo icon="🏸" label="Loại cầu" value={session.shuttlecock?.name || 'Chưa chọn'} />
            <HeroInfo icon="🏟️" label="Loại sân" value={COURT_FEE_TYPE_LABELS[session.courtFeeType]} />
            <HeroInfo icon="👥" label="Thành viên" value={`${registrations.length}/${session.maxParticipants}`} />
          </div>

          {courtDirectionUrl && (
            <a
              href={courtDirectionUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              <Navigation className="h-3.5 w-3.5" /> Chỉ đường đến {session.court?.name || 'sân'}
            </a>
          )}

          {session.description && (
            <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {session.description}
            </div>
          )}

          {/* Chi tiết chi phí */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Receipt className="h-3.5 w-3.5" /> {session.courtFeeType === 'fixed' ? 'Phí tham gia' : 'Chi tiết chi phí chung'}
            </h4>
            {session.courtFeeType === 'fixed' ? (
              <div className="grid grid-cols-1 gap-3 text-sm text-slate-600 sm:grid-cols-2">
                <div className="flex justify-between border-b border-slate-100 pb-1.5 sm:border-0 sm:pb-0">
                  <span>Phí Nam:</span>
                  <span className="font-semibold text-slate-900">{formatVND(session.fixedFeeMale)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5 sm:border-0 sm:pb-0">
                  <span>Phí Nữ:</span>
                  <span className="font-semibold text-slate-900">{formatVND(session.fixedFeeFemale)}</span>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-3 text-sm text-slate-600 sm:grid-cols-2">
                  <div className="flex justify-between border-b border-slate-100 pb-1.5 sm:border-0 sm:pb-0">
                    <span>Chi phí cầu lông ({session.shuttlecocksUsed} quả):</span>
                    <span className="font-semibold text-slate-900">
                      {formatVND(shuttlecockCostTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5 sm:border-0 sm:pb-0">
                    <span>Phí riêng (Nam):</span>
                    <span className="font-semibold text-slate-900">{formatVND(session.fixedFeeMale)}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5 sm:border-0 sm:pb-0">
                    <span>Phí riêng (Nữ):</span>
                    <span className="font-semibold text-slate-900">{formatVND(session.fixedFeeFemale)}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5 sm:border-0 sm:pb-0 sm:col-span-2">
                    <span>Chi phí phát sinh:</span>
                    <span className="font-semibold text-slate-900">{formatVND(extraCostsTotal)}</span>
                  </div>
                </div>
                {extraCosts.length > 0 && (
                  <div className="bg-white rounded-lg p-2.5 border border-slate-100 space-y-1 mt-2">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Danh mục phát sinh:</div>
                    <div className="space-y-1">
                      {extraCosts.map((ec) => (
                        <div key={ec.id} className="flex justify-between text-xs text-slate-500">
                          <span>• {ec.name} {ec.note ? `(${ec.note})` : ''}</span>
                          <span className="font-medium">{formatVND(ec.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {actionError && (
            <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {actionError}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-2">
            {!isCancelled && (
              <>
                {myReg ? (
                  <>
                    {session.status === 'open' && !isLockedRegistration && (
                      <Button variant="outline" onClick={() => setConfirmCancel(true)} className="border-slate-200 bg-white">
                        Hủy đăng ký
                      </Button>
                    )}
                    {isLockedRegistration && (
                      <div className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
                        Đã xác nhận thanh toán, không thể hủy
                      </div>
                    )}
                  </>
                ) : canRegister ? (
                  <Button onClick={handleRegister} disabled={busy} className="bg-slate-900 hover:bg-slate-800 text-white px-6">
                    🏸 Đăng ký tham gia
                  </Button>
                ) : (
                  <Button disabled className="bg-slate-100 text-slate-400 border border-slate-200">
                    {isFull ? 'Buổi đã đủ người' : 'Đang đóng đăng ký'}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Panel thanh toán cho cá nhân */}
      {myReg && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <QrCode className="h-5 w-5 text-slate-600" />
            <h3 className="text-base font-bold text-slate-900">Chi tiết thanh toán cá nhân</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="rounded-xl bg-slate-50 p-4 space-y-2 border">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Số tiền cần thanh toán:</span>
                  <span className="font-bold text-slate-950 text-base">{formatVND(myReg.amountDue)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Số tiền đã thanh toán:</span>
                  <span className="font-semibold text-emerald-600">{formatVND(myReg.amountPaid)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600 pt-1.5 border-t border-slate-200">
                  <span>Còn lại:</span>
                  <span className="font-bold text-rose-600">{formatVND(Math.max(0, myReg.amountDue - myReg.amountPaid))}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng thái thanh toán</div>
                <div className="flex items-center gap-2">
                  {myReg.adminConfirmedPaid ? (
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                      <CheckCircle className="h-4 w-4" /> Đã hoàn tất thanh toán
                    </div>
                  ) : myReg.userConfirmedPaid ? (
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
                      <AlertCircle className="h-4 w-4" /> Đang chờ Admin xác nhận nhận tiền
                    </div>
                  ) : (
                    <div className="space-y-3 w-full">
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100 w-fit">
                        <AlertCircle className="h-4 w-4" /> Chưa thanh toán
                      </div>
                      <Button onClick={handleUserConfirmPayment} disabled={busy} className="bg-emerald-600 hover:bg-emerald-500 text-white w-full py-5 font-semibold">
                        Tôi đã chuyển khoản thanh toán
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center border rounded-xl p-4 bg-slate-50 min-h-[200px]">
              {session.qrCodeUrl ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="p-2 bg-white rounded-lg border shadow-xs">
                    <img src={session.qrCodeUrl} alt="QR Code Payment" className="h-36 w-36 object-contain" />
                  </div>
                  <span className="text-xs text-slate-500 font-medium">Quét mã QR để chuyển khoản thanh toán</span>
                </div>
              ) : (
                <div className="text-center text-slate-400 space-y-1">
                  <QrCode className="h-10 w-10 mx-auto text-slate-300" />
                  <div className="text-xs font-semibold text-slate-500">Chưa có mã QR thanh toán</div>
                  <div className="text-[10px] text-slate-400">Admin chưa tải lên mã QR chuyển tiền cho buổi này</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Thành viên tham gia */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-bold text-slate-900">
          Danh sách tham gia ({registrations.length})
        </h3>
        {registrations.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Chưa có ai đăng ký tham gia.</p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-100">
            <div className="divide-y divide-slate-100 md:hidden">
              {registrations.map((r) => {
                const u = userMap.get(r.userId)
                const fullName = u?.name ?? '(đã xóa)'
                const isMe = u?.id === currentUser?.id

                return (
                  <div key={r.id} className={cn('p-3', isMe && 'bg-emerald-50/30')}>
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-semibold',
                        isMe ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      )}>
                        {fullName[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-semibold text-slate-900">{fullName}</span>
                          {isMe && (
                            <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-emerald-800">
                              Bạn
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 text-xs text-slate-500">{u?.phone || u?.email || '—'}</div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                            {genderLabel(u?.gender)}
                          </span>
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                            {skillLevelLabel(u?.skillLevel)}
                          </span>
                          {r.attended ? (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                              Có mặt
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg bg-slate-50 px-2 py-1.5">
                        <div className="text-slate-400">Phải đóng</div>
                        <div className="font-semibold text-slate-900">{formatVND(r.amountDue)}</div>
                      </div>
                      <div className="rounded-lg bg-slate-50 px-2 py-1.5">
                        <div className="text-slate-400">Đã đóng</div>
                        <div className="font-semibold text-slate-900">{formatVND(r.amountPaid)}</div>
                      </div>
                    </div>
                    <div className="mt-2">
                      {r.adminConfirmedPaid ? (
                        <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase">
                          Hoàn tất
                        </span>
                      ) : r.userConfirmedPaid ? (
                        <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 uppercase">
                          Chờ duyệt
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 uppercase">
                          Chưa đóng
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <table className="hidden min-w-full divide-y divide-slate-100 text-sm md:table">
              <thead className="bg-slate-50 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3">Thành viên</th>
                  <th className="px-4 py-3 text-center">Giới tính</th>
                  <th className="px-4 py-3 text-center">Trình độ</th>
                  <th className="px-4 py-3 text-center">Có mặt</th>
                  <th className="px-4 py-3 text-right">Phải đóng</th>
                  <th className="px-4 py-3 text-right">Đã đóng</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {registrations.map((r) => {
                  const u = userMap.get(r.userId)
                  const fullName = u?.name ?? '(đã xóa)'
                  const isMe = u?.id === currentUser?.id

                  return (
                    <tr key={r.id} className={cn('hover:bg-slate-50/50', isMe && 'bg-emerald-50/20')}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            'grid h-8 w-8 place-items-center rounded-full text-xs font-semibold',
                            isMe ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          )}>
                            {fullName[0]?.toUpperCase() ?? '?'}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              {fullName}
                              {isMe && (
                                <span className="rounded bg-emerald-100 px-1 py-0.2 text-[8px] font-bold text-emerald-800 uppercase">
                                  Bạn
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500">{u?.phone || u?.email || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-slate-600">
                        {genderLabel(u?.gender)}
                      </td>
                      <td className="px-4 py-3 text-center text-slate-600">
                        {skillLevelLabel(u?.skillLevel)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {r.attended ? (
                          <span className="text-emerald-600 font-bold">✓ Có mặt</span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900">
                        {formatVND(r.amountDue)}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">
                        {formatVND(r.amountPaid)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {r.adminConfirmedPaid ? (
                          <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase">
                            Hoàn tất
                          </span>
                        ) : r.userConfirmedPaid ? (
                          <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 uppercase">
                            Chờ duyệt
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 uppercase">
                            Chưa đóng
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <DialogContent className="bg-white border">
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-bold text-lg">Hủy đăng ký</DialogTitle>
            <DialogDescription className="text-slate-500 text-sm">
              Bạn có chắc muốn hủy đăng ký buổi{' '}
              <span className="font-semibold text-slate-900">{session.title}</span>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => setConfirmCancel(false)}
              className="border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
            >
              Đóng
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={busy} className="bg-red-600 hover:bg-red-500 text-white">
              Hủy đăng ký
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function HeroInfo({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-3 border border-slate-100">
      <div className="text-lg">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
          {label}
        </div>
        <div className="mt-0.5 text-sm font-semibold break-words text-slate-900">{value}</div>
      </div>
    </div>
  )
}

/* ============================================================== */
/* ADMIN VIEW — control panel, dense, action-heavy                 */
/* ============================================================== */

export function AdminSessionDetail() {
  const { id } = useParams<{ id: string }>()
  const isAdmin = useAppStore((s) => s.user?.role === 'admin')
  const [session, setSession] = useState<BadmintonSession | null>(null)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [extraCosts, setExtraCosts] = useState<any[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    if (!id) return
    setLoading(true)
    try {
      const [s, r, u, ec] = await Promise.all([
        sessionService.get(id),
        registrationService.listBySession(id).catch(() => []),
        userService.list().catch(() => []),
        sessionService.getExtraCosts(id).catch(() => ({ data: [] })),
      ])
      setSession(s)
      setRegistrations(r)
      setUsers(u)
      setExtraCosts(ec.data || [])
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

  // Cost calculations
  const extraCostsTotal = extraCosts.reduce((sum, item) => sum + item.amount, 0)
  const shuttlecockCostTotal = Math.round((session.shuttlecockPricePerTube / 12.0) * session.shuttlecocksUsed)

  const stats = {
    total: registrations.length,
    attended: registrations.filter((r) => r.attended).length,
    paidFull: registrations.filter((r) => r.adminConfirmedPaid).length,
    collected: registrations.reduce((sum, r) => sum + r.amountPaid, 0),
    expected: registrations.reduce((sum, r) => sum + r.amountDue, 0),
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
            className="inline-flex h-9 items-center rounded-lg border border-slate-350 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Sửa thông tin
          </Link>
          <Link
            to={`/sessions/${session.id}/manage`}
            className="inline-flex h-9 items-center rounded-lg bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-slate-800"
          >
            Quản lý
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{session.title}</h2>
              <StatusBadge status={session.status} />
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {formatSessionDateTime(session.date, session.startTime, session.endTime)} ·{' '}
              {session.location}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <InfoCell label="Thành viên" value={`${stats.total}/${session.maxParticipants}`} />
          <InfoCell label="Đã ĐD" value={`${stats.attended}/${stats.total}`} />
          <InfoCell label="Đã đóng" value={`${stats.paidFull}/${stats.total}`} />
          <InfoCell
            label="Thu / Dự kiến"
            value={`${formatVND(stats.collected)} / ${formatVND(stats.expected)}`}
          />
        </div>

        {/* Cost breakdown in Admin View */}
        <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4 space-y-2 text-sm text-slate-600">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-1">Chi tiết chi phí cấu hình</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {session.type === 'fixed' || session.courtFeeType === 'fixed' ? (
              <>
                <div className="flex justify-between">
                  <span>Phí Nam:</span>
                  <span className="font-semibold text-slate-900">{formatVND(session.fixedFeeMale)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí Nữ:</span>
                  <span className="font-semibold text-slate-900">{formatVND(session.fixedFeeFemale)}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span>Cầu đã dùng ({session.shuttlecocksUsed} quả):</span>
                  <span className="font-semibold text-slate-900">
                    {formatVND(shuttlecockCostTotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Phí Nam / Nữ:</span>
                  <span className="font-semibold text-slate-900">{formatVND(session.fixedFeeMale)} / {formatVND(session.fixedFeeFemale)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phát sinh:</span>
                  <span className="font-semibold text-slate-900">{formatVND(extraCostsTotal)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {session.description && (
          <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700">
            {session.description}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 bg-slate-50">
          <h3 className="text-sm font-bold text-slate-900">
            Thành viên tham gia ({registrations.length})
          </h3>
          <Link
            to={`/sessions/${session.id}/manage`}
            className="text-xs font-semibold text-emerald-700 hover:underline"
          >
            Trang quản lý & Duyệt đóng tiền →
          </Link>
        </div>
        {registrations.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-slate-500">Chưa có ai đăng ký.</div>
        ) : (
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-3">Thành viên</th>
                <th className="px-4 py-3 text-center">Giới tính</th>
                <th className="px-4 py-3 text-center">Trình độ</th>
                <th className="px-4 py-3 text-center">ĐD</th>
                <th className="px-4 py-3 text-right">Phải đóng</th>
                <th className="px-4 py-3 text-right">Đã đóng</th>
                <th className="px-4 py-3 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {registrations.map((r) => {
                const u = users.find((x) => x.id === r.userId)
                const fullName = u?.name ?? '(đã xóa)'

                return (
                  <tr key={r.id} className="hover:bg-slate-50/30">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{fullName}</div>
                      <div className="text-xs text-slate-500">{u?.phone ?? u?.email ?? '—'}</div>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600">{genderLabel(u?.gender)}</td>
                    <td className="px-4 py-3 text-center text-slate-600">{skillLevelLabel(u?.skillLevel)}</td>
                    <td className="px-4 py-3 text-center">
                      {r.attended ? (
                        <span className="text-emerald-600 font-bold">✓</span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">
                      {formatVND(r.amountDue)}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      {formatVND(r.amountPaid)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {r.adminConfirmedPaid ? (
                        <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase">
                          Đã duyệt
                        </span>
                      ) : r.userConfirmedPaid ? (
                        <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 uppercase animate-pulse">
                          Chờ duyệt
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 uppercase">
                          Chưa đóng
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      <div className="text-[11px] tracking-wide text-slate-500 uppercase">{label}</div>
      <div className="mt-0.5 text-sm font-semibold break-words text-slate-900">{value}</div>
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
