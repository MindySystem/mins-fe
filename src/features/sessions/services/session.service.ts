import api from '@/services/api'
import type { User } from '@/store/useAppStore'

import type { BadmintonSession, SessionFormData, SessionStatus } from '../types'

interface RawSession {
  id: number
  title: string
  date: string
  startTime: string
  endTime: string
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
}
