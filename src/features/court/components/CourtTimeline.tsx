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
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/store/useAppStore'

import { courtService } from '../services/court.service'
import type { CourtType, DailySchedule } from '../types'

import { BookingEvent } from './BookingEvent'

const START_HOUR = 6 // 06:00
const END_HOUR = 23 // 23:00
const TOTAL_HOURS = END_HOUR - START_HOUR + 1
const DESKTOP_PIXELS_PER_HOUR = 140
const MOBILE_PIXELS_PER_HOUR = 96
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
  const [isCompact, setIsCompact] = useState(false)

  // Drag selection state
  const [selection, setSelection] = useState<{
    courtId: string
    start: number
    end: number
  } | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const selectedCourt = schedule?.courts.find((c) => c.id === selectedCourtId) || null
  const pixelsPerHour = isCompact ? MOBILE_PIXELS_PER_HOUR : DESKTOP_PIXELS_PER_HOUR
  const timelineWidth = TOTAL_HOURS * pixelsPerHour

  useEffect(() => {
    const query = window.matchMedia('(max-width: 640px)')
    const updateCompact = () => setIsCompact(query.matches)

    updateCompact()
    query.addEventListener('change', updateCompact)
    return () => query.removeEventListener('change', updateCompact)
  }, [])

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
        const scrollAmount = (currentHour - START_HOUR) * pixelsPerHour - (isCompact ? 60 : 100)
        scrollContainerRef.current.scrollTo({ left: Math.max(0, scrollAmount), behavior: 'smooth' })
      }
    }
  }, [isCompact, loading, pixelsPerHour, schedule])

  const filteredCourts =
    schedule?.courts.filter((court) => {
      const matchesSearch = court.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = typeFilter === 'all' || court.type === typeFilter
      return matchesSearch && matchesType
    }) || []

  const goNextDay = () => setCurrentDate(addDays(currentDate, 1))
  const goPrevDay = () => setCurrentDate(subDays(currentDate, 1))
  const goToToday = () => setCurrentDate(new Date())

  const handlePointerDown = (courtId: string, hour: number) => {
    setSelection({ courtId, start: hour, end: hour + 1 })
    setIsDragging(true)
    setSelectedCourtId(courtId)
  }

  const handlePointerEnter = (hour: number) => {
    if (isDragging && selection) {
      setSelection({ ...selection, end: hour + 1 })
    }
  }

  const handlePointerUp = () => {
    setIsDragging(false)
  }

  const clearSelection = () => {
    setSelection(null)
  }

  const confirmBooking = () => {
    setIsBookingModalOpen(true)
  }

  return (
    <div className="relative flex min-h-[590px] flex-col bg-slate-50/20 sm:h-[calc(100vh-120px)] sm:min-h-0">
      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Header controls omitted for brevity in replace, but I will keep them */}
        <div className="flex flex-col border-b border-slate-200 bg-slate-50/50">
          <div className="flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 sm:text-xl">
              Lịch Đặt Sân
              {loading && (
                <Loader2 className="h-5 w-5 animate-spin" style={{ color: tenant.primaryColor }} />
              )}
            </h2>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              {selectedCourt && (
                <Button
                  className="h-10 w-full rounded-xl px-4 text-sm shadow-md transition-all hover:scale-105 sm:w-auto sm:px-6"
                  style={{ backgroundColor: tenant.primaryColor }}
                  onClick={() => setIsBookingModalOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" /> Đặt {selectedCourt.name}
                </Button>
              )}
              <div className="grid grid-cols-[1fr_auto] gap-2 sm:flex sm:items-center sm:gap-3">
                <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    onClick={goPrevDay}
                  >
                    <ChevronLeft className="h-4 w-4 text-slate-600" />
                  </Button>
                  <div className="flex min-w-0 flex-1 items-center justify-center gap-2 px-2 text-sm font-medium text-slate-700 sm:min-w-[150px] sm:px-4 sm:text-base">
                    <CalendarIcon className="h-4 w-4 shrink-0" style={{ color: tenant.primaryColor }} />
                    {format(currentDate, 'dd/MM/yyyy')}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    onClick={goNextDay}
                  >
                    <ChevronRight className="h-4 w-4 text-slate-600" />
                  </Button>
                </div>
                <Button variant="outline" className="h-10 rounded-xl px-3 text-sm sm:px-4" onClick={goToToday}>
                  Hôm nay
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 px-3 pb-3 sm:flex-row sm:items-center sm:gap-4 sm:px-6 sm:pb-4">
            <div className="relative w-full flex-1 sm:max-w-sm">
              <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Tìm tên sân..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 rounded-xl border-slate-200 bg-white pr-10 pl-9 text-sm focus-visible:ring-offset-0"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1 right-1 h-8 w-8 rounded-lg"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                </Button>
              )}
            </div>

            <div className="scrollbar-hide flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {(['all', 'badminton', 'tennis', 'pickleball'] as const).map((type) => (
                <Button
                  key={type}
                  variant={typeFilter === type ? 'default' : 'outline'}
                  size="sm"
                  className={clsx(
                    'h-9 shrink-0 rounded-lg px-3 text-xs capitalize sm:text-sm',
                    typeFilter === type && 'shadow-sm',
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
        <div className="relative flex flex-1 overflow-hidden">
          <div className="z-20 flex w-36 flex-shrink-0 flex-col border-r border-slate-200 bg-white shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)] sm:w-56">
            <div className="flex h-12 items-center border-b border-slate-200 bg-slate-50 px-3 text-[10px] font-semibold tracking-wider text-slate-500 uppercase sm:h-14 sm:px-4 sm:text-xs">
              Sân
            </div>
            <div className="hidden-scrollbar flex-1 overflow-y-auto">
              {filteredCourts.map((court) => (
                <div
                  key={court.id}
                  className={clsx(
                    'flex h-20 cursor-pointer flex-col justify-center border-b border-slate-100 px-3 transition-colors sm:h-24 sm:px-4',
                    selectedCourtId === court.id ? 'bg-emerald-50/50' : 'hover:bg-slate-50',
                  )}
                  style={
                    selectedCourtId === court.id
                      ? { borderRightColor: tenant.primaryColor, borderRightWidth: '4px' }
                      : {}
                  }
                  onClick={() => setSelectedCourtId(court.id === selectedCourtId ? null : court.id)}
                  >
                  <span
                    className={clsx(
                      'line-clamp-2 text-sm font-bold sm:text-base',
                      selectedCourtId === court.id ? 'text-emerald-700' : 'text-slate-800',
                    )}
                    style={selectedCourtId === court.id ? { color: tenant.primaryColor } : {}}
                  >
                    {court.name}
                  </span>
                  <div className="mt-1 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                      {court.type}
                    </span>
                    <span className="w-fit rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                      {court.pricePerHour.toLocaleString()}đ/h
                    </span>
                  </div>
                  {court.status === 'maintenance' && (
                    <span className="mt-1 font-mono text-[9px] font-bold text-amber-600 uppercase">
                      🔧 Bảo trì
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div ref={scrollContainerRef} className="relative flex-1 overflow-auto bg-slate-50/20">
            <div
              className="sticky top-0 z-10 flex h-12 border-b border-slate-200 bg-white shadow-sm sm:h-14"
              style={{ width: timelineWidth }}
            >
              {HOUR_SLOTS.map((hour) => (
                <div
                  key={hour}
                  className="group flex flex-shrink-0 items-center border-l border-slate-100 text-xs font-bold text-slate-400 sm:text-sm"
                  style={{ width: pixelsPerHour }}
                >
                  <div
                    className="w-full text-center transition-colors group-hover:text-emerald-600"
                    style={{
                      color: hour === new Date().getHours() ? tenant.primaryColor : undefined,
                    }}
                  >
                    {hour.toString().padStart(2, '0')}:00
                  </div>
                </div>
              ))}
            </div>

            <div className="relative" style={{ width: timelineWidth }}>
              <div className="pointer-events-none absolute inset-0 flex">
                {Array.from({ length: TOTAL_HOURS * 4 }).map((_, i) => (
                  <div
                    key={i}
                    className={clsx(
                      'h-full border-l',
                      i % 4 === 0 ? 'border-slate-200' : 'border-dashed border-slate-100/50',
                    )}
                    style={{ width: pixelsPerHour / 4 }}
                  />
                ))}
              </div>

              {filteredCourts.map((court) => {
                const courtBookings = schedule?.bookings.filter((b) => b.courtId === court.id) || []

                return (
                  <div
                    key={court.id}
                    className={clsx(
                      'group relative h-20 border-b border-slate-100 transition-colors sm:h-24',
                      selectedCourtId === court.id ? 'bg-emerald-50/30' : 'hover:bg-slate-50/50',
                    )}
                    onPointerLeave={() => isDragging && setIsDragging(false)}
                  >
                    {/* Time slots for dragging */}
                    <div className="absolute inset-0 flex">
                      {HOUR_SLOTS.map((hour) => (
                        <div
                          key={hour}
                          className="h-full flex-shrink-0 touch-pan-x"
                          style={{ width: pixelsPerHour }}
                          onPointerDown={() => handlePointerDown(court.id, hour)}
                          onPointerEnter={() => handlePointerEnter(hour)}
                          onPointerUp={handlePointerUp}
                        />
                      ))}
                    </div>

                    {courtBookings.map((booking) => (
                      <BookingEvent
                        key={booking.id}
                        booking={booking}
                        pixelsPerHour={pixelsPerHour}
                        startHourOfDay={START_HOUR}
                        compact={isCompact}
                        onDelete={(id) => {
                          if (schedule) {
                            setSchedule({
                              ...schedule,
                              bookings: schedule.bookings.filter((b) => b.id !== id),
                            })
                            toast.success('Đã hủy lượt đặt sân thành công')
                          }
                        }}
                      />
                    ))}

                    {/* Selection Preview */}
                    {selection && selection.courtId === court.id && (
                      <div
                        className="pointer-events-none absolute top-0 z-10 flex h-full items-center justify-center border-2 transition-all"
                        style={{
                          left:
                            (Math.min(selection.start, selection.end - 1) - START_HOUR) *
                            pixelsPerHour,
                          width: Math.abs(selection.end - selection.start) * pixelsPerHour,
                          backgroundColor: `${tenant.primaryColor}20`,
                          borderColor: tenant.primaryColor,
                          borderStyle: isDragging ? 'dashed' : 'solid',
                        }}
                      >
                        {!isDragging && (
                          <div
                            className="rounded bg-white px-2 py-0.5 text-[10px] font-black shadow-sm"
                            style={{ color: tenant.primaryColor }}
                          >
                            {Math.min(selection.start, selection.end - 1)
                              .toString()
                              .padStart(2, '0')}
                            :00 -{' '}
                            {Math.max(selection.start + 1, selection.end)
                              .toString()
                              .padStart(2, '0')}
                            :00
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
        key={
          isBookingModalOpen
            ? `modal-${selection?.courtId}-${selection?.start}-${selection?.end}`
            : 'closed'
        }
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false)
          setSelection(null)
        }}
        selectedCourt={selectedCourt}
        selectedDate={currentDate}
        overrideRange={
          selection
            ? {
                startHour: Math.min(selection.start, selection.end - 1),
                endHour: Math.max(selection.start + 1, selection.end),
              }
            : undefined
        }
      />

      {/* Floating Confirm Bar */}
      {selection && !isDragging && (
        <div className="animate-in slide-in-from-bottom-10 fixed inset-x-3 bottom-3 z-50 flex flex-col gap-3 rounded-2xl border border-white/40 bg-white/95 p-3 shadow-[0_20px_50px_rgba(0,0,0,0.18)] backdrop-blur-xl duration-500 sm:absolute sm:inset-x-auto sm:bottom-8 sm:left-1/2 sm:flex-row sm:items-center sm:gap-4 sm:rounded-3xl sm:bg-white/80 sm:p-4 sm:-translate-x-1/2">
          <div className="flex flex-col">
            <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
              Thời gian đã chọn
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base font-black text-slate-900 sm:text-lg">
                {Math.min(selection.start, selection.end - 1)
                  .toString()
                  .padStart(2, '0')}
                :00 -{' '}
                {Math.max(selection.start + 1, selection.end)
                  .toString()
                  .padStart(2, '0')}
                :00
              </span>
              <span className="text-slate-300">|</span>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                {selectedCourt?.name}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:ml-4 sm:flex sm:items-center">
            <Button
              variant="ghost"
              onClick={clearSelection}
              className="h-10 rounded-xl font-bold text-slate-500 hover:bg-slate-100 sm:rounded-2xl"
            >
              Hủy
            </Button>
            <Button
              onClick={confirmBooking}
              className="h-10 rounded-xl px-4 font-black shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 sm:rounded-2xl sm:px-8"
              style={{ backgroundColor: tenant.primaryColor }}
            >
              Tiếp tục
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
