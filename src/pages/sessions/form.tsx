import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Upload, Image as ImageIcon, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { sessionService } from '@/features/sessions/services/session.service'
import type { BadmintonSession, SessionFormData, SessionStatus } from '@/features/sessions/types'
import { todayIso } from '@/features/sessions/utils/format'
import { shuttlecockService, type Shuttlecock } from '@/services/shuttlecock.service'

interface FormState {
  title: string
  date: string
  startTime: string
  endTime: string
  location: string
  fixedCourtFee: string
  fixedFeeMale: string
  fixedFeeFemale: string
  shuttlecockId: string
  shuttlecocksUsed: string
  maxParticipants: string
  status: SessionStatus
  description: string
}

function makeInitial(existing: BadmintonSession | null): FormState {
  if (existing) {
    return {
      title: existing.title,
      date: existing.date,
      startTime: existing.startTime,
      endTime: existing.endTime,
      location: existing.location,
      fixedCourtFee: String(existing.fixedCourtFee ?? 0),
      fixedFeeMale: String(existing.fixedFeeMale ?? 0),
      fixedFeeFemale: String(existing.fixedFeeFemale ?? 0),
      shuttlecockId: existing.shuttlecockId ? String(existing.shuttlecockId) : 'null',
      shuttlecocksUsed: String(existing.shuttlecocksUsed ?? 0),
      maxParticipants: String(existing.maxParticipants),
      status: existing.status,
      description: existing.description ?? '',
    }
  }
  return {
    title: '',
    date: todayIso(),
    startTime: '19:00',
    endTime: '21:00',
    location: '',
    fixedCourtFee: '0',
    fixedFeeMale: '0',
    fixedFeeFemale: '0',
    shuttlecockId: 'null',
    shuttlecocksUsed: '0',
    maxParticipants: '8',
    status: 'open',
    description: '',
  }
}

