import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  History,
  LayoutGrid,
  MapPin,
  Phone,
  Search,
  ShoppingBag,
  User,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'
import { MegaMenu } from './MegaMenu'

interface ShopHeaderProps {
  searchQuery?: string
  onSearchChange?: (val: string) => void
}

export function ShopHeader({ searchQuery = '', onSearchChange }: ShopHeaderProps) {
  const { tenant } = useAppStore()
  const navigate = useNavigate()
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false)
  const menuTimerRef = useRef<any>(null)

  const handleMenuEnter = () => {
    if (menuTimerRef.current) clearTimeout(menuTimerRef.current)
    setIsMegaMenuOpen(true)
  }

  const handleMenuLeave = () => {
    menuTimerRef.current = setTimeout(() => {
      setIsMegaMenuOpen(false)
    }, 200)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white">
      {/* Top bar */}
      <div className="border-b border-slate-50 bg-slate-50/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2 text-[11px] font-medium text-slate-500">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5">
              <Phone className="h-3 w-3 text-red-600" />
              HOTLINE: <span className="font-bold text-red-600">0977508430 | 0338000308</span>
            </div>
            <div className="flex cursor-pointer items-center gap-1.5 hover:text-red-600">
              <MapPin className="h-3 w-3 text-red-600" />
              HỆ THỐNG CỬA HÀNG
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex cursor-pointer items-center gap-1.5 uppercase hover:text-red-600">
              Chính sách đổi trả
            </div>
            <div className="flex cursor-pointer items-center gap-1.5 uppercase hover:text-red-600">
              Tra cứu đơn hàng
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-6 py-5">
        <div className="flex shrink-0 cursor-pointer items-center" onClick={() => navigate('/')}>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-black p-1.5">
              <LayoutGrid className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-slate-900 uppercase italic">
              {tenant.name} <span className="text-red-600">VNB</span>
            </h1>
          </div>
        </div>

        <div className="relative max-w-xl flex-1 px-4">
          <div className="group relative">
            <Input
              placeholder="Tìm sản phẩm..."
              className="h-10 w-full rounded-full border-slate-200 bg-slate-100/50 pr-12 pl-5 text-sm focus:border-red-600 focus:ring-red-600/20"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') navigate(`/products?q=${searchQuery}`)
              }}
            />
            <div
              className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer text-slate-400 transition-colors hover:text-red-600"
              onClick={() => navigate(`/products?q=${searchQuery}`)}
            >
              <Search className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-8">
          <div
            className="group flex cursor-pointer flex-col items-center gap-1"
            onClick={() => navigate('/lookup')}
          >
            <div className="relative">
              <History className="h-5 w-5 text-slate-700 transition-colors group-hover:text-red-600" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase group-hover:text-red-600">
              Tra cứu
            </span>
          </div>
          <div
            className="group flex cursor-pointer flex-col items-center gap-1"
            onClick={() => navigate('/auth/login')}
          >
            <User className="h-5 w-5 text-slate-700 transition-colors group-hover:text-red-600" />
            <span className="text-[10px] font-bold text-slate-500 uppercase group-hover:text-red-600">
              Tài khoản
            </span>
          </div>
          <div className="group relative flex cursor-pointer flex-col items-center gap-1">
            <div className="relative">
              <ShoppingBag className="h-5 w-5 text-slate-700 transition-colors group-hover:text-red-600" />
              <Badge className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-red-600 p-0 text-[10px] font-bold text-white">
                0
              </Badge>
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase group-hover:text-red-600">
              Giỏ hàng
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="bg-red-600">
        <div className="mx-auto max-w-7xl px-6">
          <nav className="flex items-center relative">
            {[
              { name: 'Hệ thống', path: '/' },
              { name: 'Trang chủ Shop', path: '/shop' },
              { name: 'Sản phẩm', path: '/shop/products' },
              { name: 'Khuyến mãi', path: '/shop/sale' },
              { name: 'Tin tức', path: '/shop/news' },
              { name: 'Hướng dẫn', path: '/shop/guide' },
              { name: 'Liên hệ', path: '/shop/contact' },
            ].map((item, _idx) => (
              <div
                key={item.name}
                onClick={() => navigate(item.path)}
                onMouseEnter={item.name === 'Sản phẩm' ? handleMenuEnter : undefined}
                onMouseLeave={item.name === 'Sản phẩm' ? handleMenuLeave : undefined}
                className={cn(
                  'flex cursor-pointer items-center gap-1 px-5 py-3 text-[13px] font-bold text-white uppercase transition-colors hover:bg-white/10',
                  (window.location.pathname === item.path ||
                    (item.path === '/shop/products' &&
                      window.location.pathname.startsWith('/shop/products'))) &&
                    'bg-white/10',
                )}
              >
                {item.name}
                {(item.name === 'Sản phẩm' || item.name === 'Hướng dẫn') && (
                  <ChevronDown className={cn("h-3 w-3 opacity-70 transition-transform", item.name === 'Sản phẩm' && isMegaMenuOpen && "rotate-180")} />
                )}
              </div>
            ))}

            <div 
              onMouseEnter={handleMenuEnter}
              onMouseLeave={handleMenuLeave}
              className="absolute left-0 top-full w-full"
            >
              <MegaMenu isOpen={isMegaMenuOpen} />
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
