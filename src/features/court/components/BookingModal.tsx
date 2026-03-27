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
    overrideRange 
      ? `${overrideRange.startHour.toString().padStart(2, '0')}:00` 
      : '08:00'
  )
  const [endTime, setEndTime] = useState(
    overrideRange 
      ? `${overrideRange.endHour.toString().padStart(2, '0')}:00` 
      : '09:00'
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
      <DialogContent className="sm:max-w-[425px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            🚀 Đặt lịch mới
          </DialogTitle>
          <DialogDescription>
            Tạo lượt đặt sân mới cho {selectedCourt?.name || 'sân chưa chọn'} ngày{' '}
            {format(selectedDate, 'dd/MM/yyyy')}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="customerName" className="text-right font-semibold">
              Tên khách
            </Label>
            <div className="col-span-3 relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                id="customerName"
                placeholder="Nguyễn Văn A"
                className="pl-9 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right font-semibold">
              SĐT
            </Label>
            <div className="col-span-3 relative">
              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                id="phone"
                placeholder="090..."
                className="pl-9 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label className="font-semibold px-1">Giờ bắt đầu</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="pl-9 rounded-xl"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="font-semibold px-1">Giờ kết thúc</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="pl-9 rounded-xl"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Đơn giá:</span>
              <span className="font-bold">
                {selectedCourt?.pricePerHour.toLocaleString()} đ/h
              </span>
            </div>
            <div
              className="flex justify-between text-lg font-extrabold"
              style={{ color: tenant.primaryColor }}
            >
              <span>Tổng cộng (tạm tính):</span>
              <span>
                {((selectedCourt?.pricePerHour || 0) * duration).toLocaleString()} đ
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="rounded-xl">
            Hủy
          </Button>
          <Button
            className="rounded-xl px-8 shadow-lg transition-transform hover:scale-105 active:scale-95"
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
