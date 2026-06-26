import { useEffect, useMemo, useState } from 'react'
import { ArrowUpDown, Loader2, LocateFixed, Search } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import type { CourtFacility } from '../types'
import { calculateDistance, geocodeAddress, getFacilityCoords } from '../utils/location'

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
        const coords = getFacilityCoords(facility) || (await geocodeAddress(facility.address))
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
    if (!('geolocation' in navigator)) {
      toast.error('Trình duyệt hiện không hỗ trợ định vị.')
      return
    }

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
        toast.error(
          error.code === error.PERMISSION_DENIED
            ? 'Bạn cần cho phép quyền truy cập vị trí để đo khoảng cách.'
            : 'Không thể lấy vị trí hiện tại. Vui lòng thử lại.',
        )
      },
      { enableHighAccuracy: true, maximumAge: 60_000, timeout: 12_000 },
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
    const hasMeasuredDistance = !userCoords || facilityCoords[facility.id]
    const matchesDistance =
      maxDistance === 'all' ||
      (hasMeasuredDistance && facility.distance <= (maxDistance as number))
    return matchesSearch && matchesDistance
  })

  return (
    <div className="animate-in fade-in space-y-5 duration-500 sm:space-y-8">
      {/* Search and Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-lg shadow-slate-200/40 sm:gap-4 sm:p-5 md:flex-row md:items-center">
        <div className="relative w-full flex-1">
          <Search className="absolute top-3 left-3.5 h-4.5 w-4.5 text-slate-400 sm:top-3.5 sm:left-4 sm:h-5 sm:w-5" />
          <Input
            placeholder="Tìm tên sân hoặc khu vực..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 rounded-xl border-transparent bg-slate-50 pl-10 text-sm transition-all focus:border-emerald-500 focus:bg-white sm:h-12 sm:rounded-2xl sm:pl-12 sm:text-base"
          />
        </div>

        <div className="scrollbar-hide flex w-full items-center gap-2 overflow-x-auto pb-1 md:w-auto md:pb-0">
          <Button
            variant={userCoords ? 'default' : 'outline'}
            className={cn(
              'h-10 shrink-0 rounded-xl px-3 text-sm font-bold whitespace-nowrap transition-all sm:px-4',
              userCoords
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'border-emerald-100 text-emerald-600 hover:bg-emerald-50',
            )}
            onClick={handleGetLocation}
            disabled={findingLocation}
          >
            {findingLocation ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin sm:mr-2" />
            ) : (
              <LocateFixed className="mr-1.5 h-4 w-4 sm:mr-2" />
            )}
            Gần đây
          </Button>

          <div className="mx-1 h-6 w-px shrink-0 bg-slate-100 sm:mx-2" />

          <div className="flex shrink-0 items-center gap-1.5 px-1 text-sm font-bold whitespace-nowrap text-slate-500">
            Bán kính:
          </div>
          {[2, 5, 10, 'all'].map((dist) => (
            <Button
              key={dist.toString()}
              variant={maxDistance === dist ? 'default' : 'outline'}
              className="h-10 shrink-0 rounded-xl px-3 text-sm font-bold whitespace-nowrap transition-all sm:px-4"
              onClick={() => setMaxDistance(dist as number | 'all')}
            >
              {dist === 'all' ? 'Tất cả' : `< ${dist}km`}
            </Button>
          ))}

          <div className="mx-1 h-6 w-px shrink-0 bg-slate-100 sm:mx-2" />

          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl px-3 text-sm font-bold whitespace-nowrap text-slate-600 transition-colors hover:bg-slate-100 sm:px-4"
            >
              <ArrowUpDown className="mr-1.5 h-4 w-4 sm:mr-2" />
              Sắp xếp
            </DropdownMenuTrigger>
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
        </div>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-4 py-16 sm:py-20">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-500 sm:h-12 sm:w-12" />
          <p className="animate-pulse text-center text-sm font-medium text-slate-400 sm:text-base">
            Đang định vị các sân gần bạn...
          </p>
        </div>
      ) : filteredFacilities.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredFacilities.map((facility) => (
            <CourtCard
              key={facility.id}
              facility={facility}
              onSelect={onSelectFacility}
              showDistance={!!userCoords}
              userCoords={userCoords}
              hasMeasuredDistance={!userCoords || !!facilityCoords[facility.id]}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white px-5 py-16 text-center sm:py-20">
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
