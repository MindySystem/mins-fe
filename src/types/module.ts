export type ModuleCategory = 'all' | 'shop' | 'court' | 'service' | 'crm' | 'admin'

export type ModuleItem = {
  title: string
  description: string
  category: Exclude<ModuleCategory, 'all'>
  badge: string
  icon: React.ComponentType<{ className?: string }>
  items: string[]
}
