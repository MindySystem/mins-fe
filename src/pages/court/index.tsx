import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function CourtPage() {
  const navigate = useNavigate()
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-center p-6">
      <div className="bg-emerald-100 text-emerald-600 p-4 rounded-full mb-6 relative">
        <span className="text-4xl">🏸</span>
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Cấu hình Sân & Booking</h1>
      <p className="text-lg text-slate-600 mb-8 max-w-lg">
        Giao diện module quản lý sân thể thao và đặt sân đang được thiết kế. Vui lòng quay lại sau!
      </p>
      <Button onClick={() => navigate('/')} className="rounded-2xl bg-slate-900 text-white hover:bg-slate-800">
        <ArrowLeft className="w-5 h-5 mr-2" /> Quay về Dashboard
      </Button>
    </div>
  )
}
