export type CourtType = 'badminton' | 'tennis' | 'pickleball'
export type CourtStatus = 'active' | 'maintenance'
export type BookingStatus = 'pending' | 'confirmed' | 'playing' | 'completed' | 'cancelled'
export type PaymentStatus = 'unpaid' | 'partial' | 'paid'

export interface CourtFacility {
  id: string
  name: string
  address: string
  distance: number // in km
  rating: number // 1-5
  imageUrl: string
  type: CourtType // Primary sport
}

export interface Court {
  id: string
  facilityId: string
  name: string
  type: CourtType
  status: CourtStatus
  pricePerHour: number
}

export interface Customer {
  id: string
  name: string
  phone: string
}

export interface Booking {
  id: string
  courtId: string
  customer: Customer
  startTime: string // ISO string or HH:mm format
  endTime: string
  date: string // YYYY-MM-DD
  status: BookingStatus
  paymentStatus: PaymentStatus
  totalPrice: number
}

export interface DailySchedule {
  date: string
  facility: CourtFacility
  courts: Court[]
  bookings: Booking[]
}
