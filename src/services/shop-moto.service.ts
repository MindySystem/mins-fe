import api from '@/services/api'
import type {
  ShopMotoCollectionResponse,
  ShopMotoDashboardSummary,
  ShopMotoDocument,
  ShopMotoItemResponse,
  ShopMotoResource,
} from '@/types/shop-moto'

const BASE = '/shop-moto'

function listFromResponse<T>(response: unknown): T[] {
  if (Array.isArray(response)) return response as T[]
  if (response && typeof response === 'object' && Array.isArray((response as { data?: unknown }).data)) {
    return (response as { data: T[] }).data
  }
  return []
}

function itemFromResponse<T>(response: unknown): T | null {
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as { data: T }).data
  }
  return (response as T) ?? null
}

export const shopMotoService = {
  async list(resource: ShopMotoResource, params: Record<string, unknown> = {}) {
    const res = (await api.get(`${BASE}/${resource}`, { params })) as ShopMotoCollectionResponse
    return listFromResponse<ShopMotoDocument>(res)
  },

  async get(resource: ShopMotoResource, id: string) {
    const res = (await api.get(`${BASE}/${resource}/${id}`)) as ShopMotoItemResponse
    return itemFromResponse<ShopMotoDocument>(res)
  },

  async searchProducts(query: string) {
    const res = await api.post(`${BASE}/products/find-products`, { key: query, limit: 50 })
    return listFromResponse<ShopMotoDocument>(res)
  },

  async topSale() {
    const res = await api.get(`${BASE}/products/top-sale`)
    return listFromResponse<ShopMotoDocument>(res)
  },

  async userItems(resource: ShopMotoResource, userId: string) {
    const res = await api.get(`${BASE}/${resource}/user/${userId}`)
    return listFromResponse<ShopMotoDocument>(res)
  },

  async updateStatus(resource: ShopMotoResource, id: string, status: number | string) {
    const res = await api.post(`${BASE}/${resource}/status`, { id, status })
    return itemFromResponse<ShopMotoDocument>(res)
  },

  async create(resource: ShopMotoResource, payload: Record<string, unknown>) {
    const res = await api.post(`${BASE}/${resource}`, payload)
    return itemFromResponse<ShopMotoDocument>(res)
  },

  async update(resource: ShopMotoResource, id: string, payload: Record<string, unknown>) {
    const res = await api.patch(`${BASE}/${resource}/${id}`, payload)
    return itemFromResponse<ShopMotoDocument>(res)
  },

  async remove(resource: ShopMotoResource, id: string) {
    await api.delete(`${BASE}/${resource}/${id}`)
  },

  async dashboardSummary() {
    const res = await api.get(`${BASE}/dashboard/summary`)
    return itemFromResponse<ShopMotoDashboardSummary>(res) ?? {
      orders: 0,
      revenue: 0,
      products: 0,
      users: 0,
    }
  },
}
