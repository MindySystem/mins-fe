import { Trash2, User } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

import type { Booking } from '../types'

interface Props {
  booking: Booking
  pixelsPerHour: number
  startHourOfDay: number
  onDelete?: (id: string) => void
  compact?: boolean
}

function timeToPixels(timeStr: string, pixelsPerHour: number, startHourOfDay: number): number {
  const [hours, minutes] = timeStr.split(':').map(Number)
  const totalHours = hours + minutes / 60
  return (totalHours - startHourOfDay) * pixelsPerHour
}

export function BookingEvent({ booking, pixelsPerHour, startHourOfDay, onDelete, compact }: Props) {
  const left = timeToPixels(booking.startTime, pixelsPerHour, startHourOfDay)
  const endLeft = timeToPixels(booking.endTime, pixelsPerHour, startHourOfDay)
  const width = endLeft - left

  // Theme colors based on status
  const bgColor = {
    pending: 'bg-amber-100 border-amber-300 text-amber-800',
    confirmed: 'bg-blue-100 border-blue-300 text-blue-800',
    playing: 'bg-emerald-100 border-emerald-300 text-emerald-800',
    completed: 'bg-slate-100 border-slate-300 text-slate-800',
    cancelled: 'bg-red-100 border-red-200 text-red-500 opacity-60 line-through',
  }[booking.status]

  return (
    <div
      className={twMerge(
        'group absolute top-1.5 bottom-1.5 cursor-pointer overflow-hidden rounded-lg border px-1.5 py-1 shadow-sm transition-all hover:z-10 hover:shadow-md sm:px-2',
        bgColor
      )}
      style={{ left: `${left}px`, width: `${width}px` }}
    >
      <div className="flex items-center gap-1 truncate text-xs font-semibold sm:gap-1.5 sm:text-sm">
        <User className="h-3 w-3 flex-shrink-0 opacity-70 sm:h-3.5 sm:w-3.5" />
        <span className="truncate">{booking.customer.name}</span>
      </div>
      <div className="mt-0.5 flex items-center justify-between text-[10px] font-medium opacity-75 sm:text-[11px]">
        <span className="truncate">
          {compact ? booking.startTime : `${booking.startTime} - ${booking.endTime}`}
        </span>
        {booking.paymentStatus === 'unpaid' && (
          <span className="ml-1 rounded bg-red-500 px-1 text-[9px] font-bold text-white sm:text-[10px]">
            NỢ
          </span>
        )}
      </div>
      
      {/* Tooltip on hover */}
      <div className="absolute bottom-full left-0 z-50 mb-1 hidden w-48 rounded-lg border border-slate-700 bg-slate-900 p-2 text-xs text-white shadow-xl group-hover:block">
        <div className="font-bold mb-1">{booking.customer.name}</div>
        <div className="text-slate-300 mb-0.5">SĐT: {booking.customer.phone}</div>
        <div className="text-slate-300 mb-1">Giờ: {booking.startTime} - {booking.endTime}</div>
        <div className="flex justify-between items-center pt-2 border-t border-slate-700 mt-1">
          <span className="font-bold text-emerald-400">{booking.totalPrice.toLocaleString('vi-VN')} đ</span>
          {onDelete && (
            <button 
              onClick={(e) => {
                e.stopPropagation()
                onDelete(booking.id)
              }}
              className="flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors font-bold px-2 py-1 rounded bg-red-500/10"
            >
              <Trash2 className="w-3 h-3" />
              Hủy
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
