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
    <div className="flex min-h-screen flex-col bg-slate-50/50 p-6 md:p-10">
      {/* Page Header */}
      <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl text-slate-500 hover:bg-slate-200"
              onClick={() => (selectedFacilityId ? setSelectedFacilityId(null) : navigate('/'))}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {selectedFacilityId ? 'Quay lại tìm kiếm' : 'Quay về Dashboard'}
            </Button>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase">
            {selectedFacilityId
              ? `Sân tại: ${selectedFacility?.name}`
              : `Khám phá sân ${tenant.name}`}
          </h1>
          <p className="mt-2 max-w-2xl text-lg text-slate-500">
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
