import { RegisterForm } from '@/features/auth/components/RegisterForm'

export default function RegisterPage() {
  return (
    <>
      <RegisterForm />

      <div className="mt-8 text-center text-sm text-slate-400">
        Bạn đã có tài khoản?{' '}
        <a
          href="/auth/login"
          className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          Đăng nhập
        </a>
      </div>
    </>
  )
}
