import { ShieldAlert } from 'lucide-react'

import { ErrorLayout } from './ErrorLayout'

export default function UnauthorizedPage() {
  return (
    <ErrorLayout
      code="401"
      title="Truy cập bị từ chối"
      description="Bạn không có quyền truy cập vào khu vực này. Vui lòng đăng nhập với tài khoản hợp lệ."
      icon={<ShieldAlert className="w-16 h-16 text-red-500/70" />}
    />
  )
}
