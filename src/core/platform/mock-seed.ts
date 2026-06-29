export type MockCompany = {
  id: string
  parentId?: string
  name: string
  slug: string
  type: 'company' | 'branch'
  taxCode?: string
  ownerEmail: string
  status: 'active' | 'pending'
}

export type MockCompanyUser = {
  companyId: string
  email: string
  role: 'owner' | 'company_admin' | 'branch_admin' | 'manager' | 'staff'
  status: 'active' | 'pending'
}

export type MockWorkspaceSeed = {
  id: string
  companyId: string
  name: string
  slug: string
  type: 'court' | 'team' | 'shop' | 'company'
  ownerEmail: string
  installedApps: string[]
  memberEmails: string[]
}

export const mockCompanies: MockCompany[] = [
  {
    id: 'company-sporthub',
    name: 'SportHub Team',
    slug: 'sporthub-team',
    type: 'company',
    taxCode: '0310000001',
    ownerEmail: 'owner@sporthub.vn',
    status: 'active',
  },
  {
    id: 'company-court-abc',
    name: 'Sân Cầu ABC',
    slug: 'san-cau-abc',
    type: 'company',
    taxCode: '0310000002',
    ownerEmail: 'lethu@sancauabc.vn',
    status: 'active',
  },
  {
    id: 'company-court-abc-q7',
    parentId: 'company-court-abc',
    name: 'Sân Cầu ABC - Chi nhánh Quận 7',
    slug: 'san-cau-abc-q7',
    type: 'branch',
    ownerEmail: 'manager-q7@sancauabc.vn',
    status: 'active',
  },
  {
    id: 'company-court-abc-thu-duc',
    parentId: 'company-court-abc',
    name: 'Sân Cầu ABC - Chi nhánh Thủ Đức',
    slug: 'san-cau-abc-thu-duc',
    type: 'branch',
    ownerEmail: 'staff@sancauabc.vn',
    status: 'active',
  },
  {
    id: 'company-moto-pro',
    name: 'Moto Pro Workshop',
    slug: 'moto-pro-workshop',
    type: 'company',
    ownerEmail: 'owner@motopro.vn',
    status: 'pending',
  },
]

export const mockCompanyUsers: MockCompanyUser[] = [
  { companyId: 'company-sporthub', email: 'owner@sporthub.vn', role: 'owner', status: 'active' },
  { companyId: 'company-court-abc', email: 'lethu@sancauabc.vn', role: 'company_admin', status: 'active' },
  { companyId: 'company-court-abc', email: 'staff@sancauabc.vn', role: 'staff', status: 'active' },
  { companyId: 'company-court-abc-q7', email: 'manager-q7@sancauabc.vn', role: 'branch_admin', status: 'active' },
  { companyId: 'company-court-abc-thu-duc', email: 'staff@sancauabc.vn', role: 'staff', status: 'active' },
  { companyId: 'company-moto-pro', email: 'owner@motopro.vn', role: 'owner', status: 'pending' },
]

export const mockWorkspaceSeeds: MockWorkspaceSeed[] = [
  {
    id: 'workspace-court-abc-q7',
    companyId: 'company-court-abc-q7',
    name: 'Sân Cầu ABC Quận 7',
    slug: 'san-cau-abc-q7',
    type: 'court',
    ownerEmail: 'manager-q7@sancauabc.vn',
    installedApps: ['court_management'],
    memberEmails: ['manager-q7@sancauabc.vn', 'staff@sancauabc.vn'],
  },
  {
    id: 'workspace-court-abc',
    companyId: 'company-court-abc',
    name: 'Sân Cầu ABC',
    slug: 'san-cau-abc',
    type: 'court',
    ownerEmail: 'admin@sancauabc.vn',
    installedApps: ['court_management'],
    memberEmails: ['lethu@sancauabc.vn', 'staff@sancauabc.vn'],
  },
  {
    id: 'workspace-team-smash',
    companyId: 'company-sporthub',
    name: 'Team Smash',
    slug: 'team-smash',
    type: 'team',
    ownerEmail: 'owner@sporthub.vn',
    installedApps: ['team_badminton'],
    memberEmails: ['member@sporthub.vn', 'captain@sporthub.vn'],
  },
  {
    id: 'workspace-moto-pro',
    companyId: 'company-moto-pro',
    name: 'Moto Pro',
    slug: 'moto-pro',
    type: 'shop',
    ownerEmail: 'owner@motopro.vn',
    installedApps: ['motorbike_shop'],
    memberEmails: ['sales@motopro.vn', 'support@motopro.vn'],
  },
  {
    id: 'workspace-platform-admin',
    companyId: 'company-sporthub',
    name: 'Platform Admin',
    slug: 'platform-admin',
    type: 'company',
    ownerEmail: 'owner@sporthub.vn',
    installedApps: ['admin_portal', 'court_management', 'team_badminton', 'motorbike_shop'],
    memberEmails: ['admin@sporthub.vn'],
  },
]
