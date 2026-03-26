import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Loader2, Lock, Mail, Phone, Store, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import type { RegisterRequest } from '../services/auth.service'
import { authService, registerSchema } from '../services/auth.service'

export function RegisterForm() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterRequest>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'shop_manager',
    },
  })

  const onSubmit = async (data: RegisterRequest) => {
    setLoading(true)
    setServerError('')
    try {
      await authService.register(data)
      navigate('/')
    } catch {
      setServerError('Có lỗi xảy ra, vui lòng thử lại!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-8 text-center">
        <h2 className="mb-2 text-3xl font-extrabold tracking-tight text-white">
          Đăng ký trung tâm
        </h2>
        <p className="text-emerald-400">Thiết lập hệ thống quản lý của bạn</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <label className="ml-1 text-sm font-medium text-slate-300">Họ và tên chủ sở hữu</label>
          <div className="relative">
            <User className="absolute top-3 left-3 h-5 w-5 text-slate-500" />
            <Input
              {...register('fullName')}
              placeholder="Nguyễn Văn A"
              className="h-11 border-slate-700 bg-slate-800/50 pl-10 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500"
            />
          </div>
          {errors.fullName && (
            <p className="mt-1 ml-1 text-xs text-red-400">{errors.fullName.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="ml-1 text-sm font-medium text-slate-300">Email</label>
            <div className="relative">
              <Mail className="absolute top-3 left-3 h-5 w-5 text-slate-500" />
              <Input
                {...register('email')}
                placeholder="hello@sportcenteros.vn"
                className="h-11 border-slate-700 bg-slate-800/50 pl-10 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500"
              />
            </div>
            {errors.email && (
              <p className="mt-1 ml-1 text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="ml-1 text-sm font-medium text-slate-300">Số điện thoại</label>
            <div className="relative">
              <Phone className="absolute top-3 left-3 h-5 w-5 text-slate-500" />
              <Input
                {...register('phone')}
                placeholder="0901234567"
                className="h-11 border-slate-700 bg-slate-800/50 pl-10 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500"
              />
            </div>
            {errors.phone && (
              <p className="mt-1 ml-1 text-xs text-red-400">{errors.phone.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <label className="ml-1 text-sm font-medium text-slate-300">
            Tên cửa hàng / Trung tâm
          </label>
          <div className="relative">
            <Store className="absolute top-3 left-3 h-5 w-5 text-slate-500" />
            <Input
              {...register('shopName')}
              placeholder="ProArena Sport Club"
              className="h-11 border-slate-700 bg-slate-800/50 pl-10 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500"
            />
          </div>
          {errors.shopName && (
            <p className="mt-1 ml-1 text-xs text-red-400">{errors.shopName.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="ml-1 text-sm font-medium text-slate-300">Mật khẩu</label>
          <div className="relative">
            <Lock className="absolute top-3 left-3 h-5 w-5 text-slate-500" />
            <Input
              type="password"
              {...register('password')}
              placeholder="••••••••"
              className="h-11 border-slate-700 bg-slate-800/50 pl-10 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500"
            />
          </div>
          {errors.password && (
            <p className="mt-1 ml-1 text-xs text-red-400">{errors.password.message}</p>
          )}
        </div>

        {serverError && <p className="text-center text-sm text-red-400">{serverError}</p>}

        <Button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-emerald-600 py-6 font-semibold text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:bg-emerald-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
        >
          {loading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <>
              Đăng Ký Ngay <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
