import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface MegaMenuItem {
  title: string
  items: string[]
  link?: string
}

const MEGA_MENU_DATA: MegaMenuItem[] = [
  {
    title: 'Vợt Cầu Lông',
    items: ['Vợt cầu lông Yonex', 'Vợt cầu lông Victor', 'Vợt cầu lông Lining', 'Vợt Cầu Lông VS', 'Vợt Cầu Lông Mizuno', 'Vợt Cầu Lông Apacs', 'Vợt Cầu Lông VNB', 'Vợt Cầu Lông Proace', 'Vợt Cầu Lông Forza', 'Vợt Cầu Lông FlyPower'],
  },
  {
    title: 'Giày Cầu Lông',
    items: ['Giày cầu lông Yonex', 'Giày cầu lông Victor', 'Giày cầu lông Lining', 'Giày cầu lông VS', 'Giày cầu lông Kawasaki', 'Giày cầu lông Mizuno', 'Giày cầu lông Kumpoo', 'Giày Cầu Lông Promax', 'Giày Cầu Lông Babolat', 'Giày Cầu Lông Sunbatta'],
  },
  {
    title: 'Áo Cầu Lông',
    items: ['Áo cầu lông Yonex', 'Áo cầu lông VNB', 'Áo cầu lông Kamito', 'Áo cầu lông VS', 'Áo cầu lông Victor', 'Áo cầu lông Lining', 'Áo Cầu Lông DonexPro', 'Áo Cầu Lông Alien Armour', 'Áo thể thao SFD', 'Áo cầu lông Kawasaki'],
  },
  {
    title: 'Váy Cầu Lông',
    items: ['Váy cầu lông Yonex', 'Váy cầu lông Victec', 'Váy cầu lông Lining', 'Váy cầu lông Donex Pro', 'Váy cầu lông Victor', 'Váy cầu lông Kamito', 'Váy cầu lông Taro'],
  },
  {
    title: 'Quần Cầu Lông',
    items: ['Quần cầu lông Yonex', 'Quần cầu lông Victor', 'Quần cầu lông Lining', 'Quần cầu lông VNB', 'Quần Cầu Lông SFD', 'Quần Cầu Lông Donex Pro', 'Quần Cầu Lông Apacs', 'Quần cầu lông Alien Armour', 'Quần cầu lông Mizuno', 'Quần cầu lông Kawasaki'],
  },
  {
    title: 'Balo Cầu Lông',
    items: ['Balo Cầu Lông Yonex', 'Balo Cầu Lông VS', 'Balo Cầu Lông Victor'],
  },
  {
    title: 'Phụ Kiện Cầu Lông',
    items: ['Vớ Cầu Lông', 'Cước đan vợt cầu lông', 'Quấn cán lông'],
  },
  {
    title: 'Vợt Pickleball',
    items: ['Vợt PickleBall Head', 'Vợt PickleBall Joola', 'Vợt PickleBall Prokennex'],
  },
  {
    title: 'Giày Pickleball',
    items: ['Giày Pickleball Jogarbola', 'Giày Pickleball Asics', 'Giày Pickleball Nike'],
  },
]

export const MegaMenu = ({ isOpen }: { isOpen: boolean }) => {
  const navigate = useNavigate()

  return (
    <div
      className={cn(
        'absolute inset-x-0 top-full z-50 bg-white shadow-2xl transition-all duration-300 ease-out',
        isOpen ? 'visible opacity-100 translate-y-0' : 'invisible opacity-0 -translate-y-4'
      )}
    >
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-3 lg:grid-cols-5">
          {MEGA_MENU_DATA.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="text-[13px] font-black tracking-wider text-red-600 uppercase border-b border-slate-100 pb-2">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.items.map((item) => (
                  <li
                    key={item}
                    className="cursor-pointer text-xs font-medium text-slate-500 transition-colors hover:text-red-600"
                    onClick={() => navigate(`/shop/products?q=${item}`)}
                  >
                    {item}
                  </li>
                ))}
                <li 
                  className="cursor-pointer text-[10px] font-bold text-red-600 uppercase pt-1 hover:underline"
                  onClick={() => navigate('/shop/products')}
                >
                  Xem thêm
                </li>
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
