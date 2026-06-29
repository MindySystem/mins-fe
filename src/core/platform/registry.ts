import type { LucideIcon } from 'lucide-react'
import {
  BadgeCheck,
  Bike,
  Building2,
  CalendarDays,
  Compass,
  Grid2x2,
  LayoutGrid,
  Settings2,
  ShieldCheck,
  Smartphone,
  TrendingUp,
} from 'lucide-react'

import type { UserRole } from '@/store/useAppStore'

export type WorkspaceType = 'court' | 'team' | 'shop' | 'personal' | 'company'
export type PlatformAppKind = 'core' | 'module' | 'admin'
export type PlatformAppCode =
  | 'team_badminton'
  | 'court_management'
  | 'motorbike_shop'
  | 'admin_portal'

export type PlatformAction = {
  label: string
  href: string
  adminOnly?: boolean
}

export type PlatformUserSeed = {
  id: number
  name: string
  email: string
  role: UserRole
  title: string
}

export type PlatformWorkspace = {
  id: string
  name: string
  type: WorkspaceType
  owner: string
  status: 'active' | 'pending' | 'disabled'
  memberCount: number
  note: string
}

export type PlatformApp = {
  code: PlatformAppCode
  slug: string
  name: string
  description: string
  detail: string
  kind: PlatformAppKind
  category: string
  icon: LucideIcon
  accent: string
  workspaceTypes: WorkspaceType[] | 'all'
  defaultInstalledFor: WorkspaceType[] | 'all'
  adminOnly?: boolean
  openPath: string
  launchPath: string
  primaryAction: string
  highlights: string[]
  permissionNotes: string[]
  stats: string[]
  actions: PlatformAction[]
}

export const platformUsers: PlatformUserSeed[] = [
  {
    id: 1,
    name: 'Nguyen Minh',
    email: 'minh@platform.local',
    role: 'admin',
    title: 'System owner',
  },
  {
    id: 2,
    name: 'Le Thu',
    email: 'thu@platform.local',
    role: 'staff',
    title: 'Workspace operator',
  },
  {
    id: 3,
    name: 'Tran Kiet',
    email: 'kiet@platform.local',
    role: 'user',
    title: 'Team member',
  },
  {
    id: 4,
    name: 'Pham Ha',
    email: 'ha@platform.local',
    role: 'shop_manager',
    title: 'Shop lead',
  },
]

export const platformWorkspaces: PlatformWorkspace[] = [
  {
    id: 'court-hub',
    name: 'Central Court Hub',
    type: 'court',
    owner: 'Nguyen Minh',
    status: 'active',
    memberCount: 18,
    note: 'Phù hợp cho chủ sân, lễ tân và nhân viên vận hành booking.',
  },
  {
    id: 'team-smash',
    name: 'Smash Team Workspace',
    type: 'team',
    owner: 'Tran Kiet',
    status: 'active',
    memberCount: 24,
    note: 'Tối ưu cho team badminton, lịch đánh và chia phí buổi.',
  },
  {
    id: 'moto-pro',
    name: 'Moto Pro Workshop',
    type: 'shop',
    owner: 'Pham Ha',
    status: 'active',
    memberCount: 12,
    note: 'Nơi quản lý xe, tồn kho, đơn hàng và khách hàng.',
  },
  {
    id: 'personal-park',
    name: 'Personal Playbook',
    type: 'personal',
    owner: 'Le Thu',
    status: 'pending',
    memberCount: 5,
    note: 'Workspace cá nhân hoặc nhóm nhỏ cần app tối giản.',
  },
  {
    id: 'platform-admin',
    name: 'Platform Admin',
    type: 'company',
    owner: 'Nguyen Minh',
    status: 'active',
    memberCount: 8,
    note: 'Quản trị toàn bộ hệ thống, phân quyền và nhật ký thao tác.',
  },
]

