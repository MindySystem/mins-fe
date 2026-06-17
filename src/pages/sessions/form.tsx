import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { sessionService } from '@/features/sessions/services/session.service'
import type { BadmintonSession, SessionFormData, SessionStatus } from '@/features/sessions/types'
import { todayIso } from '@/features/sessions/utils/format'

interface FormState {
  title: string
  date: string
  startTime: string
  endTime: string
  location: string
  courtFee: string
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
      courtFee: String(existing.courtFee),
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
    courtFee: '0',
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
  const [form, setForm] = useState<FormState>(() => makeInitial(null))
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let alive = true
    sessionService
      .get(id)
      .then((s) => {
        if (!alive) return
        setExisting(s)
        setForm(makeInitial(s))
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
    const fee = Number(form.courtFee)
    if (form.courtFee === '' || Number.isNaN(fee) || fee < 0) {
      next.courtFee = 'Phí sân không hợp lệ'
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

    const payload: SessionFormData = {
      title: form.title.trim(),
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      location: form.location.trim(),
      courtFee: Number(form.courtFee),
      maxParticipants: Number(form.maxParticipants),
      status: form.status,
      description: form.description.trim() || undefined,
    }

    setSubmitting(true)
    try {
      if (isEdit && existing) {
        await sessionService.update(existing.id, payload)
      } else {
        await sessionService.create(payload)
      }
      navigate('/sessions')
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
      navigate('/sessions')
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Xóa thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  const fieldCls = (key: keyof FormState) =>
    `h-9 w-full rounded-md border bg-white px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-3 md:text-sm ${
      errors[key] && touched
        ? 'border-rose-400 focus-visible:border-rose-500 focus-visible:ring-rose-500/30'
        : 'border-slate-300 focus-visible:border-slate-900 focus-visible:ring-slate-900/20'
    }`

  if (loading) {
    return <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto max-w-3xl space-y-6 rounded-xl border border-slate-200 bg-white p-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          {isEdit ? 'Chỉnh sửa buổi' : 'Tạo buổi mới'}
        </h2>
        <Link
          to={isEdit && existing ? `/sessions/${existing.id}` : '/sessions'}
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          ← Quay lại
        </Link>
      </div>

      {submitError && (
        <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{submitError}</div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label htmlFor="title" className="mb-1 block">
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

        <div>
          <Label htmlFor="date" className="mb-1 block">
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
          <div>
            <Label htmlFor="startTime" className="mb-1 block">
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
          <div>
            <Label htmlFor="endTime" className="mb-1 block">
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

        <div className="md:col-span-2">
          <Label htmlFor="location" className="mb-1 block">
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

        <div>
          <Label htmlFor="courtFee" className="mb-1 block">
            Phí sân (VND) <span className="text-rose-500">*</span>
          </Label>
          <Input
            id="courtFee"
            type="number"
            min={0}
            value={form.courtFee}
            onChange={(e) => set('courtFee', e.target.value)}
            className={fieldCls('courtFee')}
          />
          {errors.courtFee && touched && (
            <p className="mt-1 text-xs text-rose-600">{errors.courtFee}</p>
          )}
        </div>

        <div>
          <Label htmlFor="maxParticipants" className="mb-1 block">
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

        <div className="md:col-span-2">
          <Label htmlFor="status" className="mb-1 block">
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

        <div className="md:col-span-2">
          <Label htmlFor="description" className="mb-1 block">
            Mô tả / ghi chú
          </Label>
          <textarea
            id="description"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={3}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-xs focus:border-slate-900 focus:ring-3 focus:ring-slate-900/20 focus:outline-none"
            placeholder="Ghi chú thêm cho mọi người..."
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-slate-200 pt-4">
        <div>{isEdit && existing && <Button type="button" variant="destructive" onClick={onDelete}>Xóa buổi</Button>}</div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(isEdit && existing ? `/sessions/${existing.id}` : '/sessions')}
          >
            Hủy
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Đang lưu…' : isEdit ? 'Lưu thay đổi' : 'Tạo buổi'}
          </Button>
        </div>
      </div>
    </form>
  )
}
