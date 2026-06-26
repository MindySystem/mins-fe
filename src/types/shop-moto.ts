export type ShopMotoResource =
  | 'products'
  | 'accessory'
  | 'brand'
  | 'vehicle-type'
  | 'accessory-type'
  | 'orders'
  | 'order-moto'
  | 'my-mo-to'
  | 'maintenance-service'
  | 'maintenance-coupon'
  | 'promotion'
  | 'product-review'
  | 'product-comment'
  | 'users'
  | 'staff'
  | 'vehicle-registration'
  | 'time-service'

export interface ShopMotoDocument {
  id: string
  name?: string
  title?: string
  image?: string
  img?: string
  price?: number
  listedPrice?: number
  totalPrice?: number
  status?: number | string
  brand?: string
  type?: string | number
  description?: string
  email?: string
  phone?: string | number
  createdAt?: string
  updatedAt?: string
  [key: string]: unknown
}

export interface ShopMotoDashboardSummary {
  orders: number
  revenue: number
  products: number
  users: number
}

export interface ShopMotoCollectionResponse<T = ShopMotoDocument> {
  data: T[]
}

export interface ShopMotoItemResponse<T = ShopMotoDocument> {
  data: T
  message?: string
}
