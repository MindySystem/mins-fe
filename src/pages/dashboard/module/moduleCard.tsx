import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getBadgeClassName } from '@/data/data'
import type { ModuleItem } from '@/types/module'

export default function ModuleCard({ module }: { module: ModuleItem }) {
  const Icon = module.icon

  return (
    <Card className="group h-full rounded-[28px] border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition group-hover:bg-slate-900 group-hover:text-white">
            <Icon className="h-5 w-5" />
          </div>
          <Badge variant="outline" className={getBadgeClassName(module.badge)}>
            {module.badge}
          </Badge>
        </div>
        <div>
          <CardTitle className="text-xl text-slate-950">{module.title}</CardTitle>
          <CardDescription className="mt-2 leading-7 text-slate-600">
            {module.description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {module.items.map((item) => (
            <div key={item} className="flex items-start gap-3 text-sm text-slate-600">
              <div className="mt-1.5 h-2 w-2 rounded-full bg-emerald-500" />
              <span>{item}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 pt-2">
          <Button className="rounded-2xl bg-slate-900 hover:bg-slate-800">Xem chi tiết</Button>
          <Button variant="ghost" className="rounded-2xl text-slate-700" onClick={() => { if (module.href) window.location.href = module.href }}>
            Mở module
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
