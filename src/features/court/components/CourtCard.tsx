import { Clock, MapPin, Navigation, Star } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/useAppStore'

import type { CourtFacility } from '../types'
import { buildDirectionsUrl } from '../utils/location'

interface Props {
  facility: CourtFacility
  onSelect: (id: string) => void
  showDistance?: boolean
  hasMeasuredDistance?: boolean
  userCoords?: { lat: number; lng: number } | null
}

export function CourtCard({ facility, onSelect, showDistance, hasMeasuredDistance, userCoords }: Props) {
  const { tenant } = useAppStore()
  const directionsUrl = buildDirectionsUrl(facility, userCoords)

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl sm:rounded-3xl">
      {/* Image Overlay */}
      <div className="relative h-40 overflow-hidden sm:h-48">
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

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-2 flex items-start justify-between">
          <h3 className="text-lg font-bold tracking-tight text-slate-900 uppercase transition-colors group-hover:text-emerald-600 sm:text-xl">
            {facility.name}
          </h3>
        </div>

        <div className="mb-4 flex-1 space-y-2 sm:mb-6">
          <div className="flex items-start gap-2 text-sm text-slate-500">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <span className="line-clamp-2 sm:line-clamp-1">{facility.address}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {showDistance && (
              <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">
                <Navigation className="h-3 w-3" />
                {hasMeasuredDistance ? `Cách ${facility.distance.toFixed(1)}km` : 'Chưa có tọa độ'}
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Clock className="h-3 w-3" />
              Mở đến 23:00
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Giá chỉ từ
            </span>
            <span className="text-lg font-black text-slate-900">
              100.000đ<span className="text-xs font-normal text-slate-500">/giờ</span>
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            <Button
              variant="outline"
              className="rounded-xl px-3 font-bold text-slate-700 sm:rounded-2xl sm:px-4"
              onClick={() => window.open(directionsUrl, '_blank', 'noopener,noreferrer')}
            >
              <Navigation className="mr-1.5 h-4 w-4" />
              Chỉ đường
            </Button>
            <Button
              className="rounded-xl px-3 font-bold shadow-lg transition-all hover:scale-105 sm:rounded-2xl sm:px-6"
              style={{ backgroundColor: tenant.primaryColor }}
              onClick={() => onSelect(facility.id)}
            >
              Đặt sân
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
