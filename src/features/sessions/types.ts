// Domain types — khớp với BadmintonSessionResource / BadmintonRegistrationResource / UserResource

import type { User } from '@/store/useAppStore'

export type SessionStatus = 'open' | 'closed' | 'finished' | 'cancelled'

export interface BadmintonSession {
  id: number
  title: string
  date: string // YYYY-MM-DD
  startTime: string // HH:mm
  endTime: string // HH:mm
  location: string
  courtFee: number
  maxParticipants: number
  status: SessionStatus
  description: string | null
  createdBy: number
  createdAt: string
  updatedAt: string
  registrationsCount?: number
  creator?: User | null
}

export interface SessionFormData {
  title: string
  date: string
  startTime: string
  endTime: string
  location: string
  courtFee: number
  maxParticipants: number
  status: SessionStatus
  description?: string
}

export interface Registration {
  id: number
  sessionId: number
  userId: number
  amountDue: number
  amountPaid: number
  attended: boolean
  note: string | null
  registeredAt: string
  updatedAt: string
  /** Embedded user info khi server đã eager load `with('user')` */
  user?: User | null
}

export interface RegistrationFormData {
  amountDue?: number
  amountPaid?: number
  attended?: boolean
  note?: string | null
}

export type RegistrationResult = { ok: true; data: Registration } | { ok: false; error: string }

// API paginated wrapper (Laravel default)
export interface PaginatedResponse<T> {
  data: T[]
  links?: unknown
  meta?: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

// User stats (kèm trong response của GET /api/users/{user})
export interface UserStats {
  totalRegistrations: number
  upcoming: number
  attended: number
  totalAmountDue: number
  totalAmountPaid: number
  outstanding: number
}

export interface UserDetailResponse {
  data: User
  stats: UserStats
}
