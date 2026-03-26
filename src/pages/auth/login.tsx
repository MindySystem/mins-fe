import { LoginForm } from '@/features/auth/components/LoginForm'

export default function LoginPage() {
  return (
    <>
      <LoginForm />

      <div className="mt-8 text-center text-sm text-slate-400">
        Bạn chưa có tài khoản?{' '}
        <a
          href="/auth/register"
          className="font-semibold text-emerald-400 transition-colors hover:text-emerald-300"
        >
          Đăng ký miễn phí
        </a>
      </div>
    </>
  )
}
