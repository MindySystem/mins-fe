import { useState } from 'react'
import { Loader2, MapPin, Search, SlidersHorizontal } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import type { CourtFacility } from '../types'

import { CourtCard } from './CourtCard'

interface Props {
  facilities: CourtFacility[]
  onSelectFacility: (id: string) => void
  loading?: boolean
}

export function CourtDiscovery({
  facilities,
  onSelectFacility,
  loading,
}: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const [maxDistance, setMaxDistance] = useState<number | 'all'>('all')

  const filteredFacilities = facilities.filter((facility) => {
    const matchesSearch =
      facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      facility.address.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDistance =
      maxDistance === 'all' || facility.distance <= (maxDistance as number)
    return matchesSearch && matchesDistance
  })

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Search and Filters */}
      <div className="flex flex-col items-center gap-4 rounded-[2rem] border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/50 md:flex-row">
        <div className="relative w-full flex-1">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Tìm theo tên sân hoặc khu vực (Cầu Giấy, Tây Hồ...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-2xl border-transparent bg-slate-50 pl-12 h-12 text-base transition-all focus:border-emerald-500 focus:bg-white"
          />
        </div>

        <div className="scrollbar-hide flex w-full items-center gap-2 overflow-x-auto pb-1 md:w-auto md:pb-0">
          <div className="flex items-center gap-1.5 whitespace-nowrap px-3 text-sm font-bold text-slate-500">
            <MapPin className="h-4 w-4" /> Bán kính:
          </div>
          {[2, 5, 10, 'all'].map((dist) => (
            <Button
              key={dist.toString()}
              variant={maxDistance === dist ? 'default' : 'outline'}
              className="h-10 whitespace-nowrap rounded-xl px-4 font-bold transition-all"
              onClick={() => setMaxDistance(dist as number | 'all')}
            >
              {dist === 'all' ? 'Tất cả' : `< ${dist}km`}
            </Button>
          ))}
          <Button variant="ghost" size="icon" className="shrink-0 rounded-xl">
            <SlidersHorizontal className="h-5 w-5 text-slate-400" />
          </Button>
        </div>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-500" />
          <p className="font-medium animate-pulse text-slate-400">
            Đang định vị các sân gần bạn...
          </p>
        </div>
      ) : filteredFacilities.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredFacilities.map((facility) => (
            <CourtCard
              key={facility.id}
              facility={facility}
              onSelect={onSelectFacility}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[2rem] border-2 border-dashed border-slate-200 bg-white py-20 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50">
            <Search className="h-10 w-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">
            Không tìm thấy sân phù hợp
          </h3>
          <p className="mx-auto mt-2 max-w-xs text-slate-500">
            Thử tìm kiếm với từ khóa khác hoặc mở rộng bán kính tìm kiếm của
            bạn.
          </p>
        </div>
      )}
    </div>
  )
}
