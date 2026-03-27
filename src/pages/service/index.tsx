import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { shopService } from '@/features/shop/services/shop.service'
import type { CartItem, Category, Product } from '@/features/shop/types'
import { useAppStore } from '@/store/useAppStore'

export default function ServicePage() {
  const navigate = useNavigate()
  const { tenant } = useAppStore()
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    shopService.getServiceProducts().then(setProducts)
  }, [])

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCategory = activeCategory === 'all' || p.category === activeCategory
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
      return matchCategory && matchSearch
    })
  }, [products, activeCategory, searchQuery])

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
    toast.success(`Đã thêm ${product.name}`, { duration: 1000 })
  }

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const newQty = Math.max(1, item.quantity + delta)
          return { ...item, quantity: newQty }
        }
        return item
      }),
    )
  }

  const subTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const tax = subTotal * 0.08 // 8% VAT
  const total = subTotal + tax

  const handleCheckout = () => {
    if (cart.length === 0) return
    toast.success('Đặt món thành công!', {
      description: `Tổng cộng: ${total.toLocaleString()} đ`,
    })
    setCart([])
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      {/* Left: Product Selection */}
      <div className="flex flex-1 flex-col overflow-hidden p-6">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="rounded-2xl hover:bg-white"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Dashboard
            </Button>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Menu Gọi Món</h1>
          </div>
          <div className="w-72">
            <Input
              placeholder="Tìm nước, đồ ăn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 rounded-2xl border-none bg-white px-6 shadow-sm focus-visible:ring-2"
              style={{ '--tw-ring-color': tenant.primaryColor } as React.CSSProperties}
            />
          </div>
        </div>

        <Tabs defaultValue="all" onValueChange={(v) => setActiveCategory(v as Category | 'all')} className="mb-8">
          <TabsList className="h-auto rounded-2xl border border-slate-200 bg-white/50 p-1.5 backdrop-blur-sm">
            {shopService.getServiceCategories().map((cat: { id: string; name: string }) => (
              <TabsTrigger
                key={cat.id}
                value={cat.id}
                className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
              >
                {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="custom-scrollbar flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="group relative cursor-pointer overflow-hidden rounded-[2rem] border-none bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                onClick={() => addToCart(product)}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="text-xs font-black tracking-widest text-white uppercase">
                      Chọn ngay
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="mb-1 truncate font-bold text-slate-900 transition-colors group-hover:text-emerald-600 uppercase text-xs tracking-wider">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black" style={{ color: tenant.primaryColor }}>
                      {product.price.toLocaleString()} đ
                    </span>
                    <span className="text-[10px] font-black tracking-tighter text-slate-400 uppercase">
                      {product.unit}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Cart Summary */}
      <div className="flex w-[400px] flex-col border-l border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-6">
          <div className="flex items-center gap-3">
            <div
              className="rounded-2xl bg-white p-3 shadow-sm"
              style={{ color: tenant.primaryColor }}
            >
              <ShoppingCart className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-black tracking-tight text-slate-900 uppercase">Danh sách Order</h2>
              <p className="text-xs font-bold text-slate-500">{cart.length} món</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl hover:bg-red-50 hover:text-red-500"
            onClick={() => setCart([])}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>

        <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center opacity-30 grayscale">
              <ShoppingCart className="mb-4 h-20 w-20" />
              <p className="text-sm font-black tracking-widest uppercase">Chưa chọn món nào</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="group animate-in slide-in-from-right-10 flex gap-4 duration-300"
              >
                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl shadow-sm border border-slate-100">
                  <img src={item.product.image} className="h-full w-full object-cover" />
                </div>
                <div className="flex flex-1 flex-col justify-between py-1">
                  <div>
                    <h4 className="mb-1 line-clamp-2 text-sm leading-tight font-bold text-slate-900">
                      {item.product.name}
                    </h4>
                    <p className="text-xs font-black" style={{ color: tenant.primaryColor }}>
                      {item.product.price.toLocaleString()} đ
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-1">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-white shadow-sm transition-all hover:bg-slate-100 active:scale-90"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-4 text-center text-sm font-black">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-white shadow-sm transition-all hover:bg-slate-100 active:scale-90"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-4 border-t border-slate-200 bg-slate-50 p-8">
          <div className="space-y-2">
            <div className="flex justify-between text-2xl font-black text-slate-900">
              <span>Thành tiền</span>
              <span style={{ color: tenant.primaryColor }}>
                {Math.round(subTotal).toLocaleString()} đ
              </span>
            </div>
          </div>

          <Button
            className="w-full rounded-[2rem] py-8 text-lg font-black shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              backgroundColor: tenant.primaryColor,
              boxShadow: `0 20px 40px -10px ${tenant.primaryColor}40`,
            }}
            disabled={cart.length === 0}
            onClick={handleCheckout}
          >
            GỬI ORDER
          </Button>
        </div>
      </div>
    </div>
  )
}
