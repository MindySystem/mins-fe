import { Plus } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Product } from '@/features/shop/types'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  product: Product
  onAdd?: (p: Product) => void
  onNavigate?: (productId: string) => void
  showVariants?: boolean
  className?: string
}

export function ProductCard({
  product,
  onAdd,
  onNavigate,
  showVariants = false,
  className,
}: ProductCardProps) {
  return (
    <div
      className={cn(
        'group flex flex-col overflow-hidden rounded-lg border border-transparent bg-white p-2 transition-all duration-300 hover:border-slate-100 hover:shadow-xl',
        className,
      )}
    >
      <div
        className="relative mb-4 aspect-square overflow-hidden rounded-lg bg-white transition-colors group-hover:bg-slate-50/50"
        onClick={() => onNavigate?.(product.id)}
        role={onNavigate ? 'button' : undefined}
        tabIndex={onNavigate ? 0 : undefined}
      >
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          {product.isPremium && (
            <Badge className="rounded-sm border-none bg-orange-600 px-2 py-0.5 text-[9px] font-bold tracking-tight text-white uppercase shadow-sm">
              Premium
            </Badge>
          )}
          {product.discount && (
            <div className="inline-block rounded-sm bg-red-600 px-1.5 py-0.5 text-[10px] font-black text-white shadow-sm">
              -{product.discount}%
            </div>
          )}
        </div>

        {onAdd && (
          <div className="absolute inset-x-2 bottom-2 translate-y-12 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <Button
              className="h-8 w-full rounded bg-red-600 text-[10px] font-black tracking-widest uppercase shadow-lg hover:bg-red-700"
              onClick={(e) => {
                e.stopPropagation()
                onAdd(product)
              }}
            >
              <Plus className="mr-1 h-3 w-3" /> Thêm nhanh
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col px-1">
        {showVariants && product.colorVariants && product.colorVariants.length > 0 && (
          <div className="mb-3 flex gap-1.5">
            {product.colorVariants.map((variant, i) => (
              <div
                key={i}
                className="h-8 w-8 cursor-pointer overflow-hidden rounded border border-slate-100 bg-white p-0.5 transition-colors hover:border-red-600"
                onClick={() => onNavigate?.(product.id)}
                role={onNavigate ? 'button' : undefined}
                tabIndex={onNavigate ? 0 : undefined}
              >
                <img src={variant.image} alt={variant.color} className="h-full w-full object-contain" />
              </div>
            ))}
          </div>
        )}

        <h3
          className="mb-2 line-clamp-2 min-h-[2.5rem] cursor-pointer text-[13px] leading-snug font-bold text-slate-800 transition-colors hover:text-red-600"
          onClick={() => onNavigate?.(product.id)}
          role={onNavigate ? 'button' : undefined}
          tabIndex={onNavigate ? 0 : undefined}
        >
          {product.name}
        </h3>

        <div className="mt-auto flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-black text-red-600">
              {product.price.toLocaleString()} <span className="text-[12px] lowercase">đ</span>
            </span>
            {product.originalPrice && (
              <span className="text-[11px] font-medium text-slate-400 line-through">
                {product.originalPrice.toLocaleString()} đ
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

