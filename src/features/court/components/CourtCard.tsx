import { Clock, MapPin, Navigation, Star } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/useAppStore'

import type { CourtFacility } from '../types'

interface Props {
  facility: CourtFacility
  onSelect: (id: string) => void
  showDistance?: boolean
}

export function CourtCard({ facility, onSelect, showDistance }: Props) {
  const { tenant } = useAppStore()

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl">
      {/* Image Overlay */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={facility.imageUrl}
          alt={facility.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4">
          <Badge className="border-none bg-white/90 px-3 py-1 text-xs font-bold tracking-widest text-slate-900 uppercase shadow-sm backdrop-blur-md">
            {facility.type}
          </Badge>
        </div>
        <div className="absolute top-4 right-4">
          <div className="flex items-center gap-1 rounded-full border border-amber-100 bg-white/90 px-2 py-1 text-xs font-bold text-amber-500 shadow-sm backdrop-blur-md">
            <Star className="h-3 w-3 fill-amber-500" />
            {facility.rating}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-start justify-between">
          <h3 className="text-xl font-bold tracking-tight text-slate-900 uppercase transition-colors group-hover:text-emerald-600">
            {facility.name}
          </h3>
        </div>

        <div className="mb-6 flex-1 space-y-2">
          <div className="flex items-start gap-2 text-sm text-slate-500">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <span className="line-clamp-1">{facility.address}</span>
          </div>
          <div className="flex items-center gap-4">
            {showDistance && (
              <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">
                <Navigation className="h-3 w-3" />
                Cách đây {facility.distance.toFixed(1)}km
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Clock className="h-3 w-3" />
              Mở đến 23:00
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Giá chỉ từ
            </span>
            <span className="text-lg font-black text-slate-900">
              100.000đ<span className="text-xs font-normal text-slate-500">/giờ</span>
            </span>
          </div>
          <Button
            className="rounded-2xl px-6 font-bold shadow-lg transition-all hover:scale-105"
            style={{ backgroundColor: tenant.primaryColor }}
            onClick={() => onSelect(facility.id)}
          >
            Đặt sân ngay
          </Button>
        </div>
      </div>
    </div>
  )
}
