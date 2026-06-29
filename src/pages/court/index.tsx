import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { CourtDiscovery } from '@/features/court/components/CourtDiscovery'
import { CourtTimeline } from '@/features/court/components/CourtTimeline'
import { courtService } from '@/features/court/services/court.service'
import type { CourtFacility } from '@/features/court/types'
import { useAppStore } from '@/store/useAppStore'

export default function CourtPage() {
  const navigate = useNavigate()
  const { tenant } = useAppStore()
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null)
  const [facilities, setFacilities] = useState<CourtFacility[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadFacilities() {
      setLoading(true)
      try {
        const data = await courtService.fetchFacilities()
        setFacilities(data)
      } catch (err) {
        console.error('Failed to load facilities', err)
      } finally {
        setLoading(false)
      }
    }
    loadFacilities()
  }, [])

  const selectedFacility = facilities.find((f) => f.id === selectedFacilityId)

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/50 px-3 py-4 sm:px-6 sm:py-6 md:p-10">
      {/* Page Header */}
      <div className="mb-5 flex flex-col justify-between gap-4 sm:mb-8 md:flex-row md:items-center">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 rounded-xl px-2 text-sm text-slate-500 hover:bg-slate-200 sm:px-3"
              onClick={() => (selectedFacilityId ? setSelectedFacilityId(null) : navigate('/home'))}
            >
              <ArrowLeft className="mr-1.5 h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">
                {selectedFacilityId ? 'Quay lại tìm kiếm' : 'Quay về Dashboard'}
              </span>
              <span className="sm:hidden">{selectedFacilityId ? 'Tìm sân' : 'Dashboard'}</span>
            </Button>
          </div>
          <h1 className="text-2xl leading-tight font-black tracking-tight text-slate-900 uppercase sm:text-4xl">
            {selectedFacilityId
              ? `Sân tại: ${selectedFacility?.name}`
              : `Khám phá sân ${tenant.name}`}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-lg">
            {selectedFacilityId
              ? `Xem sơ đồ các sân lẻ và lịch trống tại ${selectedFacility?.address}`
              : `Tìm kiếm địa điểm chơi ${tenant.name} phù hợp nhất với vị trí và sở thích của bạn.`}
          </p>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        {selectedFacilityId ? (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <CourtTimeline facilityId={selectedFacilityId} />
          </div>
        ) : (
          <CourtDiscovery
            facilities={facilities}
            onSelectFacility={setSelectedFacilityId}
            loading={loading}
          />
        )}
      </div>
    </div>
  )
}
