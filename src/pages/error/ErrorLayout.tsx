import { type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Home } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/useAppStore'

interface Props {
  code: string
  title: string
  description: string
  icon: ReactNode
}

export function ErrorLayout({ code, title, description, icon }: Props) {
  const navigate = useNavigate()
  const { tenant } = useAppStore()

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-50 font-sans">
      {/* Background Gradients */}
      <div
        className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full opacity-20 blur-[120px]"
        style={{ backgroundColor: tenant.primaryColor }}
      />
      <div
        className="absolute right-[-10%] bottom-[-10%] h-[40%] w-[40%] rounded-full opacity-20 blur-[120px]"
        style={{ backgroundColor: tenant.primaryColor }}
      />

      <div className="relative z-10 w-full max-w-2xl px-6 text-center">
        <div className="mb-8 flex justify-center">
          <div className="animate-in zoom-in rounded-3xl border border-white/40 bg-white/40 p-6 shadow-2xl backdrop-blur-xl duration-700">
            {icon}
          </div>
        </div>

        <h1 className="mb-2 text-9xl font-black tracking-tighter text-slate-900 opacity-10 select-none">
          {code}
        </h1>

        <h2 className="-mt-12 mb-4 text-4xl font-extrabold tracking-tight text-slate-900">
          {title}
        </h2>

        <p className="mx-auto mb-10 max-w-md text-lg leading-relaxed text-slate-500">
          {description}
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="h-auto rounded-2xl px-8 py-3 font-bold text-slate-600 hover:bg-white/50"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Quay lại
          </Button>

          <Button
            onClick={() => navigate('/')}
            className="h-auto rounded-2xl px-10 py-3 font-black shadow-2xl shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
            style={{ backgroundColor: tenant.primaryColor }}
          >
            <Home className="mr-2 h-5 w-5" />
            Về Trang chủ
          </Button>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-black tracking-widest text-slate-400 uppercase opacity-30">
        SportCenter OS • Premium Experience
      </div>
    </div>
  )
}
