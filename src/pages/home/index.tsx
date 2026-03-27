import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Headphones, MapPin, Plus, ShieldCheck, Truck } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { shopService } from '@/features/shop/services/shop.service'
import type { Product } from '@/features/shop/types'
import { ShopLayout } from '@/layouts/ShopLayout'
import { cn } from '@/lib/utils'

// Sub-components defined outside to avoid re-creation on every render
const ProductCard = ({ product, onAdd }: { product: Product; onAdd: (p: Product) => void }) => (
  <div
    key={product.id}
    className="group flex flex-col overflow-hidden rounded-lg border border-transparent bg-white p-2 transition-all duration-300 hover:border-slate-100 hover:shadow-xl"
  >
    <div className="relative mb-4 aspect-square overflow-hidden rounded-lg bg-white transition-colors group-hover:bg-slate-50/50">
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
      <div className="absolute inset-x-2 bottom-2 translate-y-12 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        <Button
          className="h-8 w-full rounded bg-red-600 text-[10px] font-black tracking-widest uppercase shadow-lg hover:bg-red-700"
          onClick={() => onAdd(product)}
        >
          <Plus className="mr-1 h-3 w-3" /> Thêm nhanh
        </Button>
      </div>
    </div>
    <div className="flex flex-1 flex-col px-1">
      <h3 className="mb-2 line-clamp-2 min-h-[2.5rem] cursor-pointer text-[13px] leading-snug font-bold text-slate-800 transition-colors hover:text-red-600">
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

const SectionHeader = ({
  title,
  link,
  onNavigate,
}: {
  title: string
  link: string
  onNavigate: (l: string) => void
}) => (
  <div className="mb-8 flex items-center justify-between border-b border-slate-100 pb-4">
    <h2 className="relative text-xl font-black tracking-tight text-slate-900 uppercase italic">
      {title}
      <span className="absolute -bottom-4 left-0 h-1 w-20 bg-red-600" />
    </h2>
    <Button
      variant="ghost"
      className="text-xs font-bold text-red-600 hover:bg-red-50"
      onClick={() => onNavigate(link)}
    >
      Xem tất cả <ChevronRight className="ml-1 h-3 w-3" />
    </Button>
  </div>
)

interface Banner {
  id: string
  title: string
  image: string
  link: string
}

interface News {
  id: string
  title: string
  image: string
  category: string
  date: string
  summary: string
}

export default function HomePage() {
  const navigate = useNavigate()
  const [banners, setBanners] = useState<Banner[]>([])
  const [categories] = useState(shopService.getFeaturedCategories())
  const [newProducts, setNewProducts] = useState<Product[]>([])
  const [hotProducts, setHotProducts] = useState<Product[]>([])
  const [saleProducts, setSaleProducts] = useState<Product[]>([])
  const [news, setNews] = useState<News[]>([])
  const [activeBanner, setActiveBanner] = useState(0)

  useEffect(() => {
    shopService.getHomeBanners().then(setBanners)

    Promise.all([
      shopService.getFeaturedProducts('new'),
      shopService.getFeaturedProducts('hot'),
      shopService.getFeaturedProducts('sale'),
      shopService.getLatestNews(),
    ]).then(([nw, ht, sl, ns]) => {
      setNewProducts(nw)
      setHotProducts(ht)
      setSaleProducts(sl)
      setNews(ns)
    })

    const timer = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % 3)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const handleAddToCart = (product: Product) => {
    toast.success(`Đã thêm ${product.name} vào giỏ hàng`)
  }

  return (
    <ShopLayout>
      {/* Hero Carousel */}
      <section className="relative h-[400px] w-full overflow-hidden bg-slate-900 lg:h-[500px]">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={cn(
              'absolute inset-0 transition-opacity duration-1000 ease-in-out',
              index === activeBanner ? 'opacity-100' : 'opacity-0',
            )}
            onClick={() => navigate(banner.link)}
          >
            <img src={banner.image} alt={banner.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
            <div className="absolute inset-y-0 left-0 mx-auto flex w-full max-w-7xl items-center px-6">
              <div className="max-w-lg space-y-6">
                <Badge className="bg-red-600 text-[10px] font-bold tracking-widest uppercase">
                  Promotion
                </Badge>
                <h2 className="text-4xl leading-tight font-black text-white uppercase italic lg:text-6xl">
                  {banner.title}
                </h2>
                <p className="text-sm text-slate-300 lg:text-base">
                  Khám phá ngay bộ sưu tập mới nhất với ưu đãi cực khủng chỉ trong tháng này.
                </p>
                <Button className="h-12 rounded-none bg-white px-8 font-black tracking-widest text-slate-900 uppercase hover:bg-white/90">
                  Mua ngay
                </Button>
              </div>
            </div>
          </div>
        ))}
        {/* Carousel indicators */}
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-3">
          {banners.map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1.5 w-12 cursor-pointer transition-colors',
                i === activeBanner ? 'bg-red-600' : 'bg-white/30',
              )}
              onClick={() => setActiveBanner(i)}
            />
          ))}
        </div>
      </section>

      {/* Commitments bar */}
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-10 md:grid-cols-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-[13px] font-bold text-slate-900 uppercase">
                Vận chuyển toàn quốc
              </h4>
              <p className="text-[11px] text-slate-500">Nhanh chóng và an toàn</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-[13px] font-bold text-slate-900 uppercase">
                Sản phẩm chính hãng
              </h4>
              <p className="text-[11px] text-slate-500">Cam kết chất lượng 100%</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Headphones className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-[13px] font-bold text-slate-900 uppercase">Hỗ trợ 24/7</h4>
              <p className="text-[11px] text-slate-500">Hotline: 0977.508.430</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-[13px] font-bold text-slate-900 uppercase">Hệ thống cửa hàng</h4>
              <p className="text-[11px] text-slate-500">50+ chi nhánh toàn quốc</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl space-y-24 px-6 py-16">
        {/* Category Grid */}
        <section>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="group relative aspect-[3/4] cursor-pointer overflow-hidden rounded-lg border border-slate-100 bg-slate-50 lg:aspect-[4/5]"
                onClick={() => navigate(`/shop/products?category=${cat.id}`)}
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 text-center lg:p-6">
                  <h3 className="text-xs font-black tracking-wider text-white uppercase lg:text-sm">
                    {cat.name}
                  </h3>
                  <div className="mt-1 text-[9px] font-bold text-red-500 uppercase opacity-0 transition-opacity group-hover:opacity-100 lg:mt-2 lg:text-[10px]">
                    Xem ngay
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* New Products Section */}
        <section>
          <SectionHeader
            title="Sản phẩm mới nhất"
            link="/products?sort=newest"
            onNavigate={navigate}
          />
          <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {newProducts.map((p) => (
              <ProductCard key={p.id} product={p} onAdd={handleAddToCart} />
            ))}
          </div>
        </section>

        {/* Sale Products Banner Style */}
        <section className="flex flex-col items-center gap-12 overflow-hidden rounded-2xl bg-red-600 p-10 text-white lg:flex-row">
          <div className="flex-1 space-y-6">
            <Badge className="bg-white font-black text-red-600 uppercase">Super Sale</Badge>
            <h2 className="text-4xl leading-tight font-black uppercase italic lg:text-5xl">
              Flash Sale
              <br />
              Giảm đến 50%
            </h2>
            <p className="text-sm opacity-80">
              Chương trình áp dụng cho hàng trăm sản phẩm từ các thương hiệu lớn như Yonex, Lining,
              Victor...
            </p>
            <Button
              className="h-12 rounded-full bg-white px-10 font-black text-red-600 uppercase hover:bg-white/90"
              onClick={() => navigate('/shop/products')}
            >
              Săn ngay
            </Button>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-4">
            {saleProducts.slice(0, 2).map((p) => (
              <div
                key={p.id}
                className="group cursor-pointer rounded-xl bg-white p-4 text-slate-900"
                onClick={() => navigate('/shop/products')}
              >
                <div className="mb-3 aspect-square">
                  <img
                    src={p.image}
                    className="h-full w-full object-contain transition-transform group-hover:scale-105"
                    alt={p.name}
                  />
                </div>
                <h4 className="line-clamp-1 text-xs font-bold">{p.name}</h4>
                <div className="mt-1 font-black text-red-600">-{p.discount}%</div>
              </div>
            ))}
          </div>
        </section>

        {/* Hot Products Section */}
        <section>
          <SectionHeader
            title="Sản phẩm bán chạy"
            link="/products?sort=hot"
            onNavigate={navigate}
          />
          <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {hotProducts.map((p) => (
              <ProductCard key={p.id} product={p} onAdd={handleAddToCart} />
            ))}
          </div>
        </section>

        {/* News Section */}
        <section>
          <SectionHeader title="Tin tức & Kinh nghiệm" link="/shop/news" onNavigate={navigate} />
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {news.map((item) => (
              <div
                key={item.id}
                className="group cursor-pointer space-y-4"
                onClick={() => navigate(`/shop/news/${item.id}`)}
              >
                <div className="aspect-[16/9] overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-[10px] font-bold tracking-widest text-red-600 uppercase">
                    <span>{item.category}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <span className="text-slate-400">{item.date}</span>
                  </div>
                  <h3 className="line-clamp-2 text-base font-bold text-slate-900 transition-colors group-hover:text-red-600">
                    {item.title}
                  </h3>
                  <p className="line-clamp-2 text-[13px] leading-relaxed text-slate-500">
                    {item.summary}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </ShopLayout>
  )
}
