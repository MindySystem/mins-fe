import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, ListFilter, Search } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { shopService } from '@/features/shop/services/shop.service'
import type { Product } from '@/features/shop/types'
import { ShopLayout } from '@/layouts/ShopLayout'
import { cn } from '@/lib/utils'
import { ProductCard } from '@/pages/shop/components/ProductCard'

export default function ShopPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([])
  const [branchSearch, setBranchSearch] = useState('')
  const [selectedBranches, setSelectedBranches] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest')

  useEffect(() => {
    shopService.getShopProducts().then(setProducts)
  }, [])

  const brands = useMemo(() => shopService.getBrands(), [])
  const branches = useMemo(() => shopService.getBranches(), [])
  const sizes = useMemo(() => shopService.getSizes(), [])
  const priceRanges = useMemo(() => shopService.getPriceRanges(), [])

  const filteredProducts = useMemo(() => {
    const result = products.filter((p: Product) => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchBrand =
        selectedBrands.length === 0 || (p.brand && selectedBrands.includes(p.brand))

      const matchPrice =
        selectedPriceRanges.length === 0 ||
        selectedPriceRanges.some((rangeLabel: string) => {
          const range = priceRanges.find(
            (r: { label: string; min: number; max: number }) => r.label === rangeLabel,
          )
          return range ? p.price >= range.min && p.price <= range.max : true
        })

      const matchBranch =
        selectedBranches.length === 0 ||
        (p.branchAvailability &&
          p.branchAvailability.some((b: string) => selectedBranches.includes(b)))

      const matchSize =
        selectedSizes.length === 0 ||
        (p.sizes && p.sizes.some((s: string) => selectedSizes.includes(s)))

      return matchSearch && matchBrand && matchPrice && matchBranch && matchSize
    })

    if (sortBy === 'price-asc') result.sort((a: Product, b: Product) => a.price - b.price)
    if (sortBy === 'price-desc') result.sort((a: Product, b: Product) => b.price - a.price)

    return result
  }, [
    products,
    searchQuery,
    selectedBrands,
    selectedPriceRanges,
    selectedBranches,
    selectedSizes,
    sortBy,
    priceRanges,
  ])

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand],
    )
  }

  const togglePriceRange = (label: string) => {
    setSelectedPriceRanges((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    )
  }

  const toggleBranch = (branch: string) => {
    setSelectedBranches((prev) =>
      prev.includes(branch) ? prev.filter((b) => b !== branch) : [...prev, branch],
    )
  }

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    )
  }

  return (
    <ShopLayout searchQuery={searchQuery} onSearchChange={setSearchQuery}>
      {/* Breadcrumbs */}
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-6 py-3 text-[11px] font-medium text-slate-400">
          <span className="cursor-pointer hover:text-red-600" onClick={() => navigate('/')}>
            Trang chủ
          </span>
          <span>&gt;</span>
          <span className="font-bold text-red-600">Sản phẩm</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
          {/* Sidebar Filters */}
          <aside className="h-fit w-full shrink-0 space-y-6 rounded-md border border-red-600 p-4 lg:sticky lg:top-24 lg:w-64">
            {/* Price section */}
            <div className="space-y-4">
              <h3 className="inline-block border-b-2 border-red-600 pb-1 text-sm font-bold text-slate-800 uppercase">
                Chọn mức giá
              </h3>
              <div className="space-y-2.5">
                {priceRanges.map((range: { label: string; min: number; max: number }) => (
                  <div
                    key={range.label}
                    className="group flex cursor-pointer items-center space-x-2"
                    onClick={() => togglePriceRange(range.label)}
                  >
                    <Checkbox checked={selectedPriceRanges.includes(range.label)} />
                    <label className="cursor-pointer text-[13px] text-slate-600 group-hover:text-red-600">
                      {range.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Brand section */}
            <div className="space-y-4 pt-4">
              <h3 className="inline-block border-b-2 border-red-600 pb-1 text-sm font-bold text-slate-800 uppercase">
                Thương hiệu
              </h3>
              <div className="space-y-2.5">
                {brands.map((brand: string) => (
                  <div
                    key={brand}
                    className="group flex cursor-pointer items-center space-x-2"
                    onClick={() => toggleBrand(brand)}
                  >
                    <Checkbox checked={selectedBrands.includes(brand)} />
                    <label className="cursor-pointer text-[13px] text-slate-600 group-hover:text-red-600">
                      {brand}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Branch section */}
            <div className="space-y-4 pt-4">
              <h3 className="inline-block border-b-2 border-red-600 pb-1 text-sm font-bold text-slate-800 uppercase">
                Chi nhánh
              </h3>
              <div className="relative">
                <Input
                  placeholder="Tìm chi nhánh"
                  className="h-8 rounded-md border-slate-200 text-xs"
                  value={branchSearch}
                  onChange={(e) => setBranchSearch(e.target.value)}
                />
                <Search className="absolute top-1/2 right-2 h-3 w-3 -translate-y-1/2 text-slate-400" />
              </div>
              <div className="custom-scrollbar max-h-48 space-y-2.5 overflow-y-auto pr-2">
                {branches
                  .filter((b: string) => b.toLowerCase().includes(branchSearch.toLowerCase()))
                  .map((branch: string) => (
                    <div
                      key={branch}
                      className="group flex cursor-pointer items-center space-x-2"
                      onClick={() => toggleBranch(branch)}
                    >
                      <Checkbox checked={selectedBranches.includes(branch)} />
                      <label className="line-clamp-1 cursor-pointer text-[12px] text-slate-600 group-hover:text-red-600">
                        {branch}
                      </label>
                    </div>
                  ))}
              </div>
            </div>

            {/* Size section */}
            <div className="space-y-4 pt-4">
              <h3 className="inline-block border-b-2 border-red-600 pb-1 text-sm font-bold text-slate-800 uppercase">
                Lọc theo size
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {sizes.map((size: string) => (
                  <div
                    key={size}
                    className={cn(
                      'flex h-8 cursor-pointer items-center justify-center rounded border text-[12px] font-bold transition-colors',
                      selectedSizes.includes(size)
                        ? 'border-red-600 bg-red-600 text-white'
                        : 'border-slate-200 text-slate-500 hover:border-red-600 hover:text-red-600',
                    )}
                    onClick={() => toggleSize(size)}
                  >
                    {size}
                  </div>
                ))}
              </div>
            </div>

            {/* Clean filter button */}
            <Button
              variant="outline"
              className="mt-6 w-full rounded-md border-red-600 text-xs font-bold text-red-600 uppercase hover:bg-red-600 hover:text-white"
              onClick={() => {
                setSelectedBrands([])
                setSelectedPriceRanges([])
                setSelectedBranches([])
                setSelectedSizes([])
                setSearchQuery('')
              }}
            >
              Xóa lọc
            </Button>
          </aside>

          {/* Product Feed */}
          <div className="flex-1">
            {/* Promotional Banners */}
            <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
              {[
                { title: 'POWER CUSHION INFINITY', bg: 'bg-black' },
                { title: '65 Z 3', bg: 'bg-slate-800' },
                { title: 'AERUS Z', bg: 'bg-blue-600' },
                { title: 'POWER CUSHION ECLIPSION', bg: 'bg-amber-900' },
                { title: 'POWER CUSHION 88 DIAL', bg: 'bg-slate-200' },
                { title: 'COMFORT Z', bg: 'bg-red-900' },
                { title: 'POWER CUSHION CASCADE DRIVE', bg: 'bg-slate-100 col-span-1' },
              ].map((banner, i) => (
                <div
                  key={i}
                  className={cn(
                    'group relative aspect-[4/1] cursor-pointer overflow-hidden rounded',
                    banner.bg,
                  )}
                >
                  <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <span className="text-center text-[10px] leading-tight font-black tracking-widest text-white uppercase drop-shadow-lg transition-transform group-hover:scale-110 sm:text-xs">
                      {banner.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                Giày cầu lông Yonex
              </h2>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                  <ListFilter className="h-4 w-4" />
                  Sắp xếp:
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex h-8 items-center justify-center rounded border border-slate-200 bg-white px-3 text-[11px] font-bold uppercase transition-colors hover:bg-slate-50">
                    {sortBy === 'newest'
                      ? 'Mặc định'
                      : sortBy === 'price-asc'
                        ? 'Giá từ thấp đến cao'
                        : 'Giá từ cao đến thấp'}
                    <ChevronDown className="ml-2 h-3 w-3" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="min-w-[180px] rounded-md p-1">
                    <DropdownMenuItem
                      className="text-[11px] font-bold uppercase"
                      onClick={() => setSortBy('newest')}
                    >
                      Mặc định
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-[11px] font-bold uppercase"
                      onClick={() => setSortBy('price-asc')}
                    >
                      Giá từ thấp đến cao
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-[11px] font-bold uppercase"
                      onClick={() => setSortBy('price-desc')}
                    >
                      Giá từ cao đến thấp
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
              {filteredProducts.map((product: Product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  showVariants
                  onNavigate={(id) => navigate(`/shop/products/${id}`)}
                  onAdd={() => toast.success(`Đã thêm ${product.name} vào giỏ hàng`)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </ShopLayout>
  )
}
