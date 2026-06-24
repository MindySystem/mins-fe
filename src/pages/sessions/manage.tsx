import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Search, X, Plus, Edit2, Trash2, ArrowLeft, ShoppingBag, Sparkles } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { registrationService } from '@/features/sessions/services/registration.service'
import { sessionService } from '@/features/sessions/services/session.service'
import { userService } from '@/features/sessions/services/user.service'
import { shuttlecockService, type Shuttlecock } from '@/services/shuttlecock.service'
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
  const [extraCosts, setExtraCosts] = useState<any[]>([])
  const [shuttlecocks, setShuttlecocks] = useState<Shuttlecock[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  // Extra cost modals
  const [isOpenCostModal, setIsOpenCostModal] = useState(false)
  const [selectedCost, setSelectedCost] = useState<any | null>(null)
  const [costName, setCostName] = useState('')
  const [costAmount, setCostAmount] = useState(0)
  const [costNote, setCostNote] = useState('')

  // Shuttlecock count updates
  const [shuttlecockId, setShuttlecockId] = useState<string>('null')
  const [shuttlecocksUsed, setShuttlecocksUsed] = useState(0)

  // Members modal
  const [toRemove, setToRemove] = useState<Registration | null>(null)
  const [showAdd, setShowAdd] = useState(false)

  const userMap = useMemo(() => new Map(users.map((u) => [u.id, u])), [users])

  const stats = useMemo(() => {
    return {
      total: registrations.length,
      attended: registrations.filter((r) => r.attended).length,
      paidFull: registrations.filter((r) => r.adminConfirmedPaid).length,
      collected: registrations.reduce((s, r) => s + r.amountPaid, 0),
      expected: registrations.reduce((s, r) => s + r.amountDue, 0),
    }
  }, [registrations])

  async function load() {
    if (!id) return
    setLoading(true)
    try {
      const [s, r, u, ec, sc] = await Promise.all([
        sessionService.get(id),
        registrationService.listBySession(id).catch(() => []),
        userService.list().catch(() => []),
        sessionService.getExtraCosts(id).catch(() => ({ data: [] })),
        shuttlecockService.getAll().catch(() => ({ data: [] })),
      ])
      setSession(s)
      setRegistrations(r)
      setUsers(u)
      setExtraCosts(ec.data || [])
      setShuttlecocks(sc.data || [])

      // Initial shuttlecock configurations
      setShuttlecockId(s.shuttlecockId ? String(s.shuttlecockId) : 'null')
      setShuttlecocksUsed(s.shuttlecocksUsed || 0)
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
      setRegistrations((arr) => arr.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)))
      toast.success('Đã cập nhật thông tin thành viên')
      await load() // reload calculations
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Cập nhật thất bại')
    } finally {
      setBusy(false)
    }
  }

  async function handleAdminConfirmPayment(reg: Registration) {
    setBusy(true)
    setError(null)
    try {
      const res = await sessionService.adminConfirmPayment(reg.id)
      toast.success(res.message || 'Đã xác nhận thanh toán thành công')
      await load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Xác nhận thất bại')
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
      toast.success('Đã điểm danh tất cả thành viên')
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
      toast.success('Đã đóng đăng ký buổi')
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
      toast.success('Đã đánh dấu kết thúc buổi')
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
      toast.success('Đã xóa thành viên khỏi buổi')
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Xóa thất bại')
    } finally {
      setBusy(false)
    }
  }

  // Handle shuttlecock update
  const handleSaveShuttlecocks = async () => {
    setBusy(true)
    try {
      const sId = shuttlecockId === 'null' ? null : Number(shuttlecockId)
      await sessionService.update(session.id, {
        shuttlecockId: sId,
        shuttlecocksUsed: shuttlecocksUsed,
      })
      toast.success('Đã cập nhật số lượng cầu lông sử dụng!')
      await load()
    } catch (e) {
      toast.error('Không thể cập nhật thông tin cầu lông')
    } finally {
      setBusy(false)
    }
  }

  // Handle Extra Costs CRUD
  const handleOpenAddCost = () => {
    setSelectedCost(null)
    setCostName('')
    setCostAmount(0)
    setCostNote('')
    setIsOpenCostModal(true)
  }

  const handleOpenEditCost = (cost: any) => {
    setSelectedCost(cost)
    setCostName(cost.name)
    setCostAmount(cost.amount)
    setCostNote(cost.note || '')
    setIsOpenCostModal(true)
  }

  const handleSaveCost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!costName.trim()) return toast.error('Vui lòng nhập tên chi phí')
    if (costAmount <= 0) return toast.error('Số tiền phải lớn hơn 0')

    setBusy(true)
    try {
      if (selectedCost) {
        // Edit
        await sessionService.updateExtraCost(selectedCost.id, {
          name: costName,
          amount: costAmount,
          note: costNote || undefined,
        })
        toast.success('Đã cập nhật chi phí phát sinh')
      } else {
        // Add
        await sessionService.addExtraCost(session.id, {
          name: costName,
          amount: costAmount,
          note: costNote || undefined,
        })
        toast.success('Đã thêm chi phí phát sinh')
      }
      setIsOpenCostModal(false)
      await load()
    } catch (e) {
      toast.error('Không thể lưu chi phí')
    } finally {
      setBusy(false)
    }
  }

  const handleDeleteCost = async (costId: number) => {
    if (!confirm('Bạn có chắc muốn xóa chi phí phát sinh này?')) return
    setBusy(true)
    try {
      await sessionService.deleteExtraCost(costId)
      toast.success('Đã xóa chi phí phát sinh')
      await load()
    } catch (e) {
      toast.error('Xóa thất bại')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to={`/sessions/${session.id}`}
          className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" /> Về chi tiết buổi
        </Link>
        <div className="flex gap-2">
          {session.status === 'open' && (
            <Button variant="outline" size="sm" onClick={closeSession} disabled={busy} className="border-slate-200">
              Đóng đăng ký
            </Button>
          )}
          {session.status !== 'finished' && session.status !== 'cancelled' && (
            <Button variant="outline" size="sm" onClick={finishSession} disabled={busy} className="border-slate-200">
              Đánh dấu kết thúc
            </Button>
          )}
          <Link
            to={`/sessions/${session.id}/edit`}
            className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Sửa thông tin
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900">{session.title}</h2>
        <p className="text-sm text-slate-500">
          {formatSessionDateTime(session.date, session.startTime, session.endTime)} ·{' '}
          {session.location}
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Mini label="Thành viên" value={`${stats.total}/${session.maxParticipants}`} />
          <Mini label="Đã điểm danh" value={`${stats.attended}/${stats.total}`} />
          <Mini label="Đã đóng đủ" value={`${stats.paidFull}/${stats.total}`} />
          <Mini
            label="Thu / Dự kiến"
            value={`${formatVND(stats.collected)} / ${formatVND(stats.expected)}`}
          />
        </div>
      </div>

      {/* Grid: 1. Cầu lông & phát sinh, 2. Thành viên */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cột 1: Cấu hình nhanh số lượng cầu & Chi phí phát sinh */}
        <div className="space-y-6 lg:col-span-1">
          {/* Cầu lông */}
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-slate-400" /> Cập nhật sử dụng cầu
              </CardTitle>
              <CardDescription className="text-xs">
                Nhập số cầu đã dùng để hệ thống phân bổ tiền cầu tức thì.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="sc-select" className="text-xs font-semibold text-slate-700">Loại cầu sử dụng</Label>
                <select
                  id="sc-select"
                  value={shuttlecockId}
                  onChange={(e) => setShuttlecockId(e.target.value)}
                  className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-slate-900/10"
                >
                  <option value="null">— Chọn loại cầu —</option>
                  {shuttlecocks.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.brand}) — {s.currentPricePerTube.toLocaleString('vi-VN')}đ
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="sc-used" className="text-xs font-semibold text-slate-700">Số quả cầu đã dùng</Label>
                <Input
                  id="sc-used"
                  type="number"
                  min={0}
                  value={shuttlecocksUsed}
                  onChange={(e) => setShuttlecocksUsed(Number(e.target.value))}
                  className="h-9 border-slate-200"
                />
              </div>
              <Button onClick={handleSaveShuttlecocks} disabled={busy} className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs h-9">
                Cập nhật tiền cầu
              </Button>
            </CardContent>
          </Card>

          {/* Phát sinh */}
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <ShoppingBag className="h-4 w-4 text-slate-400" /> Chi phí phát sinh
                </CardTitle>
                <CardDescription className="text-xs">
                  Nước uống, khăn lạnh, thuê thêm sân...
                </CardDescription>
              </div>
              <Button onClick={handleOpenAddCost} variant="outline" size="sm" className="h-8 w-8 p-0 border-slate-200">
                <Plus className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {extraCosts.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">Chưa có chi phí phát sinh nào.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {extraCosts.map((ec) => (
                    <div key={ec.id} className="py-2.5 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 truncate">{ec.name}</div>
                        {ec.note && <div className="text-[10px] text-slate-400 truncate">{ec.note}</div>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold text-slate-900">{formatVND(ec.amount)}</span>
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditCost(ec)}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-50"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCost(ec.id)}
                            className="p-1 text-red-400 hover:text-red-600 rounded hover:bg-slate-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Cột 2: Thành viên & Điểm danh / Duyệt tiền */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" onClick={markAllAttended} disabled={busy} className="border-slate-200 bg-white">
              Điểm danh tất cả
            </Button>
            <Button size="sm" onClick={() => setShowAdd(true)} className="ml-auto bg-slate-900 hover:bg-slate-800 text-white gap-1">
              <Plus className="h-3.5 w-3.5" /> Thêm thành viên
            </Button>
          </div>

          {error && (
            <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 border border-rose-100">{error}</div>
          )}

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-bold tracking-wider text-slate-500 uppercase">
                  <tr>
                    <th className="px-4 py-3">Thành viên</th>
                    <th className="px-4 py-3 text-center">ĐD</th>
                    <th className="px-4 py-3 text-right">Phải đóng</th>
                    <th className="px-4 py-3 text-right">Đã đóng</th>
                    <th className="px-4 py-3 text-center">Thanh toán</th>
                    <th className="px-4 py-3 text-center">Hành động</th>
                    <th className="px-4 py-3 text-right" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {registrations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                        Chưa có thành viên nào.
                      </td>
                    </tr>
                  ) : (
                    registrations.map((r) => {
                      const u = userMap.get(r.userId)
                      const fullName = u?.name ?? '(đã xóa)'
                      const genderText = u?.gender === 'female' ? 'Nữ' : u?.gender === 'male' ? 'Nam' : 'Khác'

                      return (
                        <tr key={r.id} className="hover:bg-slate-50/40">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-900">{fullName}</div>
                            <div className="text-[10px] text-slate-400">
                              {genderText} · {u?.phone ?? u?.email ?? '—'}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={r.attended}
                              disabled={busy}
                              onChange={(e) => updateReg(r, { attended: e.target.checked })}
                              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                            />
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-slate-950">
                            {formatVND(r.amountDue)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <NumberInput
                              value={r.amountPaid}
                              disabled={busy}
                              onChange={(v) => updateReg(r, { amountPaid: v })}
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            {r.adminConfirmedPaid ? (
                              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 uppercase">
                                Đã duyệt
                              </span>
                            ) : r.userConfirmedPaid ? (
                              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 uppercase animate-pulse">
                                Chờ duyệt
                              </span>
                            ) : (
                              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-500 uppercase">
                                Chưa đóng
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {!r.adminConfirmedPaid && (
                              <Button
                                size="xs"
                                variant={r.userConfirmedPaid ? 'default' : 'outline'}
                                onClick={() => handleAdminConfirmPayment(r)}
                                disabled={busy}
                                className={cn(
                                  "text-[10px] h-7 px-2 font-bold uppercase",
                                  r.userConfirmedPaid 
                                    ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs" 
                                    : "border-slate-200 text-slate-700 bg-white"
                                )}
                              >
                                Duyệt nhận
                              </Button>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => setToRemove(r)}
                              disabled={busy}
                              className="text-xs font-semibold text-rose-600 hover:text-rose-700 p-1 hover:bg-rose-50 rounded"
                            >
                              Xóa
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Add/Edit Extra Cost */}
      <Dialog open={isOpenCostModal} onOpenChange={setIsOpenCostModal}>
        <DialogContent className="max-w-md bg-white border border-slate-200">
          <form onSubmit={handleSaveCost}>
            <DialogHeader>
              <DialogTitle className="text-slate-900 font-bold text-lg">
                {selectedCost ? 'Sửa chi phí phát sinh' : 'Thêm chi phí phát sinh'}
              </DialogTitle>
              <DialogDescription className="text-slate-500 text-sm">
                Chi phí này sẽ được tự động chia đều cho tất cả thành viên trong buổi.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <Label htmlFor="cost-name" className="text-slate-700">Tên chi phí <span className="text-red-500">*</span></Label>
                <Input
                  id="cost-name"
                  value={costName}
                  onChange={(e) => setCostName(e.target.value)}
                  placeholder="Ví dụ: Nước suối 2 thùng, Khăn lạnh..."
                  required
                  className="border-slate-200 text-slate-900"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cost-amount" className="text-slate-700">Số tiền (VNĐ) <span className="text-red-500">*</span></Label>
                <Input
                  id="cost-amount"
                  type="number"
                  value={costAmount || ''}
                  onChange={(e) => setCostAmount(Number(e.target.value))}
                  placeholder="50000"
                  required
                  min={1}
                  className="border-slate-200 text-slate-900"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cost-note" className="text-slate-700">Ghi chú thêm</Label>
                <Input
                  id="cost-note"
                  value={costNote}
                  onChange={(e) => setCostNote(e.target.value)}
                  placeholder="Ghi chú người mua, chi tiết mặt hàng..."
                  className="border-slate-200 text-slate-900"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsOpenCostModal(false)} className="text-slate-700">
                Hủy
              </Button>
              <Button type="submit" disabled={busy} className="bg-slate-900 hover:bg-slate-800 text-white">
                {selectedCost ? 'Lưu thay đổi' : 'Thêm mới'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Confirm Delete member */}
      <Dialog open={!!toRemove} onOpenChange={(o) => !o && setToRemove(null)}>
        <DialogContent className="bg-white border">
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-bold">Xóa thành viên</DialogTitle>
            <DialogDescription className="text-slate-500 text-sm">
              Xóa{' '}
              <span className="font-semibold text-slate-900 text-base">
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
              className="border-slate-200 text-slate-700 bg-white"
            >
              Hủy
            </Button>
            <Button variant="destructive" onClick={confirmRemove} disabled={busy} className="bg-red-650 hover:bg-red-500 text-white">
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add member modal */}
      {showAdd && (
        <AddMemberModal
          sessionId={session.id}
          existingUserIds={new Set(registrations.map((r) => r.userId))}
          onClose={() => setShowAdd(false)}
          onAdded={async () => {
            setShowAdd(false)
            toast.success('Đã thêm thành viên vào sân')
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
      className="w-24 rounded border border-slate-200 bg-white px-2 py-1 text-right text-sm focus:border-slate-900 focus:outline-none disabled:opacity-50 text-slate-900"
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
      <DialogContent className="sm:max-w-lg bg-white border border-slate-250">
        <DialogHeader>
          <DialogTitle className="text-slate-900 font-bold">Thêm thành viên vào buổi</DialogTitle>
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
              className="h-10 pl-9 border-slate-200 text-slate-900 focus-visible:ring-slate-950"
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
            <div className="rounded bg-rose-50 px-2 py-1 text-xs text-rose-700 border border-rose-100">{error}</div>
          )}
          <div className="max-h-72 space-y-1 overflow-y-auto pr-1">
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
                  className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm hover:border-slate-350 hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <div className="font-semibold text-slate-900">{u.name}</div>
                    <div className="text-xs text-slate-500">
                      {u.email}
                      {u.phone ? ` · ${u.phone}` : ''}
                    </div>
                  </div>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
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
          <Button variant="outline" onClick={onClose} className="border-slate-200 text-slate-700 bg-white">
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
