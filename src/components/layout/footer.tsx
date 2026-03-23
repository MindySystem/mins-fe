export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
              SC
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Sport Commerce Platform</p>
              <h4 className="text-lg font-bold text-slate-950">SportCenter OS</h4>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Hệ thống quản lý bán hàng, cho thuê sân và dịch vụ tại sân dành cho các trung tâm thể
            thao hiện đại.
          </p>
        </div>

        <div>
          <h5 className="font-semibold text-slate-950">Sản phẩm</h5>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li>POS bán hàng</li>
            <li>Quản lý sân</li>
            <li>Booking</li>
            <li>Order tại sân</li>
          </ul>
        </div>

        <div>
          <h5 className="font-semibold text-slate-950">Tài nguyên</h5>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li>Bảng giá</li>
            <li>Demo</li>
            <li>Hướng dẫn</li>
            <li>Hỗ trợ</li>
          </ul>
        </div>

        <div>
          <h5 className="font-semibold text-slate-950">Liên hệ</h5>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li>Hotline: 0900 000 000</li>
            <li>Email: hello@sportcenteros.vn</li>
            <li>TP. Hồ Chí Minh</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-200 py-3 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} SportCenter OS. All rights reserved.
      </div>
    </footer>
  )
}
