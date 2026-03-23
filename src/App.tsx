import { Outlet } from 'react-router-dom'

export default function App() {
  return (
    <main className="bg-background min-h-screen">
      <Outlet />
    </main>
  )
}
