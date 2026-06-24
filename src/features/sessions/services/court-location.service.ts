import api from '@/services/api'

export interface BadmintonCourtLocation {
  id: number
  name: string
  address: string
  mapUrl: string | null
  note: string | null
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface BadmintonCourtLocationForm {
  name: string
  address: string
  mapUrl?: string | null
  note?: string | null
  isActive?: boolean
}

interface CollectionResponse {
  data: BadmintonCourtLocation[]
}

interface ShowResponse {
  data: BadmintonCourtLocation
}

function toPayload(data: BadmintonCourtLocationForm) {
  return {
    name: data.name,
    address: data.address,
    mapUrl: data.mapUrl || null,
    note: data.note || null,
    isActive: data.isActive ?? true,
  }
}

export const courtLocationService = {
  async list(params: { q?: string } = {}): Promise<BadmintonCourtLocation[]> {
    const res = (await api.get('/badminton/courts', { params })) as CollectionResponse
    return res.data || []
  },

  async create(data: BadmintonCourtLocationForm): Promise<BadmintonCourtLocation> {
    const res = (await api.post('/badminton/courts', toPayload(data))) as ShowResponse
    return res.data
  },

  async update(id: number | string, data: BadmintonCourtLocationForm): Promise<BadmintonCourtLocation> {
    const res = (await api.put(`/badminton/courts/${id}`, toPayload(data))) as ShowResponse
    return res.data
  },

  async remove(id: number | string): Promise<void> {
    await api.delete(`/badminton/courts/${id}`)
  },
}
