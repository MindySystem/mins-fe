import { ServerCrash } from 'lucide-react'

import { ErrorLayout } from './ErrorLayout'

export default function ServerErrorPage() {
  return (
    <ErrorLayout
      code="500"
      title="Lỗi máy chủ"
      description="Hệ thống đang gặp sự cố kỹ thuật tạm thời. Chúng tôi đang nỗ lực khắc phục, vui lòng thử lại sau."
      icon={<ServerCrash className="w-16 h-16 text-amber-500/70" />}
    />
  )
}
