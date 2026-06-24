import { Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'

import { PageTitle } from '@/components/PageTitle'

export default function App() {
  return (
    <main className="bg-background min-h-screen">
      <PageTitle />
      <Outlet />
      <Toaster position="top-center" richColors />
    </main>
  )
}
