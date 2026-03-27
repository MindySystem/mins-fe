import { Search } from 'lucide-react'

import { ErrorLayout } from './ErrorLayout'

export default function NotFoundPage() {
  return (
    <ErrorLayout
      code="404"
      title="Không tìm thấy trang"
      description="Có vẻ như đường dẫn bạn đang truy cập không tồn tại hoặc đã bị gỡ bỏ."
      icon={<Search className="w-16 h-16 text-slate-400" />}
    />
  )
}
