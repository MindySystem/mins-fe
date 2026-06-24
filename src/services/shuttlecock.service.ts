import api from './api'

export interface Shuttlecock {
  id: number
  name: string
  brand: string | null
  description: string | null
  currentPricePerTube: number
  createdAt?: string
  updatedAt?: string
}

export interface ShuttlecockPriceHistory {
  id: number
  pricePerTube: number
  createdAt: string
}

export const shuttlecockService = {
  async getAll(): Promise<{ data: Shuttlecock[] }> {
    return api.get('/shuttlecocks')
  },

  async create(data: {
    name: string
    brand?: string
    description?: string
    currentPricePerTube: number
  }): Promise<{ message: string; data: Shuttlecock }> {
    // Map currentPricePerTube to current_price_per_tube for the API payload
    const payload = {
      name: data.name,
      brand: data.brand,
      description: data.description,
      current_price_per_tube: data.currentPricePerTube,
    }
    return api.post('/shuttlecocks', payload)
  },

  async update(
    id: number,
    data: {
      name: string
      brand?: string
      description?: string
      currentPricePerTube: number
    }
  ): Promise<{ message: string; data: Shuttlecock }> {
    const payload = {
      name: data.name,
      brand: data.brand,
      description: data.description,
      current_price_per_tube: data.currentPricePerTube,
    }
    return api.put(`/shuttlecocks/${id}`, payload)
  },

  async delete(id: number): Promise<{ message: string }> {
    return api.delete(`/shuttlecocks/${id}`)
  },

  async getPriceHistory(id: number): Promise<{ data: ShuttlecockPriceHistory[] }> {
    return api.get(`/shuttlecocks/${id}/price-history`)
  },
}
