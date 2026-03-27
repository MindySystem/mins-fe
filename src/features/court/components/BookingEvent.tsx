import { Trash2, User } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

import type { Booking } from '../types'

interface Props {
  booking: Booking
  pixelsPerHour: number
  startHourOfDay: number
  onDelete?: (id: string) => void
}

function timeToPixels(timeStr: string, pixelsPerHour: number, startHourOfDay: number): number {
  const [hours, minutes] = timeStr.split(':').map(Number)
  const totalHours = hours + minutes / 60
  return (totalHours - startHourOfDay) * pixelsPerHour
}

export function BookingEvent({ booking, pixelsPerHour, startHourOfDay, onDelete }: Props) {
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
        'absolute top-1.5 bottom-1.5 rounded-lg border shadow-sm px-2 py-1 overflow-hidden transition-all hover:z-10 hover:shadow-md cursor-pointer group',
        bgColor
      )}
      style={{ left: `${left}px`, width: `${width}px` }}
    >
      <div className="flex items-center gap-1.5 truncate font-semibold text-sm">
        <User className="w-3.5 h-3.5 opacity-70 flex-shrink-0" />
        <span className="truncate">{booking.customer.name}</span>
      </div>
      <div className="text-[11px] opacity-75 mt-0.5 font-medium flex justify-between items-center">
        <span>{booking.startTime} - {booking.endTime}</span>
        {booking.paymentStatus === 'unpaid' && (
          <span className="text-[10px] bg-red-500 text-white px-1 rounded font-bold ml-1">NỢ</span>
        )}
      </div>
      
      {/* Tooltip on hover */}
      <div className="absolute hidden group-hover:block z-50 bottom-full left-0 mb-1 w-48 bg-slate-900 text-white text-xs rounded-lg p-2 shadow-xl border border-slate-700">
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
