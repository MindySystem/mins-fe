import api from '@/services/api'
import type { User } from '@/store/useAppStore'
import type { Shuttlecock } from '@/services/shuttlecock.service'

import type { BadmintonSession, SessionFormData, SessionStatus } from '../types'

interface RawSession {
  id: number
  title: string
  date: string
  startTime: string
  endTime: string
  location: string
  courtFee: number
  fixedCourtFee: number
  fixedFeeMale: number
  fixedFeeFemale: number
  shuttlecockId: number | null
  shuttlecockPricePerTube: number
  shuttlecocksUsed: number
  qrCodePath: string | null
  qrCodeUrl: string | null
  maxParticipants: number
  status: SessionStatus
  description: string | null
  createdBy: number
  createdAt: string
  updatedAt: string
  registrationsCount?: number
  creator?: User | null
  shuttlecock?: Shuttlecock | null
}

interface IndexResponse {
  data: RawSession[]
  meta?: unknown
}

interface ShowResponse {
  data: RawSession
}

function unwrap<T>(payload: T | { data: T }): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data
  }
  return payload as T
}

function normalize(input: RawSession): BadmintonSession {
  return {
    ...input,
    id: Number(input.id),
    createdBy: Number(input.createdBy),
  }
}

export const sessionService = {
  async list(params: { status?: SessionStatus; q?: string } = {}): Promise<BadmintonSession[]> {
    const res = (await api.get('/badminton/sessions', { params })) as IndexResponse
    return (res.data || []).map(normalize)
  },

  async get(id: number | string): Promise<BadmintonSession> {
    const res = (await api.get(`/badminton/sessions/${id}`)) as ShowResponse
    return normalize(unwrap<RawSession>(res))
  },

  async create(data: SessionFormData): Promise<BadmintonSession> {
    const res = (await api.post('/badminton/sessions', data)) as ShowResponse
    return normalize(unwrap<RawSession>(res))
  },

  async update(id: number | string, data: Partial<SessionFormData>): Promise<BadmintonSession> {
    const res = (await api.patch(`/badminton/sessions/${id}`, data)) as ShowResponse
    return normalize(unwrap<RawSession>(res))
  },

  async remove(id: number | string): Promise<void> {
    await api.delete(`/badminton/sessions/${id}`)
  },

  async setStatus(id: number | string, status: SessionStatus): Promise<BadmintonSession> {
    return this.update(id, { status })
  },

  async uploadQrCode(id: number | string, file: File): Promise<{ message: string; qrCodeUrl: string | null }> {
    const formData = new FormData()
    formData.append('qr_code', file)
    return api.post(`/badminton/sessions/${id}/qr-code`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }) as Promise<{ message: string; qrCodeUrl: string | null }>
  },

  async getExtraCosts(id: number | string): Promise<{ data: any[] }> {
    return api.get(`/badminton/sessions/${id}/extra-costs`) as Promise<{ data: any[] }>
  },

  async addExtraCost(id: number | string, data: { name: string; amount: number; note?: string }): Promise<{ message: string; data: any }> {
    return api.post(`/badminton/sessions/${id}/extra-costs`, data) as Promise<{ message: string; data: any }>
  },

  async updateExtraCost(costId: number | string, data: { name?: string; amount?: number; note?: string }): Promise<{ message: string; data: any }> {
    return api.put(`/badminton/extra-costs/${costId}`, data) as Promise<{ message: string; data: any }>
  },

  async deleteExtraCost(costId: number | string): Promise<{ message: string }> {
    return api.delete(`/badminton/extra-costs/${costId}`) as Promise<{ message: string }>
  },

  async userConfirmPayment(registrationId: number | string): Promise<{ message: string; data: any }> {
    return api.post(`/badminton/registrations/${registrationId}/user-confirm`) as Promise<{ message: string; data: any }>
  },

  async adminConfirmPayment(registrationId: number | string): Promise<{ message: string; data: any }> {
    return api.post(`/badminton/registrations/${registrationId}/admin-confirm`) as Promise<{ message: string; data: any }>
  },
}
