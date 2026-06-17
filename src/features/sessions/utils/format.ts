import type { SessionStatus } from '../types'

export function formatVND(value: number): string {
  if (Number.isNaN(value) || value === null || value === undefined) return '—'
  return value.toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  })
}

export function formatDateOnly(yyyyMmDd: string): string {
  if (!yyyyMmDd) return '—'
  const [y, m, d] = yyyyMmDd.split('-').map(Number)
  if (!y || !m || !d) return yyyyMmDd
  return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`
}

export function formatSessionDateTime(date: string, startTime: string, endTime: string): string {
  return `${formatDateOnly(date)} · ${startTime}–${endTime}`
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
  open: 'Đang mở',
  closed: 'Đã đóng',
  finished: 'Đã kết thúc',
  cancelled: 'Đã hủy',
}

export const SESSION_STATUS_TONES: Record<SessionStatus, string> = {
  open: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  closed: 'bg-amber-50 text-amber-700 ring-amber-200',
  finished: 'bg-slate-100 text-slate-600 ring-slate-200',
  cancelled: 'bg-rose-50 text-rose-700 ring-rose-200',
}