export const platformApps: PlatformApp[] = [
  {
    code: 'team_badminton',
    slug: 'team-badminton',
    name: 'Team Badminton',
    description: 'Quản lý team, lịch đánh cầu, chi phí mỗi buổi và thanh toán.',
    detail:
      'Module này gom toàn bộ các màn hình về buổi cầu lông, người tham gia, lịch sử đăng ký, xác nhận thanh toán và quản trị buổi.',
    kind: 'module',
    category: 'Sport',
    icon: CalendarDays,
    accent: 'from-emerald-500 via-teal-500 to-cyan-600',
    workspaceTypes: ['team', 'personal', 'company'],
    defaultInstalledFor: ['team', 'personal', 'company'],
    openPath: '/apps/team-badminton',
    launchPath: '/sessions',
    primaryAction: 'Open module',
    highlights: ['Quản lý buổi', 'Chia chi phí', 'QR thanh toán'],
    permissionNotes: ['Team admin', 'Team member', 'Workspace members'],
    stats: ['Session scheduling', 'Member billing', 'Payment confirm'],
    actions: [
      { label: 'Open sessions', href: '/sessions' },
      { label: 'My sessions', href: '/my-sessions' },
      { label: 'Admin board', href: '/sessions/admin', adminOnly: true },
    ],
  },
  {
    code: 'court_management',
    slug: 'court-management',
    name: 'Court Management',
    description: 'Quản lý sân, booking, dịch vụ tại sân và lịch vận hành.',
    detail:
      'Module cho chủ sân và vận hành sân cầu lông, bao gồm quản lý sân, lịch booking, dịch vụ và luồng check-in.',
    kind: 'module',
    category: 'Business',
    icon: Building2,
    accent: 'from-sky-500 via-blue-500 to-indigo-600',
    workspaceTypes: ['court', 'company'],
    defaultInstalledFor: ['court', 'company'],
    openPath: '/apps/court-management',
    launchPath: '/court',
    primaryAction: 'Open module',
    highlights: ['Quản lý sân', 'Booking flow', 'Dịch vụ tại sân'],
    permissionNotes: ['Court owner', 'Court staff', 'Workspace managers'],
    stats: ['Court booking', 'Venue ops', 'Service billing'],
    actions: [
      { label: 'Open courts', href: '/court' },
      { label: 'Open services', href: '/service' },
      { label: 'Shuttlecocks', href: '/shuttlecocks', adminOnly: true },
    ],
  },
  {
    code: 'motorbike_shop',
    slug: 'motorbike-shop',
    name: 'Motorbike Shop',
    description: 'Quản lý xe, tồn kho, đơn hàng, khách hàng và doanh thu.',
    detail:
      'Module cho shop mô tô / xe máy với đầy đủ màn hình catalog, sản phẩm, đơn hàng, bảo dưỡng và khách hàng.',
    kind: 'module',
    category: 'Commerce',
    icon: Bike,
    accent: 'from-orange-500 via-amber-500 to-rose-500',
    workspaceTypes: ['shop', 'company'],
    defaultInstalledFor: ['shop', 'company'],
    openPath: '/apps/motorbike-shop',
    launchPath: '/shop-moto',
    primaryAction: 'Open module',
    highlights: ['Catalog xe', 'Đơn hàng', 'Bảo dưỡng'],
    permissionNotes: ['Shop owner', 'Shop staff', 'Customer'],
    stats: ['Inventory', 'Orders', 'Sales analytics'],
    actions: [
      { label: 'Open shop', href: '/shop-moto' },
      { label: 'Admin board', href: '/shop-moto-admin', adminOnly: true },
    ],
  },
  {
    code: 'admin_portal',
    slug: 'admin',
    name: 'Administrator Portal',
    description: 'Quản trị users, workspaces, apps và app subscriptions.',
    detail:
      'Portal dành cho admin hệ thống. Tại đây có thể xem dashboard, cấp quyền, cài app cho workspace và theo dõi trạng thái platform.',
    kind: 'admin',
    category: 'Admin',
    icon: ShieldCheck,
    accent: 'from-violet-500 via-fuchsia-500 to-pink-500',
    workspaceTypes: 'all',
    defaultInstalledFor: 'all',
    adminOnly: true,
    openPath: '/admin',
    launchPath: '/admin',
    primaryAction: 'Open admin portal',
    highlights: ['User management', 'Workspace management', 'App subscriptions'],
    permissionNotes: ['System admin only'],
    stats: ['System dashboard', 'Access control', 'Audit ready'],
    actions: [
      { label: 'Dashboard', href: '/admin' },
      { label: 'Users', href: '/admin/users' },
      { label: 'Workspaces', href: '/admin/workspaces' },
      { label: 'Apps', href: '/admin/apps' },
    ],
  },
]

export function getPlatformApp(code: PlatformAppCode) {
  return platformApps.find((app) => app.code === code)
}

export function getPlatformAppBySlug(slug: string) {
  return platformApps.find((app) => app.slug === slug || app.code === slug)
}

export function getWorkspaceById(workspaceId: string) {
  return platformWorkspaces.find((workspace) => workspace.id === workspaceId)
}

export function getAppInstalledDefault(workspaceType: WorkspaceType) {
  return platformApps
    .filter((app) => app.defaultInstalledFor === 'all' || app.defaultInstalledFor.includes(workspaceType))
    .map((app) => app.code)
}

export function getWorkspaceIdsByType(workspaceType: WorkspaceType) {
  return platformWorkspaces.filter((workspace) => workspace.type === workspaceType).map((workspace) => workspace.id)
}

export function getInitialWorkspaceId(tenantSlug: string) {
  if (tenantSlug === 'proarena') return 'court-hub'
  if (tenantSlug === 'vietnet') return 'team-smash'
  return 'team-smash'
}

export function getWorkspaceTypeLabel(type: WorkspaceType) {
  switch (type) {
    case 'court':
      return 'Court'
    case 'team':
      return 'Team'
    case 'shop':
      return 'Shop'
    case 'personal':
      return 'Personal'
    case 'company':
      return 'Company'
  }
}

export function getAppVisibleApps(role: UserRole, workspaceType: WorkspaceType, isSeedAdmin = role === 'admin') {
  return platformApps.filter((app) => {
    if (app.adminOnly && !isSeedAdmin) return false
    if (app.workspaceTypes === 'all') return true
    return app.workspaceTypes.includes(workspaceType)
  })
}

export const platformSummary = [
  {
    label: 'Core modules',
    value: '3',
    hint: 'Court, Team, Motorbike',
    icon: Grid2x2,
  },
  {
    label: 'Workspace-aware',
    value: '5',
    hint: 'Court, Team, Shop, Personal, Company',
    icon: Compass,
  },
  {
    label: 'Admin surfaces',
    value: '4',
    hint: 'Users, Workspaces, Apps, Access',
    icon: LayoutGrid,
  },
  {
    label: 'Ready for PWA',
    value: '100%',
    hint: 'Responsive shell and app grid',
    icon: Smartphone,
  },
]

export const platformStatusPills = [
  { label: 'Installed', icon: BadgeCheck },
  { label: 'Active', icon: TrendingUp },
  { label: 'Workspace app', icon: Settings2 },
]
