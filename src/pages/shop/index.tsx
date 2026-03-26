import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function ShopPage() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-center p-6">
      <div className="bg-blue-100 text-blue-600 p-4 rounded-full mb-6 relative">
        <span className="text-4xl">🛍️</span>
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">POS & Bán Hàng</h1>
      <p className="text-lg text-slate-600 mb-8 max-w-lg">
        Giao diện module bán hàng, thanh toán và giỏ hàng đang được cấu trúc. Trải nghiệm sẽ sớm ra mắt!
      </p>
      <Button onClick={() => navigate('/')} className="rounded-2xl bg-slate-900 text-white hover:bg-slate-800">
        <ArrowLeft className="w-5 h-5 mr-2" /> Quay về Dashboard
      </Button>
    </div>
  )
}
