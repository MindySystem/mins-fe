import type React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { BadgeCheck, Boxes, Search, ShoppingCart, Users } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { shopMotoService } from '@/services/shop-moto.service'
import type { ShopMotoDashboardSummary, ShopMotoDocument, ShopMotoResource } from '@/types/shop-moto'
import { ShopMotoShell } from './components/ShopMotoShell'

const adminResource: Record<string, ShopMotoResource> = {
  products: 'products',
  accessories: 'accessory',
  orders: 'orders',
  users: 'users',
  staff: 'staff',
  maintenance: 'maintenance-service',
  promotions: 'promotion',
  brands: 'brand',
  types: 'vehicle-type',
  reviews: 'product-review',
  comments: 'product-comment',
}

function money(value: number) {
  return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
}

export default function ShopMotoAdminPage() {
  const location = useLocation()
  const section = location.pathname.split('/').filter(Boolean)[1] ?? ''
  const resource = adminResource[section]
  const [summary, setSummary] = useState<ShopMotoDashboardSummary>({ orders: 0, revenue: 0, products: 0, users: 0 })
  const [items, setItems] = useState<ShopMotoDocument[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      shopMotoService.dashboardSummary().then(setSummary),
      resource ? shopMotoService.list(resource).then(setItems) : Promise.resolve(setItems([])),
    ]).finally(() => setLoading(false))
  }, [resource])

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase()
    if (!value) return items
    return items.filter((item) => String(item.name || item.title || item.email || item.id).toLowerCase().includes(value))
  }, [items, query])

  return (
    <ShopMotoShell admin>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Metric icon={<ShoppingCart className="h-5 w-5" />} label="Đơn hàng" value={summary.orders.toLocaleString('vi-VN')} />
          <Metric icon={<BadgeCheck className="h-5 w-5" />} label="Doanh thu" value={money(summary.revenue)} />
          <Metric icon={<Boxes className="h-5 w-5" />} label="Sản phẩm" value={summary.products.toLocaleString('vi-VN')} />
          <Metric icon={<Users className="h-5 w-5" />} label="Khách hàng" value={summary.users.toLocaleString('vi-VN')} />
        </div>

        <Card className="mt-6 rounded border shadow-none">
          <CardHeader className="gap-4 sm:flex sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>{resource ? titleFor(section) : 'Tổng quan Shop Moto'}</CardTitle>
              <p className="mt-1 text-sm text-zinc-500">Quản trị dữ liệu Web-MoTo đã chuyển qua Laravel API.</p>
            </div>
            {resource && (
              <div className="relative sm:w-80">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input className="pl-9" placeholder="Tìm dữ liệu" value={query} onChange={(event) => setQuery(event.target.value)} />
              </div>
            )}
          </CardHeader>
          <CardContent>
            {!resource ? (
              <div className="grid gap-4 text-sm text-zinc-600 md:grid-cols-3">
                <div className="rounded border p-4">Catalog và order đọc từ MongoDB legacy.</div>
                <div className="rounded border p-4">Admin route nằm dưới `/shop-moto-admin/*`.</div>
                <div className="rounded border p-4">API backend nằm dưới `/api/shop-moto/*`.</div>
              </div>
            ) : loading ? (
              <div className="rounded border p-6 text-sm text-zinc-500">Đang tải dữ liệu...</div>
            ) : (
              <div className="overflow-x-auto rounded border">
                <table className="w-full min-w-[760px] text-sm">
                  <thead className="bg-zinc-100 text-left text-xs font-semibold text-zinc-500 uppercase">
                    <tr>
                      <th className="px-4 py-3">Tên</th>
                      <th className="px-4 py-3">Giá/Tổng</th>
                      <th className="px-4 py-3">Loại</th>
                      <th className="px-4 py-3">Trạng thái</th>
                      <th className="px-4 py-3">ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filtered.map((item) => (
                      <tr key={item.id} className="bg-white">
                        <td className="px-4 py-3 font-medium text-zinc-950">{String(item.name || item.title || item.email || 'Shop Moto')}</td>
                        <td className="px-4 py-3">{money(Number(item.price || item.totalPrice || 0))}</td>
                        <td className="px-4 py-3 text-zinc-600">{String(item.brand || item.type || resource)}</td>
                        <td className="px-4 py-3"><Badge variant="secondary">{String(item.status ?? 'active')}</Badge></td>
                        <td className="px-4 py-3 font-mono text-xs text-zinc-500">{item.id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </ShopMotoShell>
  )
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="rounded border shadow-none">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="rounded bg-red-50 p-3 text-red-600">{icon}</div>
        <div>
          <div className="text-xs font-semibold text-zinc-500 uppercase">{label}</div>
          <div className="mt-1 text-xl font-black text-zinc-950">{value}</div>
        </div>
      </CardContent>
    </Card>
  )
}

function titleFor(section: string) {
  const titles: Record<string, string> = {
    products: 'Quản lý sản phẩm',
    accessories: 'Quản lý phụ kiện',
    orders: 'Quản lý đơn hàng',
    users: 'Quản lý khách hàng',
    staff: 'Quản lý nhân viên',
    maintenance: 'Quản lý bảo dưỡng',
    promotions: 'Quản lý khuyến mãi',
    brands: 'Quản lý thương hiệu',
    types: 'Quản lý loại xe',
    reviews: 'Đánh giá sản phẩm',
    comments: 'Bình luận sản phẩm',
  }

  return titles[section] ?? 'Shop Moto Admin'
}
