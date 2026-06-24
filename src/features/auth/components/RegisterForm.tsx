import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Loader2, Lock, Mail, Phone, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/store/useAppStore'

import type { RegisterRequest } from '../services/auth.service'
import { authService, registerSchema } from '../services/auth.service'

export function RegisterForm() {
  const navigate = useNavigate()
  const setUser = useAppStore((state) => state.setUser)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterRequest>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterRequest) => {
    setLoading(true)
    setServerError('')
    try {
      const response = await authService.register(data)
      localStorage.setItem('access_token', response.token)
      setUser(response.user)
      navigate('/')
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Có lỗi xảy ra, vui lòng thử lại!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-8 text-center">
        <h2 className="mb-2 text-3xl font-extrabold tracking-tight text-white">Đăng ký tài khoản</h2>
        <p className="text-emerald-400">Tham gia cùng SportCenter OS</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <label className="ml-1 text-sm font-medium text-slate-300">Họ và tên</label>
          <div className="relative">
            <User className="absolute top-3 left-3 h-5 w-5 text-slate-500" />
            <Input
              {...register('name')}
              placeholder="Nguyễn Văn A"
              className="h-11 border-slate-700 bg-slate-800/50 pl-10 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500"
            />
          </div>
          {errors.name && <p className="mt-1 ml-1 text-xs text-red-400">{errors.name.message}</p>}
        </div>

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
          {errors.phone && <p className="mt-1 ml-1 text-xs text-red-400">{errors.phone.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="ml-1 text-sm font-medium text-slate-300">Giới tính</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'male', label: 'Nam' },
              { value: 'female', label: 'Nữ' },
              { value: 'other', label: 'Khác' },
            ].map((option) => (
              <label
                key={option.value}
                className={`flex cursor-pointer items-center justify-center rounded-xl border py-3 text-sm font-medium transition-all ${
                  watch('gender') === option.value
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                    : 'border-slate-700 bg-slate-800/30 text-slate-400 hover:bg-slate-800/50 hover:text-slate-300'
                }`}
              >
                <input
                  type="radio"
                  value={option.value}
                  {...register('gender')}
                  className="sr-only"
                />
                {option.label}
              </label>
            ))}
          </div>
          {errors.gender && (
            <p className="mt-1 ml-1 text-xs text-red-400">{errors.gender.message}</p>
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
