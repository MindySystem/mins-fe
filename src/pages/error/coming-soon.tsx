import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Bell,Clock } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function ComingSoonPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <div className="relative mb-8">
        <div className="absolute -inset-4 rounded-full bg-red-600/10 blur-2xl animate-pulse" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-xl ring-1 ring-slate-100 italic">
          <Clock className="h-10 w-10 text-red-600" />
        </div>
      </div>

      <div className="max-w-md space-y-4">
        <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase italic">
          Coming <span className="text-red-600">Soon</span>
        </h1>
        <p className="text-slate-500 leading-relaxed text-[15px]">
          Chúng tôi đang nỗ lực hoàn thiện tính năng này để mang lại trải nghiệm tốt nhất cho bạn. 
          Vui lòng quay lại sau!
        </p>
      </div>

      <div className="mt-12 flex flex-col sm:flex-row items-center gap-4">
        <Button 
          variant="outline" 
          className="h-12 border-slate-200 px-8 font-bold text-slate-700 uppercase tracking-wider hover:bg-white"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Về trang chủ
        </Button>
        <Button 
          className="h-12 bg-red-600 px-8 font-bold text-white uppercase tracking-wider hover:bg-red-700"
        >
          <Bell className="mr-2 h-4 w-4" />
          Thông báo cho tôi
        </Button>
      </div>

      <div className="mt-24 text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">
        SportCenter OS &bull; VNB Premium
      </div>
    </div>
  )
}