export default function SessionFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [existing, setExisting] = useState<BadmintonSession | null>(null)
  const [loading, setLoading] = useState(isEdit)
  const [shuttlecocks, setShuttlecocks] = useState<Shuttlecock[]>([])
  const [form, setForm] = useState<FormState>(() => makeInitial(null))
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // QR upload state
  const [qrFile, setQrFile] = useState<File | null>(null)
  const [qrPreview, setQrPreview] = useState<string | null>(null)

  useEffect(() => {
    // Load shuttlecocks
    shuttlecockService
      .getAll()
      .then((res) => setShuttlecocks(res.data))
      .catch((e) => console.error('Lỗi tải danh sách cầu lông', e))

    if (!id) return
    let alive = true
    sessionService
      .get(id)
      .then((s) => {
        if (!alive) return
        setExisting(s)
        setForm(makeInitial(s))
        if (s.qrCodeUrl) {
          setQrPreview(s.qrCodeUrl)
        }
      })
      .catch((e) => {
        if (alive) setSubmitError(e instanceof Error ? e.message : 'Không tải được buổi')
      })
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [id])

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const handleQrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setQrFile(file)
      setQrPreview(URL.createObjectURL(file))
    }
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {}
    if (!form.title.trim()) next.title = 'Vui lòng nhập tiêu đề'
    if (!form.date) next.date = 'Vui lòng chọn ngày'
    if (!form.startTime) next.startTime = 'Vui lòng chọn giờ bắt đầu'
    if (!form.endTime) next.endTime = 'Vui lòng chọn giờ kết thúc'
    if (form.startTime && form.endTime && form.endTime <= form.startTime) {
      next.endTime = 'Giờ kết thúc phải sau giờ bắt đầu'
    }
    if (!form.location.trim()) next.location = 'Vui lòng nhập địa điểm'

    const fixedCourt = Number(form.fixedCourtFee)
    if (form.fixedCourtFee === '' || Number.isNaN(fixedCourt) || fixedCourt < 0) {
      next.fixedCourtFee = 'Chi phí sân không hợp lệ'
    }

    const maleFee = Number(form.fixedFeeMale)
    if (form.fixedFeeMale === '' || Number.isNaN(maleFee) || maleFee < 0) {
      next.fixedFeeMale = 'Chi phí nam không hợp lệ'
    }

    const femaleFee = Number(form.fixedFeeFemale)
    if (form.fixedFeeFemale === '' || Number.isNaN(femaleFee) || femaleFee < 0) {
      next.fixedFeeFemale = 'Chi phí nữ không hợp lệ'
    }

    const sUsed = Number(form.shuttlecocksUsed)
    if (form.shuttlecocksUsed === '' || Number.isNaN(sUsed) || sUsed < 0) {
      next.shuttlecocksUsed = 'Số cầu đã dùng không hợp lệ'
    }

    const max = Number(form.maxParticipants)
    if (
      form.maxParticipants === '' ||
      Number.isNaN(max) ||
      max < 2 ||
      !Number.isInteger(max)
    ) {
      next.maxParticipants = 'Số người tối đa phải ≥ 2'
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched(true)
    setSubmitError(null)
    if (!validate()) return

    const shuttlecockId = form.shuttlecockId === 'null' ? null : Number(form.shuttlecockId)

    const payload: SessionFormData = {
      title: form.title.trim(),
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      location: form.location.trim(),
      courtFee: 0, // Legacy support
      fixedCourtFee: Number(form.fixedCourtFee),
      fixedFeeMale: Number(form.fixedFeeMale),
      fixedFeeFemale: Number(form.fixedFeeFemale),
      shuttlecockId,
      shuttlecocksUsed: Number(form.shuttlecocksUsed),
      maxParticipants: Number(form.maxParticipants),
      status: form.status,
      description: form.description.trim() || undefined,
    }

    setSubmitting(true)
    try {
      let savedSession: BadmintonSession
      if (isEdit && existing) {
        savedSession = await sessionService.update(existing.id, payload)
        toast.success('Đã cập nhật buổi thành công')
      } else {
        savedSession = await sessionService.create(payload)
        toast.success('Đã tạo buổi mới thành công')
      }

      // Upload QR Code if selected
      if (qrFile) {
        await sessionService.uploadQrCode(savedSession.id, qrFile)
        toast.success('Đã tải lên mã QR thanh toán')
      }

      navigate(`/sessions/${savedSession.id}`)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Lưu thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  async function onDelete() {
    if (!existing) return
    if (!confirm(`Xóa buổi "${existing.title}"? Hành động không thể hoàn tác.`)) return
    setSubmitting(true)
    try {
      await sessionService.remove(existing.id)
      toast.success('Đã xóa buổi thành công')
      navigate('/sessions')
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Xóa thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  const fieldCls = (key: keyof FormState) =>
    `h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-2 focus-visible:ring-slate-900/10 ${
      errors[key] && touched
        ? 'border-rose-400 focus-visible:border-rose-500 focus-visible:ring-rose-500/15'
        : 'border-slate-200 focus-visible:border-slate-900'
    }`

  if (loading) {
    return <div className="h-96 animate-pulse rounded-2xl bg-slate-50 border border-slate-200" />
  }

  // Selected shuttlecock price reference
  const selectedShuttlecock = shuttlecocks.find((s) => String(s.id) === form.shuttlecockId)

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link
        to={isEdit && existing ? `/sessions/${existing.id}` : '/sessions'}
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" /> Quay lại
      </Link>

      <form
        onSubmit={onSubmit}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="bg-slate-900 px-6 py-5 text-white">
          <h2 className="text-xl font-bold">
            {isEdit ? 'Chỉnh sửa buổi' : 'Tạo buổi mới'}
          </h2>
          <p className="text-xs text-white/70 mt-1">Cấu hình thông tin chi tiết và cơ chế phân bổ chi phí</p>
        </div>

        {submitError && (
          <div className="mx-6 mt-6 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 border border-rose-100">{submitError}</div>
        )}

        <div className="p-6 space-y-6">
          {/* Section 1: Thông tin cơ bản */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-slate-500" /> Thông tin cơ bản
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2 space-y-1">
                <Label htmlFor="title" className="text-slate-700">
                  Tiêu đề <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                  className={fieldCls('title')}
                  placeholder="VD: Đánh cầu tối thứ 7"
                />
                {errors.title && touched && (
                  <p className="mt-1 text-xs text-rose-600">{errors.title}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="date" className="text-slate-700">
                  Ngày <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={form.date}
                  onChange={(e) => set('date', e.target.value)}
                  className={fieldCls('date')}
                />
                {errors.date && touched && <p className="mt-1 text-xs text-rose-600">{errors.date}</p>}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="startTime" className="text-slate-700">
                    Bắt đầu
                  </Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={form.startTime}
                    onChange={(e) => set('startTime', e.target.value)}
                    className={fieldCls('startTime')}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="endTime" className="text-slate-700">
                    Kết thúc
                  </Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={form.endTime}
                    onChange={(e) => set('endTime', e.target.value)}
                    className={fieldCls('endTime')}
                  />
                  {errors.endTime && touched && (
                    <p className="mt-1 text-xs text-rose-600">{errors.endTime}</p>
                  )}
                </div>
              </div>

              <div className="md:col-span-2 space-y-1">
                <Label htmlFor="location" className="text-slate-700">
                  Địa điểm <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="location"
                  value={form.location}
                  onChange={(e) => set('location', e.target.value)}
                  className={fieldCls('location')}
                  placeholder="VD: Sân cầu lông Hoàng Hoa Thám, Q.Tân Bình"
                />
                {errors.location && touched && (
                  <p className="mt-1 text-xs text-rose-600">{errors.location}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="maxParticipants" className="text-slate-700">
                  Số người tối đa <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  min={2}
                  step={1}
                  value={form.maxParticipants}
                  onChange={(e) => set('maxParticipants', e.target.value)}
                  className={fieldCls('maxParticipants')}
                />
                {errors.maxParticipants && touched && (
                  <p className="mt-1 text-xs text-rose-600">{errors.maxParticipants}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="status" className="text-slate-700">
                  Trạng thái
                </Label>
                <select
                  id="status"
                  value={form.status}
                  onChange={(e) => set('status', e.target.value as SessionStatus)}
                  className={fieldCls('status')}
                >
                  <option value="open">Đang mở đăng ký</option>
                  <option value="closed">Đóng đăng ký</option>
                  <option value="finished">Đã kết thúc</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 2: Quản lý chi phí */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-slate-500" /> Quản lý chi phí cố định & cầu lông
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <Label htmlFor="fixedCourtFee" className="text-slate-700">
                  Tiền thuê sân cố định (VNĐ) <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="fixedCourtFee"
                  type="number"
                  min={0}
                  value={form.fixedCourtFee}
                  onChange={(e) => set('fixedCourtFee', e.target.value)}
                  className={fieldCls('fixedCourtFee')}
                />
                {errors.fixedCourtFee && touched && (
                  <p className="mt-1 text-xs text-rose-600">{errors.fixedCourtFee}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="fixedFeeMale" className="text-slate-700">
                  Phí cố định Nam (VNĐ) <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="fixedFeeMale"
                  type="number"
                  min={0}
                  value={form.fixedFeeMale}
                  onChange={(e) => set('fixedFeeMale', e.target.value)}
                  className={fieldCls('fixedFeeMale')}
                />
                {errors.fixedFeeMale && touched && (
                  <p className="mt-1 text-xs text-rose-600">{errors.fixedFeeMale}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="fixedFeeFemale" className="text-slate-700">
                  Phí cố định Nữ (VNĐ) <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="fixedFeeFemale"
                  type="number"
                  min={0}
                  value={form.fixedFeeFemale}
                  onChange={(e) => set('fixedFeeFemale', e.target.value)}
                  className={fieldCls('fixedFeeFemale')}
                />
                {errors.fixedFeeFemale && touched && (
                  <p className="mt-1 text-xs text-rose-600">{errors.fixedFeeFemale}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="shuttlecockId" className="text-slate-700">Loại cầu sử dụng</Label>
                <select
                  id="shuttlecockId"
                  value={form.shuttlecockId}
                  onChange={(e) => set('shuttlecockId', e.target.value)}
                  className={fieldCls('shuttlecockId')}
                >
                  <option value="null">— Chọn loại cầu lông —</option>
                  {shuttlecocks.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.brand}) — {s.currentPricePerTube.toLocaleString('vi-VN')}đ/ống
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="shuttlecocksUsed" className="text-slate-700">Số quả cầu đã dùng</Label>
                <Input
                  id="shuttlecocksUsed"
                  type="number"
                  min={0}
                  value={form.shuttlecocksUsed}
                  onChange={(e) => set('shuttlecocksUsed', e.target.value)}
                  className={fieldCls('shuttlecocksUsed')}
                />
                {errors.shuttlecocksUsed && touched && (
                  <p className="mt-1 text-xs text-rose-600">{errors.shuttlecocksUsed}</p>
                )}
              </div>
            </div>

            {selectedShuttlecock && (
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 flex items-center justify-between text-sm">
                <div className="text-slate-600">Đơn giá ước tính / quả cầu:</div>
                <div className="font-semibold text-slate-900">
                  {Math.round(selectedShuttlecock.currentPricePerTube / 12).toLocaleString('vi-VN')} VNĐ
                </div>
              </div>
            )}
          </div>

          <hr className="border-slate-100" />

          {/* Section 3: QR Code & Mô tả */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-slate-700 block">QR Code Thanh toán</Label>
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50 hover:bg-slate-100/50 transition-colors relative min-h-[160px]">
                {qrPreview ? (
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={qrPreview}
                      alt="QR Code Preview"
                      className="h-28 w-28 object-contain rounded-lg border bg-white shadow-xs"
                    />
                    <label className="text-xs text-slate-500 cursor-pointer hover:underline font-semibold flex items-center gap-1">
                      <Upload className="h-3 w-3" /> Thay đổi ảnh
                      <input type="file" accept="image/*" onChange={handleQrChange} className="hidden" />
                    </label>
                  </div>
                ) : (
                  <label className="flex flex-col items-center gap-2 cursor-pointer text-slate-400">
                    <Upload className="h-8 w-8 text-slate-300" />
                    <span className="text-xs text-slate-500 font-semibold">Tải lên ảnh QR Code thanh toán</span>
                    <span className="text-[10px] text-slate-400 font-normal">Hỗ trợ JPG, PNG (tối đa 2MB)</span>
                    <input type="file" accept="image/*" onChange={handleQrChange} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            <div className="space-y-1 flex flex-col">
              <Label htmlFor="description" className="text-slate-700">Mô tả / ghi chú</Label>
              <textarea
                id="description"
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                className="w-full flex-1 min-h-[160px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-xs focus:border-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/10"
                placeholder="Ghi chú thêm lịch đánh, nước uống cho mọi người..."
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <div>
            {isEdit && existing && (
              <Button type="button" variant="destructive" onClick={onDelete} className="bg-red-600 hover:bg-red-500 text-white">
                Xóa buổi
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(isEdit && existing ? `/sessions/${existing.id}` : '/sessions')}
              className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
            >
              Hủy
            </Button>
            <Button type="submit" disabled={submitting} className="bg-slate-900 hover:bg-slate-800 text-white">
              {submitting ? 'Đang lưu…' : isEdit ? 'Lưu thay đổi' : 'Tạo buổi'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
