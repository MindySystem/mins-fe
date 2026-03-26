import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Loader2, Lock, Mail } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { LoginRequest } from '@/features/auth/services/auth.service'
import { authService, loginSchema } from '@/features/auth/services/auth.service'
import { useAppStore, type User } from '@/store/useAppStore'

export function LoginForm() {
  const navigate = useNavigate()
  const setUser = useAppStore((state) => state.setUser)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginRequest) => {
    setLoading(true)
    setServerError('')
    try {
      const response = await authService.login(data)
      localStorage.setItem('access_token', response.token)
      setUser(response.user as User)
      navigate('/')
    } catch {
      setServerError('Tài khoản hoặc mật khẩu không chính xác')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-8 text-center">
        <p className="mb-2 text-3xl font-extrabold tracking-tight text-white">Đăng nhập</p>
        <p className="text-emerald-400">👋 Chào mừng bạn quay trở lại</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1">
          <label htmlFor="email" className="ml-1 text-sm font-medium text-slate-300">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute top-3 left-3 h-5 w-5 text-slate-500" />
            <Input
              id="email"
              {...register('email')}
              placeholder="hello@sportcenteros.vn"
              className="h-11 border-slate-700 bg-slate-800/50 pl-10 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500"
            />
          </div>
          {errors.email && <p className="mt-1 ml-1 text-xs text-red-400">{errors.email.message}</p>}
        </div>

        <div className="space-y-1">
          <div className="mb-1 ml-1 flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-slate-300">
              Mật khẩu
            </label>
            <Link to="/forgot-password" className="text-xs text-emerald-400 hover:text-emerald-300">
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute top-3 left-3 h-5 w-5 text-slate-500" />
            <Input
              id="password"
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
              Đăng nhập
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
