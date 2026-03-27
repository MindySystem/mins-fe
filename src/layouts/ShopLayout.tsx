import type { ReactNode } from 'react'

import { ShopFooter } from '@/components/layout/ShopFooter'
import { ShopHeader } from '@/components/layout/ShopHeader'

interface ShopLayoutProps {
  children: ReactNode
  searchQuery?: string
  onSearchChange?: (value: string) => void
}

export function ShopLayout({ children, searchQuery, onSearchChange }: ShopLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white font-sans">
      <ShopHeader searchQuery={searchQuery} onSearchChange={onSearchChange} />
      <main className="flex-1">{children}</main>
      <ShopFooter />
    </div>
  )
}
