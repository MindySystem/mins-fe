import { Link, Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-slate-950 lg:flex-row">
      <Link to="/" className="absolute z-999 m-10">
        <p className="mb-6 flex items-center text-5xl leading-tight font-black text-white">
          <span className="mr-2 inline-flex items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 backdrop-blur-md">
            <span className="text-3xl">🏸</span>
          </span>
          <span className="whitespace-nowrap">
            SportCenter <span className="text-emerald-400">OS</span>
          </span>
        </p>
      </Link>
      <div className="relative hidden items-center bg-emerald-950 lg:flex lg:w-1/2">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/auth-bg.png"
            alt="Tennis Court"
            className="h-full w-full object-cover opacity-40 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-emerald-950/60 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-950"></div>
        </div>

        <div className="relative z-10 m-10 mt-32 max-w-lg text-left">
          <p className="text-xl leading-relaxed text-slate-300">
            Nền tảng quản lý thông minh dành cho Shop Thể Thao và Trung tâm cho thuê sân chuyên
            nghiệp.
          </p>
        </div>
      </div>

      <div className="relative z-10 flex w-full flex-1 flex-col items-center justify-center p-8 sm:p-12 lg:p-24">
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-[100px]"></div>

        <div className="animate-in fade-in slide-in-from-bottom-8 z-10 w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/40 p-8 shadow-2xl backdrop-blur-xl duration-700 sm:p-10">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
