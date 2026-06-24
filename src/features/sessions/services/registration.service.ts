import api from '@/services/api'
import type { User } from '@/store/useAppStore'

import type {
  Registration,
  RegistrationFormData,
  RegistrationResult,
} from '../types'

interface RawRegistration {
  id: number
  sessionId: number
  userId: number
  amountDue: number
  amountPaid: number
  attended: boolean
  userConfirmedPaid: boolean
  adminConfirmedPaid: boolean
  note: string | null
  registeredAt: string
  updatedAt: string
  user?: User | null
}

interface CollectionResponse {
  data: RawRegistration[]
}

function normalize(input: RawRegistration): Registration {
  return {
    ...input,
    id: Number(input.id),
    sessionId: Number(input.sessionId),
    userId: Number(input.userId),
    // Preserve embedded user (khi server eager load 'user')
    user: input.user,
  }
}

function extractErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const r = (err as { response?: { data?: { message?: string } } }).response
    if (r?.data?.message) return r.data.message
  }
  if (err instanceof Error) return err.message
  return fallback
}

export const registrationService = {
  async listBySession(sessionId: number | string): Promise<Registration[]> {
    const res = (await api.get(`/badminton/sessions/${sessionId}/registrations`)) as CollectionResponse
    return (res.data || []).map(normalize)
  },

  async myRegistrations(): Promise<Registration[]> {
    const res = (await api.get('/badminton/my-registrations')) as CollectionResponse
    return (res.data || []).map(normalize)
  },

  /**
   * Lịch sử đăng ký của 1 user — admin dùng cho trang "Chi tiết thành viên".
   */
  async listByUser(userId: number | string): Promise<Registration[]> {
    const res = (await api.get(`/users/${userId}/registrations`)) as CollectionResponse
    return (res.data || []).map(normalize)
  },

  async register(
    sessionId: number | string,
    userId?: number,
  ): Promise<RegistrationResult> {
    try {
      const payload = userId !== undefined ? { userId } : undefined
      const res = (await api.post(
        `/badminton/sessions/${sessionId}/registrations`,
        payload ?? {},
      )) as { data: RawRegistration }
      return { ok: true, data: normalize(res.data) }
    } catch (e) {
      return { ok: false, error: extractErrorMessage(e, 'Không thể đăng ký') }
    }
  },

  async addMember(
    sessionId: number | string,
    userId: number,
    amountDue = 0,
  ): Promise<RegistrationResult> {
    try {
      const res = (await api.post(
        `/badminton/sessions/${sessionId}/registrations`,
        { userId, amountDue },
      )) as { data: RawRegistration }
      return { ok: true, data: normalize(res.data) }
    } catch (e) {
      return { ok: false, error: extractErrorMessage(e, 'Không thể thêm thành viên') }
    }
  },

  async update(id: number | string, patch: RegistrationFormData): Promise<Registration> {
    const res = (await api.patch(`/badminton/registrations/${id}`, patch)) as {
      data: RawRegistration
    }
    return normalize(res.data)
  },

  async cancel(id: number | string): Promise<void> {
    await api.delete(`/badminton/registrations/${id}`)
  },
}
