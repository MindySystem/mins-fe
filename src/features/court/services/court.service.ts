import type { Booking, Court, CourtFacility, DailySchedule } from '../types'

const MOCK_FACILITIES: CourtFacility[] = [
  {
    id: 'f1',
    name: 'ProArena Cầu Giấy',
    address: 'Số 1 Duy Tân, Cầu Giấy, Hà Nội',
    distance: 1.2,
    rating: 4.8,
    imageUrl:
      'https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?q=80&w=600&auto=format&fit=crop',
    type: 'badminton',
  },
  {
    id: 'f2',
    name: 'VietNet Nam Từ Liêm',
    address: '15 Tố Hữu, Nam Từ Liêm, Hà Nội',
    distance: 2.5,
    rating: 4.5,
    imageUrl:
      'https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?q=80&w=600&auto=format&fit=crop',
    type: 'badminton',
  },
  {
    id: 'f3',
    name: 'Tennis Riverside',
    address: 'Phúc Xá, Ba Đình, Hà Nội',
    distance: 0.8,
    rating: 4.7,
    imageUrl:
      'https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?q=80&w=600&auto=format&fit=crop',
    type: 'tennis',
  },
]

const MOCK_COURTS: Court[] = [
  // Facility 1
  {
    id: 'c1-1',
    facilityId: 'f1',
    name: 'Sân 1 (VIP)',
    type: 'badminton',
    status: 'active',
    pricePerHour: 150000,
  },
  {
    id: 'c1-2',
    facilityId: 'f1',
    name: 'Sân 2',
    type: 'badminton',
    status: 'active',
    pricePerHour: 120000,
  },
  {
    id: 'c1-3',
    facilityId: 'f1',
    name: 'Sân 3',
    type: 'badminton',
    status: 'active',
    pricePerHour: 120000,
  },
  {
    id: 'c1-4',
    facilityId: 'f1',
    name: 'Sân 4',
    type: 'badminton',
    status: 'active',
    pricePerHour: 120000,
  },
  // Facility 2
  {
    id: 'c2-1',
    facilityId: 'f2',
    name: 'Sân A',
    type: 'badminton',
    status: 'active',
    pricePerHour: 110000,
  },
  {
    id: 'c2-2',
    facilityId: 'f2',
    name: 'Sân B',
    type: 'badminton',
    status: 'active',
    pricePerHour: 110000,
  },
  // Facility 3
  {
    id: 'c3-1',
    facilityId: 'f3',
    name: 'Sân Trung Tâm',
    type: 'tennis',
    status: 'active',
    pricePerHour: 300000,
  },
  {
    id: 'c3-2',
    facilityId: 'f3',
    name: 'Sân Phụ',
    type: 'tennis',
    status: 'active',
    pricePerHour: 250000,
  },
]

export const courtService = {
  fetchFacilities: async (): Promise<CourtFacility[]> => {
    await new Promise((resolve) => setTimeout(resolve, 600))
    return MOCK_FACILITIES
  },

  fetchDailySchedule: async (facilityId: string, dateStr: string): Promise<DailySchedule> => {
    await new Promise((resolve) => setTimeout(resolve, 800))

    const facility = MOCK_FACILITIES.find((f) => f.id === facilityId)!
    const courts = MOCK_COURTS.filter((c) => c.facilityId === facilityId)

    const mockBookings: Booking[] = [
      {
        id: 'b1',
        courtId: courts[0]?.id || 'c1-1',
        customer: { id: 'cus1', name: 'Nguyễn Văn A', phone: '0901234567' },
        date: dateStr,
        startTime: '08:00',
        endTime: '10:00',
        status: 'completed',
        paymentStatus: 'paid',
        totalPrice: 240000,
      },
      // ... existing bookings mapped to correct court IDs
    ]

    return {
      date: dateStr,
      facility,
      courts,
      bookings: mockBookings,
    }
  },
}
