import { ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface SectionHeaderProps {
  title: string
  link: string
  onNavigate: (l: string) => void
}

export function SectionHeader({ title, link, onNavigate }: SectionHeaderProps) {
  return (
    <div className="mb-8 flex items-center justify-between border-b border-slate-100 pb-4">
      <h2 className="relative text-xl font-black tracking-tight text-slate-900 uppercase italic">
        {title}
        <span className="absolute -bottom-4 left-0 h-1 w-20 bg-red-600" />
      </h2>
      <Button
        variant="ghost"
        className="text-xs font-bold text-red-600 hover:bg-red-50"
        onClick={() => onNavigate(link)}
      >
        Xem tất cả <ChevronRight className="ml-1 h-3 w-3" />
      </Button>
    </div>
  )
}

