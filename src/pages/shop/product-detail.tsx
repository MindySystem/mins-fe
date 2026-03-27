import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { shopService } from '@/features/shop/services/shop.service'
import type { Product } from '@/features/shop/types'
import { ShopLayout } from '@/layouts/ShopLayout'
import { cn } from '@/lib/utils'

export default function ProductDetailPage() {
  const navigate = useNavigate()
  const { productId } = useParams()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'desc' | 'specs'>('desc')
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      const p = await shopService.getProductById(productId ?? '')
      if (!mounted) return
      setProduct(p)
      setActiveImage(p?.image ?? null)
      setSelectedSize(p?.sizes?.[0] ?? null)
      setQuantity(1)
      setLoading(false)
    }

    load()
    return () => {
      mounted = false
    }
  }, [productId])

  const breadcrumbs = useMemo(
    () => [
      { label: 'Trang chủ', onClick: () => navigate('/') },
      { label: 'Shop', onClick: () => navigate('/shop') },
      { label: 'Sản phẩm', onClick: () => navigate('/shop/products') },
      { label: product?.name ?? 'Chi tiết sản phẩm' },
    ],
    [navigate, product?.name],
  )

  const galleryImages = useMemo(() => {
    if (!product) return []
    const fromVariants = product.colorVariants?.map((v) => v.image).filter(Boolean) ?? []
    const all = [product.image, ...fromVariants].filter(Boolean)
    return Array.from(new Set(all))
  }, [product])

  const stockLabel = useMemo(() => {
    if (!product) return ''
    if (product.stock <= 0) return 'Hết hàng'
    return `Còn hàng (${product.stock})`
  }, [product])

  const handleAddToCart = () => {
    if (!product) return
    toast.success(`Đã thêm ${product.name} vào giỏ hàng`)
  }

  return (
    <ShopLayout>
      {/* Breadcrumbs (ShopVNB-like) */}
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-6 py-3 text-[12px] font-medium text-slate-600">
          {breadcrumbs.map((b, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span
                className={cn(
                  b.onClick ? 'cursor-pointer hover:text-[#E95211]' : '',
                  idx === breadcrumbs.length - 1 ? 'text-[#E95211]' : 'text-slate-700',
                )}
                onClick={b.onClick}
              >
                {b.label}
              </span>
              {idx !== breadcrumbs.length - 1 && <span className="text-slate-700">{'>'}</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {loading ? (
          <div className="rounded border border-slate-200 bg-white p-10 text-sm font-semibold text-slate-500">
            Đang tải sản phẩm...
          </div>
        ) : !product ? (
          <div className="rounded border border-slate-200 bg-white p-10">
            <div className="text-base font-black text-slate-900 uppercase">Không tìm thấy sản phẩm</div>
            <div className="mt-2 text-sm text-slate-500">
              Sản phẩm có thể đã bị xóa hoặc đường dẫn không đúng.
            </div>
            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                className="border-[#E95221] font-bold text-[#E95221] uppercase hover:bg-[#E95221] hover:text-white"
                onClick={() => navigate('/shop/products')}
              >
                Về danh sách sản phẩm
              </Button>
              <Button className="bg-[#E95221] font-black uppercase hover:bg-[#d8460b]" onClick={() => navigate('/shop')}>
                Về shop
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Gallery */}
              <div className="space-y-3">
                <div className="relative overflow-hidden rounded border border-slate-200 bg-white">
                  <div className="relative aspect-square">
                    <img
                      src={activeImage ?? product.image}
                      alt={product.name}
                      className="absolute inset-0 h-full w-full object-contain p-3 mix-blend-multiply"
                    />
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {product.discount && (
                        <div className="rounded bg-[#e8002d] px-2 py-1 text-[11px] font-black text-white">
                          -{product.discount}%
                        </div>
                      )}
                      {product.isPremium && (
                        <Badge className="rounded-sm border-none bg-orange-600 px-2 py-0.5 text-[10px] font-bold tracking-tight text-white uppercase shadow-sm">
                          Premium
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {galleryImages.length > 1 && (
                  <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
                    {galleryImages.slice(0, 12).map((src) => {
                      const isActive = (activeImage ?? product.image) === src
                      return (
                        <button
                          key={src}
                          type="button"
                          className={cn(
                            'overflow-hidden rounded border bg-white p-1 transition-colors',
                            isActive ? 'border-[#E95221]' : 'border-slate-200 hover:border-[#E95221]',
                          )}
                          onClick={() => setActiveImage(src)}
                        >
                          <div className="relative aspect-square">
                            <img
                              src={src}
                              alt={product.name}
                              className="absolute inset-0 h-full w-full object-contain p-1 mix-blend-multiply"
                            />
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="space-y-4">
                <h1 className="text-[26px] leading-snug font-semibold text-slate-900">{product.name}</h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600">SKU:</span>
                    <span className="font-semibold text-[#E95221]">{product.id}</span>
                  </div>
                  {product.brand && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">Thương hiệu:</span>
                      <span className="font-semibold text-[#E95221]">{product.brand}</span>
                    </div>
                  )}
                </div>

                <div className="text-sm text-slate-700">
                  Tình trạng:{' '}
                  <span className={cn('font-semibold', product.stock > 0 ? 'text-[#E95221]' : 'text-slate-400')}>
                    {stockLabel}
                  </span>
                </div>

                {/* Price box */}
                <div className="border-b border-slate-200 pb-4">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <div className="text-[22px] font-bold text-[#e8002d]">{product.price.toLocaleString()}đ</div>
                    {product.originalPrice && (
                      <div className="text-base text-slate-400 line-through">
                        {product.originalPrice.toLocaleString()}đ
                      </div>
                    )}
                  </div>
                </div>

                {/* Swatch sizes */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-base font-semibold text-slate-800">
                      Chọn size:{' '}
                      <span className="font-normal text-[#E95221]">{selectedSize ?? '—'}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((s) => {
                        const active = selectedSize === s
                        return (
                          <button
                            key={s}
                            type="button"
                            className={cn(
                              'min-w-10 rounded border px-3 py-1 text-sm transition-colors',
                              active
                                ? 'border-[#f89008] bg-orange-50 font-semibold text-slate-800'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-[#f89008]',
                            )}
                            onClick={() => setSelectedSize(s)}
                          >
                            {s}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Quantity + CTA */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <div className="inline-flex items-center">
                    <button
                      type="button"
                      className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#E95221] text-xl leading-none text-white"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      aria-label="Giảm số lượng"
                    >
                      −
                    </button>
                    <input
                      className="mx-2 h-[31px] w-[90px] rounded border border-[#E95221] text-center text-sm font-semibold text-[#E95221] outline-none"
                      value={quantity}
                      onChange={(e) => {
                        const raw = e.target.value.trim()
                        if (raw === '') return
                        const n = Number(raw)
                        if (Number.isFinite(n)) setQuantity(Math.max(1, Math.floor(n)))
                      }}
                      inputMode="numeric"
                    />
                    <button
                      type="button"
                      className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#E95221] text-xl leading-none text-white"
                      onClick={() => setQuantity((q) => Math.min(product.stock || 999, q + 1))}
                      aria-label="Tăng số lượng"
                    >
                      +
                    </button>
                  </div>

                  <Button
                    className="h-[31px] rounded bg-[#E95221] px-10 text-[12px] font-semibold uppercase hover:bg-white hover:text-[#E95221] border border-[#E95221]"
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                  >
                    Thêm vào giỏ
                  </Button>

                  <Button
                    variant="outline"
                    className="h-[31px] rounded border-slate-200 px-6 text-[12px] font-semibold uppercase"
                    onClick={() => navigate('/shop/products')}
                  >
                    Tiếp tục mua sắm
                  </Button>
                </div>

                <div className="text-sm text-slate-700">
                  Đơn vị: <span className="font-semibold text-slate-900">{product.unit}</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="rounded border border-slate-200 bg-white">
              <div className="flex flex-wrap gap-8 border-b border-slate-200 px-6 pt-4">
                <button
                  type="button"
                  className={cn(
                    'pb-3 text-sm font-semibold uppercase',
                    activeTab === 'desc'
                      ? 'border-b border-[#E95221] text-[#E95221]'
                      : 'text-slate-800 hover:text-[#E95221]',
                  )}
                  onClick={() => setActiveTab('desc')}
                >
                  Mô tả
                </button>
                <button
                  type="button"
                  className={cn(
                    'pb-3 text-sm font-semibold uppercase',
                    activeTab === 'specs'
                      ? 'border-b border-[#E95221] text-[#E95221]'
                      : 'text-slate-800 hover:text-[#E95221]',
                  )}
                  onClick={() => setActiveTab('specs')}
                >
                  Thông số
                </button>
              </div>

              <div className="px-6 py-5">
                {activeTab === 'desc' ? (
                  <div className="prose prose-slate max-w-none text-sm">
                    <p>
                      <strong>{product.name}</strong> là sản phẩm thuộc nhóm <strong>{product.category}</strong>
                      {product.brand ? ` của thương hiệu ${product.brand}` : ''}. Layout trang được dựng dựa theo
                      cấu trúc product detail của ShopVNB (gallery + swatch + quantity + tabs).
                    </p>
                  </div>
                ) : product.specs && Object.keys(product.specs).length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <tbody className="divide-y divide-slate-100">
                        {Object.entries(product.specs).map(([k, v]) => (
                          <tr key={k}>
                            <th className="w-1/3 py-3 pr-4 font-semibold text-slate-600">{k}</th>
                            <td className="py-3 font-semibold text-slate-800">{v}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-sm text-slate-500">Chưa có thông số cho sản phẩm này.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ShopLayout>
  )
}

