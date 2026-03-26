import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu cần ít nhất 6 ký tự'),
})
export const registerSchema = z.object({
  fullName: z.string().min(3, 'Tên cần ít nhất 3 ký tự'),
  email: z.string().email('Email không đúng định dạng'),
  phone: z.string().min(10, 'Số điện thoại không hợp lệ').max(15, 'Số điện thoại quá dài'),
  shopName: z.string().min(3, 'Tên cửa hàng/trung tâm cần ít nhất 3 ký tự'),
  password: z.string().min(6, 'Mật khẩu cần ít nhất 6 ký tự'),
  role: z.enum(['shop_manager', 'staff']),
})

export type LoginRequest = z.infer<typeof loginSchema>
export type RegisterRequest = z.infer<typeof registerSchema>

export const authService = {
  register: async (data: RegisterRequest) => {
    await new Promise((resolve) => setTimeout(resolve, 1200))
    console.log('Registered User Data:', data)
    return { success: true, message: 'Đăng ký thành công', data }
  },
  login: async (data: LoginRequest) => {
    await new Promise((resolve) => setTimeout(resolve, 1200))
    if (data.email === 'error@test.com') {
      throw new Error('Invalid credentials')
    }
    console.log('Logged In User:', data)
    return { 
      success: true, 
      token: 'mock_token_123', 
      user: { id: '1', email: data.email, name: 'Shop Manager', role: 'shop_manager' } 
    }
  },
}
