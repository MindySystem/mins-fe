import { useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import { addDays, format, subDays } from 'date-fns'
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  Plus,
  Search, 
  X} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/store/useAppStore'

import { courtService } from '../services/court.service'
import type { CourtType,DailySchedule } from '../types'

import { BookingEvent } from './BookingEvent'

const START_HOUR = 6 // 06:00
const END_HOUR = 23 // 23:00
const TOTAL_HOURS = END_HOUR - START_HOUR + 1
const PIXELS_PER_HOUR = 140
const HOUR_SLOTS = Array.from({ length: TOTAL_HOURS }, (_, i) => i + START_HOUR)

import { BookingModal } from './BookingModal'

interface Props {
  facilityId: string
}

export function CourtTimeline({ facilityId }: Props) {
  const { tenant } = useAppStore()
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [schedule, setSchedule] = useState<DailySchedule | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<CourtType | 'all'>('all')
  const [selectedCourtId, setSelectedCourtId] = useState<string | null>(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  
  // Drag selection state
  const [selection, setSelection] = useState<{ courtId: string; start: number; end: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const selectedCourt = schedule?.courts.find(c => c.id === selectedCourtId) || null

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const dateStr = format(currentDate, 'yyyy-MM-dd')
        const data = await courtService.fetchDailySchedule(facilityId, dateStr)
        setSchedule(data)
      } catch (err) {
        console.error('Failed to load schedule', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [currentDate, facilityId])

  // Scroll to current hour on initial load
  useEffect(() => {
    if (!loading && schedule && scrollContainerRef.current) {
      const currentHour = new Date().getHours()
      if (currentHour >= START_HOUR && currentHour <= END_HOUR) {
        const scrollAmount = (currentHour - START_HOUR) * PIXELS_PER_HOUR - 100
        scrollContainerRef.current.scrollTo({ left: Math.max(0, scrollAmount), behavior: 'smooth' })
      }
    }
  }, [loading, schedule])

  const filteredCourts = schedule?.courts.filter(court => {
    const matchesSearch = court.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === 'all' || court.type === typeFilter
    return matchesSearch && matchesType
  }) || []

  const goNextDay = () => setCurrentDate(addDays(currentDate, 1))
  const goPrevDay = () => setCurrentDate(subDays(currentDate, 1))
  const goToToday = () => setCurrentDate(new Date())

  const handleMouseDown = (courtId: string, hour: number) => {
    setSelection({ courtId, start: hour, end: hour + 1 })
    setIsDragging(true)
    setSelectedCourtId(courtId)
  }

  const handleMouseEnter = (hour: number) => {
    if (isDragging && selection) {
      setSelection({ ...selection, end: hour + 1 })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const clearSelection = () => {
    setSelection(null)
  }

  const confirmBooking = () => {
    setIsBookingModalOpen(true)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-slate-50/20">
      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header controls omitted for brevity in replace, but I will keep them */}
        <div className="flex flex-col border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              Lịch Đặt Sân
              {loading && <Loader2 className="w-5 h-5 animate-spin" style={{ color: tenant.primaryColor }} />}
            </h2>
            
            <div className="flex items-center gap-3">
               {selectedCourt && (
                 <Button 
                   className="rounded-xl px-6 shadow-md transition-all hover:scale-105"
                   style={{ backgroundColor: tenant.primaryColor }}
                   onClick={() => setIsBookingModalOpen(true)}
                 >
                   <Plus className="w-4 h-4 mr-2" /> Đặt {selectedCourt.name}
                 </Button>
               )}
              <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm ml-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={goPrevDay}>
                  <ChevronLeft className="h-4 w-4 text-slate-600" />
                </Button>
                <div className="px-4 flex items-center gap-2 font-medium text-slate-700 min-w-[150px] justify-center">
                  <CalendarIcon className="w-4 h-4" style={{ color: tenant.primaryColor }} />
                  {format(currentDate, 'dd/MM/yyyy')}
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={goNextDay}>
                  <ChevronRight className="h-4 w-4 text-slate-600" />
                </Button>
              </div>
              <Button variant="outline" className="rounded-xl px-4" onClick={goToToday}>Hôm nay</Button>
            </div>
          </div>

          <div className="px-6 pb-4 flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Tìm tên sân..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-xl bg-white border-slate-200 focus-visible:ring-offset-0"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5">
                  <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {(['all', 'badminton', 'tennis', 'pickleball'] as const).map((type) => (
                <Button
                  key={type}
                  variant={typeFilter === type ? 'default' : 'outline'}
                  size="sm"
                  className={clsx(
                    "rounded-lg capitalize",
                    typeFilter === type && "shadow-sm"
                  )}
                  style={typeFilter === type ? { backgroundColor: tenant.primaryColor } : {}}
                  onClick={() => setTypeFilter(type)}
                >
                  {type === 'all' ? 'Tất cả' : type}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid Timeline Area */}
        <div className="flex-1 flex overflow-hidden relative">
          <div className="w-56 flex-shrink-0 border-r border-slate-200 bg-white z-20 flex flex-col shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]">
            <div className="h-14 border-b border-slate-200 bg-slate-50 flex items-center px-4 font-semibold text-xs uppercase tracking-wider text-slate-500">
              Danh sách sân
            </div>
            <div className="flex-1 overflow-y-auto hidden-scrollbar">
              {filteredCourts.map(court => (
                <div 
                  key={court.id} 
                  className={clsx(
                    "h-24 border-b border-slate-100 px-4 flex flex-col justify-center cursor-pointer transition-colors",
                    selectedCourtId === court.id ? "bg-emerald-50/50" : "hover:bg-slate-50"
                  )}
                  style={selectedCourtId === court.id ? { borderRightColor: tenant.primaryColor, borderRightWidth: '4px' } : {}}
                  onClick={() => setSelectedCourtId(court.id === selectedCourtId ? null : court.id)}
                >
                  <span className={clsx(
                    "font-bold",
                    selectedCourtId === court.id ? "text-emerald-700" : "text-slate-800"
                  )}
                  style={selectedCourtId === court.id ? { color: tenant.primaryColor } : {}}
                  >
                    {court.name}
                  </span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{court.type}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                      {court.pricePerHour.toLocaleString()}đ/h
                    </span>
                  </div>
                  {court.status === 'maintenance' && (
                    <span className="text-[9px] mt-1 text-amber-600 font-bold uppercase font-mono">🔧 Bảo trì</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div 
            ref={scrollContainerRef}
            className="flex-1 overflow-auto bg-slate-50/20 relative"
          >
            <div className="sticky top-0 z-10 flex h-14 bg-white border-b border-slate-200 shadow-sm" style={{ width: TOTAL_HOURS * PIXELS_PER_HOUR }}>
              {HOUR_SLOTS.map(hour => (
                <div 
                  key={hour} 
                  className="flex-shrink-0 flex items-center border-l border-slate-100 text-sm font-bold text-slate-400 group"
                  style={{ width: PIXELS_PER_HOUR }}
                >
                  <div className="w-full text-center group-hover:text-emerald-600 transition-colors"
                  style={{ color: hour === new Date().getHours() ? tenant.primaryColor : undefined }}
                  >
                    {hour.toString().padStart(2, '0')}:00
                  </div>
                </div>
              ))}
            </div>

            <div className="relative" style={{ width: TOTAL_HOURS * PIXELS_PER_HOUR }}>
              <div className="absolute inset-0 flex pointer-events-none">
                {Array.from({ length: TOTAL_HOURS * 4 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={clsx(
                      "h-full border-l",
                      i % 4 === 0 ? "border-slate-200" : "border-slate-100/50 border-dashed"
                    )}
                    style={{ width: PIXELS_PER_HOUR / 4 }}
                  />
                ))}
              </div>

              {filteredCourts.map(court => {
                const courtBookings = schedule?.bookings.filter(b => b.courtId === court.id) || []
                
                return (
                  <div 
                    key={court.id} 
                    className={clsx(
                      "h-24 border-b border-slate-100 relative group transition-colors",
                      selectedCourtId === court.id ? "bg-emerald-50/30" : "hover:bg-slate-50/50"
                    )}
                    onMouseLeave={() => isDragging && setIsDragging(false)}
                  >
                    {/* Time slots for dragging */}
                    <div className="absolute inset-0 flex">
                      {HOUR_SLOTS.map(hour => (
                        <div 
                          key={hour}
                          className="h-full flex-shrink-0"
                          style={{ width: PIXELS_PER_HOUR }}
                          onMouseDown={() => handleMouseDown(court.id, hour)}
                          onMouseEnter={() => handleMouseEnter(hour)}
                          onMouseUp={handleMouseUp}
                        />
                      ))}
                    </div>

                    {courtBookings.map(booking => (
                      <BookingEvent 
                        key={booking.id}
                        booking={booking}
                        pixelsPerHour={PIXELS_PER_HOUR}
                        startHourOfDay={START_HOUR}
                        onDelete={(id) => {
                          if (schedule) {
                            setSchedule({
                              ...schedule,
                              bookings: schedule.bookings.filter(b => b.id !== id)
                            })
                            toast.success('Đã hủy lượt đặt sân thành công')
                          }
                        }}
                      />
                    ))}

                    {/* Selection Preview */}
                    {selection && selection.courtId === court.id && (
                      <div 
                        className="absolute h-full top-0 border-2 z-10 transition-all pointer-events-none flex items-center justify-center"
                        style={{ 
                          left: (Math.min(selection.start, selection.end - 1) - START_HOUR) * PIXELS_PER_HOUR,
                          width: Math.abs(selection.end - selection.start) * PIXELS_PER_HOUR,
                          backgroundColor: `${tenant.primaryColor}20`,
                          borderColor: tenant.primaryColor,
                          borderStyle: isDragging ? 'dashed' : 'solid'
                        }}
                      >
                         {!isDragging && (
                            <div className="bg-white px-2 py-0.5 rounded text-[10px] font-black shadow-sm" style={{ color: tenant.primaryColor }}>
                              {Math.min(selection.start, selection.end-1).toString().padStart(2, '0')}:00 - {Math.max(selection.start+1, selection.end).toString().padStart(2, '0')}:00
                            </div>
                         )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <BookingModal 
        key={isBookingModalOpen ? `modal-${selection?.courtId}-${selection?.start}-${selection?.end}` : 'closed'}
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false)
          setSelection(null)
        }}
        selectedCourt={selectedCourt}
        selectedDate={currentDate}
        overrideRange={selection ? { 
          startHour: Math.min(selection.start, selection.end - 1), 
          endHour: Math.max(selection.start + 1, selection.end) 
        } : undefined}
      />

      {/* Floating Confirm Bar */}
      {selection && !isDragging && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-white/80 backdrop-blur-xl border border-white/20 p-4 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] animate-in slide-in-from-bottom-10 duration-500">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thời gian đã chọn</span>
            <div className="flex items-center gap-2">
               <span className="text-lg font-black text-slate-900">
                {Math.min(selection.start, selection.end - 1).toString().padStart(2, '0')}:00 - {Math.max(selection.start + 1, selection.end).toString().padStart(2, '0')}:00
              </span>
              <span className="text-slate-300">|</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-bold text-slate-600">
                {selectedCourt?.name}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Button variant="ghost" onClick={clearSelection} className="rounded-2xl hover:bg-slate-100 text-slate-500 font-bold">
              Hủy
            </Button>
            <Button 
              onClick={confirmBooking}
              className="rounded-2xl px-8 font-black shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
              style={{ backgroundColor: tenant.primaryColor }}
            >
              Tiếp tục đặt sân
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
