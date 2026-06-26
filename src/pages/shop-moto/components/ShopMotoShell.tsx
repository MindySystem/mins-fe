import type React from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Bike, Gauge, ShoppingCart, Wrench } from 'lucide-react'

import { cn } from '@/lib/utils'

interface ShopMotoShellProps {
  children: React.ReactNode
  admin?: boolean
}

const userLinks = [
  { to: '/shop-moto', label: 'Trang chủ' },
  { to: '/shop-moto/catalog-moto', label: 'Xe moto' },
  { to: '/shop-moto/catalog-accessory', label: 'Phụ kiện' },
  { to: '/shop-moto/maintenance', label: 'Bảo dưỡng' },
  { to: '/shop-moto/my-order', label: 'Đơn hàng' },
]

const adminLinks = [
  { to: '/shop-moto-admin', label: 'Dashboard' },
  { to: '/shop-moto-admin/products', label: 'Sản phẩm' },
  { to: '/shop-moto-admin/orders', label: 'Đơn hàng' },
  { to: '/shop-moto-admin/users', label: 'Khách hàng' },
  { to: '/shop-moto-admin/maintenance', label: 'Bảo dưỡng' },
  { to: '/shop-moto-admin/promotions', label: 'Khuyến mãi' },
]

export function ShopMotoShell({ children, admin = false }: ShopMotoShellProps) {
  const links = admin ? adminLinks : userLinks

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <Link to={admin ? '/shop-moto-admin' : '/shop-moto'} className="flex items-center gap-3">
            <img src="/images/shop-moto/logo_moto.jpg" alt="" className="h-10 w-10 rounded object-cover" />
            <div>
              <div className="text-sm font-black tracking-wide uppercase">Shop Moto</div>
              <div className="text-xs text-zinc-500">{admin ? 'Bảng điều hành' : 'Moto & phụ kiện'}</div>
            </div>
          </Link>
          <nav className="flex gap-2 overflow-x-auto">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/shop-moto' || link.to === '/shop-moto-admin'}
                className={({ isActive }) =>
                  cn(
                    'shrink-0 rounded px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950',
                    isActive && 'bg-zinc-950 text-white hover:bg-zinc-950 hover:text-white',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 text-sm text-zinc-600 sm:px-6 md:grid-cols-3">
          <div className="flex items-center gap-2 font-semibold text-zinc-950"><Bike className="h-4 w-4" /> Moto Store</div>
          <div className="flex items-center gap-2"><ShoppingCart className="h-4 w-4" /> Bán xe, phụ kiện, đăng ký xe</div>
          <div className="flex items-center gap-2"><Wrench className="h-4 w-4" /> Bảo dưỡng và lịch hẹn kỹ thuật</div>
          <div className="flex items-center gap-2"><Gauge className="h-4 w-4" /> Vận hành trên API `/api/shop-moto/*`</div>
        </div>
      </footer>
    </div>
  )
}
