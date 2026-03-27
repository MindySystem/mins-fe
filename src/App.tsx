import { Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'

export default function App() {
  return (
    <main className="bg-background min-h-screen">
      <Outlet />
      <Toaster position="top-center" richColors />
    </main>
  )
}
