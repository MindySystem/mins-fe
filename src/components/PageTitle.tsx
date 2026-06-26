import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const appName = import.meta.env.VITE_APP_NAME || 'SportCenter OS'

const titleMap: Record<string, string> = {
  '/': 'Dashboard',
  '/auth/login': 'Đăng nhập',
  '/auth/register': 'Đăng ký',
  '/sessions': 'Danh sách buổi cầu lông',
  '/sessions/admin': 'Quản trị sessions',
  '/sessions/new': 'Tạo buổi cầu lông',
  '/my-sessions': 'Buổi của tôi',
  '/profile': 'Hồ sơ cá nhân',
  '/shuttlecocks': 'Quản lý loại cầu',
  '/shop': 'Cửa hàng',
  '/shop/products': 'Sản phẩm',
  '/shop/sale': 'Khuyến mãi',
  '/shop/news': 'Tin tức',
  '/shop/guide': 'Hướng dẫn mua hàng',
  '/shop/contact': 'Liên hệ',
  '/shop-moto': 'Shop Moto',
  '/shop-moto/catalog-moto': 'Catalog xe moto',
  '/shop-moto/catalog-accessory': 'Catalog phụ kiện',
  '/shop-moto/cart': 'Giỏ hàng moto',
  '/shop-moto/checkout': 'Thanh toán moto',
  '/shop-moto/profile': 'Hồ sơ Shop Moto',
  '/shop-moto/maintenance': 'Bảo dưỡng moto',
  '/shop-moto/maintenance-history': 'Lịch sử bảo dưỡng moto',
  '/shop-moto/my-order': 'Đơn hàng moto',
  '/shop-moto/my-moto': 'Xe của tôi',
  '/shop-moto/rescue': 'Cứu hộ moto',
  '/shop-moto/vehicle-registration': 'Đăng ký xe moto',
  '/shop-moto/vehicle-registration-history': 'Lịch sử đăng ký xe moto',
  '/shop-moto-admin': 'Quản trị Shop Moto',
  '/court': 'Quản lý sân',
  '/service': 'Dịch vụ',
  '/401': 'Không có quyền truy cập',
  '/500': 'Lỗi hệ thống',
}

function getPageTitle(pathname: string) {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/'

  if (titleMap[normalizedPath]) return titleMap[normalizedPath]

  if (/^\/sessions\/[^/]+\/edit$/.test(normalizedPath)) return 'Chỉnh sửa buổi cầu lông'
  if (/^\/sessions\/[^/]+\/manage$/.test(normalizedPath)) return 'Quản lý buổi cầu lông'
  if (/^\/sessions\/[^/]+$/.test(normalizedPath)) return 'Chi tiết buổi cầu lông'
  if (/^\/shop\/products\/[^/]+$/.test(normalizedPath)) return 'Chi tiết sản phẩm'
  if (/^\/shop-moto\/product\/[^/]+$/.test(normalizedPath)) return 'Chi tiết xe moto'
  if (/^\/shop-moto\/accessory\/[^/]+$/.test(normalizedPath)) return 'Chi tiết phụ kiện moto'
  if (normalizedPath.startsWith('/shop-moto-admin/')) return 'Quản trị Shop Moto'
  if (normalizedPath.startsWith('/court/')) return 'Quản lý sân'
  if (normalizedPath.startsWith('/service/')) return 'Dịch vụ'

  return 'OS'
}

type PageTitleProps = {
  title?: string
}

export function PageTitle({ title }: PageTitleProps) {
  const location = useLocation()

  useEffect(() => {
    const pageTitle = title || getPageTitle(location.pathname)
    document.title = pageTitle ? `${pageTitle} | ${appName}` : appName
  }, [location.pathname, title])

  return null
}
