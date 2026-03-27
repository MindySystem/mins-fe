import { useEffect, useMemo, useState } from 'react'
import { ArrowUpDown, Loader2, LocateFixed, Search, SlidersHorizontal } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import type { CourtFacility } from '../types'
import { calculateDistance, geocodeAddress } from '../utils/location'

import { CourtCard } from './CourtCard'

interface Props {
  facilities: CourtFacility[]
  onSelectFacility: (id: string) => void
  loading?: boolean
}

export function CourtDiscovery({ facilities, onSelectFacility, loading }: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const [maxDistance, setMaxDistance] = useState<number | 'all'>('all')
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'name'>('name')
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [findingLocation, setFindingLocation] = useState(false)
  const [facilityCoords, setFacilityCoords] = useState<
    Record<string, { lat: number; lng: number }>
  >({})

  // Geocode all facilities on mount or when they change
  useEffect(() => {
    async function geocodeAll() {
      const coordsMap: Record<string, { lat: number; lng: number }> = {}
      for (const facility of facilities) {
        const coords = await geocodeAddress(facility.address)
        if (coords) {
          coordsMap[facility.id] = coords
        }
      }
      setFacilityCoords(coordsMap)
    }
    if (facilities.length > 0) {
      geocodeAll()
    }
  }, [facilities])

  const handleGetLocation = () => {
    setFindingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setSortBy('distance') // Automatically sort by distance when location is found
        setFindingLocation(false)
        toast.success('Đã xác định vị trí của bạn!')
      },
      (error) => {
        console.error('Geolocation error:', error)
        setFindingLocation(false)
        toast.error('Không thể lấy vị trí. Vui lòng cho phép quyền truy cập vị trí.')
      },
    )
  }

  const processedFacilities = useMemo(() => {
    const result = facilities.map((f) => {
      const coords = facilityCoords[f.id]
      if (userCoords && coords) {
        return {
          ...f,
          distance: calculateDistance(userCoords.lat, userCoords.lng, coords.lat, coords.lng),
        }
      }
      return f
    })

    // Apply sorting
    if (sortBy === 'distance' && userCoords) {
      result.sort((a, b) => a.distance - b.distance)
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating)
    } else {
      result.sort((a, b) => a.name.localeCompare(b.name))
    }

    return result
  }, [facilities, userCoords, facilityCoords, sortBy])

  const filteredFacilities = processedFacilities.filter((facility) => {
    const matchesSearch =
      facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      facility.address.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDistance = maxDistance === 'all' || facility.distance <= (maxDistance as number)
    return matchesSearch && matchesDistance
  })

  return (
    <div className="animate-in fade-in space-y-8 duration-500">
      {/* Search and Filters */}
      <div className="flex flex-col items-center gap-4 rounded-[2rem] border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/50 md:flex-row">
        <div className="relative w-full flex-1">
          <Search className="absolute top-3.5 left-4 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Tìm theo tên sân hoặc khu vực (Cầu Giấy, Tây Hồ...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 rounded-2xl border-transparent bg-slate-50 pl-12 text-base transition-all focus:border-emerald-500 focus:bg-white"
          />
        </div>

        <div className="scrollbar-hide flex w-full items-center gap-2 overflow-x-auto pb-1 md:w-auto md:pb-0">
          <Button
            variant={userCoords ? 'default' : 'outline'}
            className={cn(
              'h-10 rounded-xl px-4 font-bold whitespace-nowrap transition-all',
              userCoords
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'border-emerald-100 text-emerald-600 hover:bg-emerald-50',
            )}
            onClick={handleGetLocation}
            disabled={findingLocation}
          >
            {findingLocation ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LocateFixed className="mr-2 h-4 w-4" />
            )}
            Gần đây
          </Button>

          <div className="mx-2 h-6 w-px bg-slate-100" />

          <div className="flex items-center gap-1.5 px-1 text-sm font-bold whitespace-nowrap text-slate-500">
            Bán kính:
          </div>
          {[2, 5, 10, 'all'].map((dist) => (
            <Button
              key={dist.toString()}
              variant={maxDistance === dist ? 'default' : 'outline'}
              className="h-10 rounded-xl px-4 font-bold whitespace-nowrap transition-all"
              onClick={() => setMaxDistance(dist as number | 'all')}
            >
              {dist === 'all' ? 'Tất cả' : `< ${dist}km`}
            </Button>
          ))}

          <div className="mx-2 h-6 w-px bg-slate-100" />

          <DropdownMenu>
            <Button variant="ghost" className="h-10 rounded-xl px-4 font-bold text-slate-600">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Sắp xếp
            </Button>
            {/* <DropdownMenuTrigger>
            </DropdownMenuTrigger> */}
            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl">
              <DropdownMenuLabel className="px-3 py-2 text-xs font-bold tracking-wider text-slate-400 uppercase">
                Sắp xếp theo
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-50" />
              <DropdownMenuRadioGroup
                value={sortBy}
                onValueChange={(v) => setSortBy(v as 'distance' | 'rating' | 'name')}
              >
                <DropdownMenuRadioItem value="name" className="rounded-xl px-3 py-2 font-medium">
                  Mặc định
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="rating" className="rounded-xl px-3 py-2 font-medium">
                  Đánh giá cao nhất
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="distance"
                  disabled={!userCoords}
                  className="rounded-xl px-3 py-2 font-medium"
                >
                  Gần bạn nhất
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" className="shrink-0 rounded-xl">
            <SlidersHorizontal className="h-5 w-5 text-slate-400" />
          </Button>
        </div>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-500" />
          <p className="animate-pulse font-medium text-slate-400">
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
              showDistance={!!userCoords}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[2rem] border-2 border-dashed border-slate-200 bg-white py-20 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50">
            <Search className="h-10 w-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Không tìm thấy sân phù hợp</h3>
          <p className="mx-auto mt-2 max-w-xs text-slate-500">
            Thử tìm kiếm với từ khóa khác hoặc mở rộng bán kính tìm kiếm của bạn.
          </p>
        </div>
      )}
    </div>
  )
}
