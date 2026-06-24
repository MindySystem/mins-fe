import { z } from 'zod'

import api from '@/services/api'
import type { SkillLevel, User } from '@/store/useAppStore'

// --- Schemas (dùng cho react-hook-form + zod) ---

export const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu cần ít nhất 6 ký tự'),
})

export const registerSchema = z.object({
  name: z.string().min(3, 'Tên cần ít nhất 3 ký tự').max(255),
  email: z.string().email('Email không đúng định dạng'),
  phone: z
    .string()
    .min(9, 'Số điện thoại không hợp lệ')
    .max(20)
    .optional()
    .or(z.literal('')),
  gender: z.enum(['male', 'female', 'other'], {
    message: 'Vui lòng chọn giới tính',
  }),
  skillLevel: z.enum(['beginner', 'casual', 'intermediate', 'advanced'], {
    message: 'Vui lòng chọn trình độ',
  }),
  password: z.string().min(6, 'Mật khẩu cần ít nhất 6 ký tự'),
})

export type LoginRequest = z.infer<typeof loginSchema>
export type RegisterRequest = z.infer<typeof registerSchema>

// --- Service ---

interface AuthResponse {
  user: User
  token: string
}

interface MeResponse {
  user: User
}

function extractErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const r = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })
      .response
    if (r?.data?.message) return r.data.message
    if (r?.data?.errors) {
      const first = Object.values(r.data.errors).flat()[0]
      if (first) return first
    }
  }
  if (err instanceof Error) return err.message
  return fallback
}

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const res = (await api.post('/auth/login', data)) as AuthResponse
      return res
    } catch (e) {
      throw new Error(extractErrorMessage(e, 'Đăng nhập thất bại'))
    }
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const res = (await api.post('/auth/register', data)) as AuthResponse
      return res
    } catch (e) {
      throw new Error(extractErrorMessage(e, 'Đăng ký thất bại'))
    }
  },

  async me(): Promise<MeResponse> {
    return (await api.get('/auth/me')) as MeResponse
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout')
    } catch {
      // Bỏ qua lỗi — client vẫn phải xoá token
    }
  },

  async updateProfile(data: {
    name: string
    phone?: string
    gender: 'male' | 'female' | 'other'
    skillLevel: SkillLevel
    password?: string
  }): Promise<{ message: string; user: User }> {
    try {
      const res = (await api.put('/profile', data)) as { message: string; user: User }
      return res
    } catch (e) {
      throw new Error(extractErrorMessage(e, 'Cập nhật hồ sơ thất bại'))
    }
  },
}
