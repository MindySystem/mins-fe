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
    <div className="min-h-screen bg-white font-sans flex flex-col">
      <ShopHeader searchQuery={searchQuery} onSearchChange={onSearchChange} />
      <main className="flex-1">
        {children}
      </main>
      <ShopFooter />
    </div>
  )
}
