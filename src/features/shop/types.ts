export type Category = 'drinks' | 'food' | 'gear' | 'services' | 'snacks'

export interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  discount?: number
  brand?: string
  isNew?: boolean
  isHot?: boolean
  isPremium?: boolean
  category: Category
  image: string
  colorVariants?: {
    color: string
    image: string
  }[]
  sizes?: string[]
  branchAvailability?: string[]
  stock: number
  unit: string
  specs?: Record<string, string>
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Order {
  id: string
  items: CartItem[]
  subTotal: number
  tax: number
  total: number
  status: 'pending' | 'completed' | 'cancelled'
  createdAt: string
}
