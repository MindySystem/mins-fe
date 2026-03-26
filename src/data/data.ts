import {
  BarChart3,
  CalendarRange,
  CreditCard,
  LayoutGrid,
  Package,
  Settings,
  ShoppingBag,
  Store,
  Users,
  UtensilsCrossed,
} from 'lucide-react'

import type { ModuleCategory, ModuleItem } from '@/types/module'

export const quickStats = [
  { label: 'Modules', value: '10+' },
  { label: 'Business Models', value: '2' },
  { label: 'Unified Platform', value: '1' },
]

export const modules: ModuleItem[] = [
  {
    title: 'Bán hàng / POS',
    description: 'Bán hàng tại quầy, xử lý đơn nhanh và hỗ trợ nhiều hình thức thanh toán.',
    category: 'shop',
    badge: 'Shop',
    icon: ShoppingBag,
    items: ['Tạo đơn bán hàng', 'Quét sản phẩm', 'Áp dụng giảm giá', 'In hóa đơn'],
    href: '/shop',
  },
  {
    title: 'Sản phẩm & Kho',
    description: 'Quản lý hàng hóa thể thao, biến thể SKU, nhập xuất và cảnh báo tồn kho.',
    category: 'shop',
    badge: 'Shop',
    icon: Package,
    items: ['Danh mục sản phẩm', 'Biến thể SKU', 'Kiểm kho', 'Nhập / xuất kho'],
    href: '/shop/inventory',
  },
  {
    title: 'Quản lý sân',
    description: 'Thiết lập sân cầu lông, pickleball, tennis và theo dõi trạng thái hoạt động.',
    category: 'court',
    badge: 'Court',
    icon: Store,
    items: ['Danh sách sân', 'Loại sân', 'Trạng thái sân', 'Bảo trì sân'],
    href: '/court',
  },
  {
    title: 'Booking sân',
    description: 'Xem lịch sân, tạo booking, đổi giờ, check-in và check-out trong một flow.',
    category: 'court',
    badge: 'Court',
    icon: CalendarRange,
    items: ['Lịch sân', 'Đặt sân', 'Check-in', 'Hủy / đổi booking'],
    href: '/court/booking',
  },
  {
    title: 'Order tại sân',
    description: 'Nhận order đồ ăn thức uống từ khách đang chơi và giao trực tiếp tới sân.',
    category: 'service',
    badge: 'F&B',
    icon: UtensilsCrossed,
    items: ['Menu món', 'Tạo order theo sân', 'Trạng thái giao món', 'Gộp bill dịch vụ'],
    href: '/service',
  },
  {
    title: 'Hóa đơn & Thanh toán',
    description: 'Quản lý thanh toán cho bán hàng, booking và dịch vụ tại sân trên cùng hệ thống.',
    category: 'service',
    badge: 'Billing',
    icon: CreditCard,
    items: ['Hóa đơn bán hàng', 'Hóa đơn booking', 'Gộp hóa đơn', 'Lịch sử thanh toán'],
    href: '/service/billing',
  },
  {
    title: 'Khách hàng',
    description: 'Lưu thông tin khách mua hàng, đặt sân và lịch sử giao dịch tập trung.',
    category: 'crm',
    badge: 'CRM',
    icon: Users,
    items: ['Hồ sơ khách hàng', 'Lịch sử mua hàng', 'Lịch sử booking', 'Tích điểm'],
    href: '/crm/customers',
  },
  {
    title: 'Báo cáo & Thống kê',
    description: 'Theo dõi doanh thu, tỷ lệ lấp đầy sân, top sản phẩm và hiệu suất kinh doanh.',
    category: 'crm',
    badge: 'Reports',
    icon: BarChart3,
    items: ['Doanh thu theo ngày', 'Báo cáo sân', 'Top sản phẩm', 'Khung giờ đông khách'],
    href: '/crm/reports',
  },
  {
    title: 'Người dùng & Phân quyền',
    description: 'Phân quyền theo vai trò như admin, thu ngân, lễ tân, phục vụ và quản lý.',
    category: 'admin',
    badge: 'Admin',
    icon: LayoutGrid,
    items: ['Tài khoản nhân viên', 'Role / permission', 'Nhật ký thao tác', 'Giới hạn truy cập'],
    href: '/admin/users',
  },
  {
    title: 'Cấu hình hệ thống',
    description: 'Thiết lập chi nhánh, module, giá sân, thanh toán và chính sách vận hành.',
    category: 'admin',
    badge: 'Settings',
    icon: Settings,
    items: ['Chi nhánh', 'Bật / tắt module', 'Cấu hình giá', 'Thanh toán'],
    href: '/admin/settings',
  },
]

export const categoryOptions: { label: string; value: ModuleCategory }[] = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Shop', value: 'shop' },
  { label: 'Court', value: 'court' },
  { label: 'F&B / Billing', value: 'service' },
  { label: 'CRM / Reports', value: 'crm' },
  { label: 'Admin', value: 'admin' },
]

export const groupedSections: {
  title: string
  description: string
  categories: Exclude<ModuleCategory, 'all'>[]
}[] = [
  {
    title: 'Vận hành kinh doanh',
    description: 'Các module phục vụ bán hàng, hàng hóa và thanh toán hàng ngày.',
    categories: ['shop', 'service'],
  },
  {
    title: 'Vận hành sân',
    description: 'Các module kiểm soát sân, lịch đặt, check-in và dịch vụ tại sân.',
    categories: ['court'],
  },
  {
    title: 'Quản trị & tăng trưởng',
    description: 'Các module hỗ trợ khách hàng, báo cáo, người dùng và cấu hình hệ thống.',
    categories: ['crm', 'admin'],
  },
]

export function getBadgeClassName(badge: string) {
  switch (badge) {
    case 'Shop':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'Court':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'F&B':
      return 'bg-orange-50 text-orange-700 border-orange-200'
    case 'Billing':
      return 'bg-slate-100 text-slate-700 border-slate-200'
    case 'CRM':
      return 'bg-violet-50 text-violet-700 border-violet-200'
    case 'Reports':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200'
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200'
  }
}
