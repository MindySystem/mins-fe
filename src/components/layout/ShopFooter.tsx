import { useAppStore } from '@/store/useAppStore'

export function ShopFooter() {
  const { tenant } = useAppStore()

  return (
    <footer className="mt-20 border-t border-slate-100 bg-slate-50/30 py-12">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 md:grid-cols-4">
        <div className="space-y-4">
          <h1 className="text-xl font-black tracking-tighter text-slate-900 uppercase italic">
            {tenant.name} <span className="text-red-600">VNB</span>
          </h1>
          <p className="text-xs leading-relaxed text-slate-500">
            Hệ thống cửa hàng cầu lông hàng đầu Việt Nam. Chuyên cung cấp các sản phẩm chính hãng,
            uy tín và chất lượng.
          </p>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-bold text-slate-900 uppercase">Thông tin</h4>
          <ul className="space-y-2 text-xs text-slate-500">
            <li className="cursor-pointer hover:text-red-600">Về chúng tôi</li>
            <li className="cursor-pointer hover:text-red-600">Hệ thống cửa hàng</li>
            <li className="cursor-pointer hover:text-red-600">Tuyển dụng</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-bold text-slate-900 uppercase">Chính sách</h4>
          <ul className="space-y-2 text-xs text-slate-500">
            <li className="cursor-pointer hover:text-red-600">Chính sách bảo hành</li>
            <li className="cursor-pointer hover:text-red-600">Chính sách đổi trả</li>
            <li className="cursor-pointer hover:text-red-600">Chính sách bảo mật</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-bold text-slate-900 uppercase">Kết nối</h4>
          <div className="flex gap-4">
            <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white transition-transform hover:scale-110">
              Zalo
            </div>
            <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-red-600 text-[10px] font-black text-white transition-transform hover:scale-110">
              FB
            </div>
            <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-sky-500 text-[10px] font-black text-white transition-transform hover:scale-110">
              YT
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating Support */}
      <div className="fixed right-8 bottom-8 z-40 flex flex-col gap-4">
        <button className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0068FF] text-white shadow-2xl transition-all hover:scale-110">
          <span className="text-[10px] font-bold">Zalo</span>
        </button>
        <button className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-2xl transition-all hover:scale-110">
          <span className="text-[10px] font-bold">HOTLINE</span>
        </button>
      </div>
    </footer>
  )
}
