import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string
  title: string
  description: string
}) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? (
        <p className="text-sm font-semibold tracking-[0.25em] text-emerald-600 uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl md:text-4xl">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-7 text-slate-600 sm:mt-4 sm:text-base sm:leading-8">
        {description}
      </p>
    </div>
  )
}

export function QuickStatCard({ value, label }: { value: string; label: string }) {
  return (
    <Card className="rounded-2xl border-slate-200 bg-white/90 shadow-sm sm:rounded-3xl">
      <CardContent className="p-4 sm:p-5">
        <p className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{value}</p>
        <p className="mt-1 text-xs text-slate-500 sm:text-sm">{label}</p>
      </CardContent>
    </Card>
  )
}

export function QuickActionCard({
  title,
  description,
  href,
  icon,
  tone = 'default',
}: {
  title: string
  description: string
  href?: string
  icon?: React.ReactNode
  tone?: 'default' | 'brand'
}) {
  const navigate = useNavigate()
  return (
    <Card
      className={cn(
        'rounded-2xl border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:rounded-3xl',
        tone === 'brand' && 'border-emerald-200 bg-emerald-50/40',
      )}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          {icon}
          {title}
        </CardTitle>
        <CardDescription className="text-sm leading-6">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="outline"
          className="w-full rounded-2xl sm:w-auto"
          onClick={() => navigate(href || '#')}
        >
          Mở nhanh
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}
