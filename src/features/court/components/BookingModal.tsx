import { useState } from 'react'
import { format } from 'date-fns'
import { Clock, Phone, User } from 'lucide-react'
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
import { useAppStore } from '@/store/useAppStore'

import type { Court } from '../types'

interface Props {
  isOpen: boolean
  onClose: () => void
  selectedCourt: Court | null
  selectedDate: Date
  overrideRange?: { startHour: number; endHour: number }
}

export function BookingModal({
  isOpen,
  onClose,
  selectedCourt,
  selectedDate,
  overrideRange,
}: Props) {
  const { tenant } = useAppStore()
  const [loading, setLoading] = useState(false)
  
  // Initialize state from props
  const [startTime, setStartTime] = useState(
    overrideRange ? `${overrideRange.startHour.toString().padStart(2, '0')}:00` : '08:00',
  )
  const [endTime, setEndTime] = useState(
    overrideRange ? `${overrideRange.endHour.toString().padStart(2, '0')}:00` : '09:00',
  )

  const handleBooking = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onClose()
      toast.success(`Đã đặt sân ${selectedCourt?.name} thành công!`, {
        description: `Ngày ${format(selectedDate, 'dd/MM/yyyy')} vào lúc ${startTime}`,
      })
    }, 1000)
  }

  // Calculate duration in hours (approximation for UI)
  const startH = parseInt(startTime.split(':')[0])
  const endH = parseInt(endTime.split(':')[0])
  const duration = Math.max(1, endH - startH)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-2xl p-4 sm:max-w-[425px] sm:rounded-3xl sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 pr-8 text-xl font-bold sm:text-2xl">
            Đặt lịch mới
          </DialogTitle>
          <DialogDescription className="text-sm leading-6">
            Tạo lượt đặt sân mới cho {selectedCourt?.name || 'sân chưa chọn'} ngày{' '}
            {format(selectedDate, 'dd/MM/yyyy')}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2 sm:gap-6 sm:py-4">
          <div className="grid gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
            <Label htmlFor="customerName" className="font-semibold sm:text-right">
              Tên khách
            </Label>
            <div className="relative sm:col-span-3">
              <User className="absolute top-3 left-3 h-4 w-4 text-slate-400" />
              <Input
                id="customerName"
                placeholder="Nguyễn Văn A"
                className="h-11 rounded-xl pl-9"
              />
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
            <Label htmlFor="phone" className="font-semibold sm:text-right">
              SĐT
            </Label>
            <div className="relative sm:col-span-3">
              <Phone className="absolute top-3 left-3 h-4 w-4 text-slate-400" />
              <Input
                id="phone"
                placeholder="090..."
                className="h-11 rounded-xl pl-9"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            <div className="flex flex-col gap-2">
              <Label className="px-1 font-semibold">Giờ bắt đầu</Label>
              <div className="relative">
                <Clock className="absolute top-3 left-3 h-4 w-4 text-slate-400" />
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="h-11 rounded-xl pl-9"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="px-1 font-semibold">Giờ kết thúc</Label>
              <div className="relative">
                <Clock className="absolute top-3 left-3 h-4 w-4 text-slate-400" />
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="h-11 rounded-xl pl-9"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Đơn giá:</span>
              <span className="font-bold">
                {selectedCourt?.pricePerHour.toLocaleString()} đ/h
              </span>
            </div>
            <div
              className="flex items-start justify-between gap-4 text-base font-extrabold sm:text-lg"
              style={{ color: tenant.primaryColor }}
            >
              <span>Tổng cộng (tạm tính):</span>
              <span>
                {((selectedCourt?.pricePerHour || 0) * duration).toLocaleString()} đ
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" onClick={onClose} className="h-11 rounded-xl">
            Hủy
          </Button>
          <Button
            className="h-11 rounded-xl px-8 shadow-lg transition-transform hover:scale-105 active:scale-95"
            style={{ backgroundColor: tenant.primaryColor }}
            onClick={handleBooking}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Xác nhận Đặt sân'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
