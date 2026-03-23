import { Badge } from '@/components/ui/badge'
import type { ModuleItem } from '@/types/module'

import ModuleCard from './moduleCard'

export function ModuleSection({
  title,
  description,
  data,
}: {
  title: string
  description: string
  data: ModuleItem[]
}) {
  if (data.length === 0) return null

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="text-2xl font-black tracking-tight text-slate-950">{title}</h3>
          <p className="mt-2 text-slate-600">{description}</p>
        </div>
        <Badge variant="secondary" className="w-fit rounded-full px-4 py-1.5 text-sm">
          {data.length} modules
        </Badge>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {data.map((module) => (
          <ModuleCard key={module.title} module={module} />
        ))}
      </div>
    </section>
  )
}
