import { z } from 'zod'

import api from './api'

export type PlatformAppStatus = 'installed' | 'available'
export type PlatformAppReleaseStatus = 'draft' | 'released' | 'maintenance' | 'disabled'

export type PlatformAppDto = {
  id?: number | string
  code: string
  slug: string
  name: string
  description: string
  category: string
  icon?: string
  accent?: string
  rating?: string
  reviews_count?: number
  users_count?: string | number
  status?: PlatformAppStatus
  release_status?: PlatformAppReleaseStatus
  open_path?: string
  launch_path?: string
  customer_entry_path?: string | null
  source_path?: string | null
  route_exists?: boolean
  source_status?: 'found' | 'missing' | 'unchecked' | string
  last_scanned_at?: string | null
  admin_only?: boolean
}

export type PlatformWorkspaceDto = {
  id: number | string
  name: string
  slug?: string
  type: 'court' | 'team' | 'shop' | 'personal' | 'company' | string
  owner_email?: string | null
  status: 'active' | 'pending' | 'disabled' | string
}

export type PlatformHomeDto = {
  user: unknown
  workspace: PlatformWorkspaceDto | null
  installed_apps: PlatformAppDto[]
  suggested_apps: PlatformAppDto[]
  notifications_count: number
}

export type PlatformAppStoreDto = {
  workspace: PlatformWorkspaceDto | null
  categories: string[]
  tabs: {
    all: number
    installed: number
    available: number
  }
  apps: PlatformAppDto[]
}

export type OpenPlatformAppDto = {
  can_open: boolean
  app: PlatformAppDto
  launch_path: string
}

export const platformSetupSchema = z.object({
  workspaceName: z
    .string()
    .trim()
    .min(2, 'Tên workspace cần ít nhất 2 ký tự')
    .max(120, 'Tên workspace tối đa 120 ký tự'),
  workspaceSlug: z
    .string()
    .trim()
    .min(2, 'Slug cần ít nhất 2 ký tự')
    .max(80, 'Slug tối đa 80 ký tự')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug chỉ gồm chữ thường, số và dấu gạch ngang'),
  companyName: z
    .string()
    .trim()
    .min(2, 'Tên công ty cần ít nhất 2 ký tự')
    .max(160, 'Tên công ty tối đa 160 ký tự'),
  companySlug: z
    .string()
    .trim()
    .min(2, 'Slug công ty cần ít nhất 2 ký tự')
    .max(80, 'Slug công ty tối đa 80 ký tự')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug công ty chỉ gồm chữ thường, số và dấu gạch ngang'),
  taxCode: z.string().trim().max(32, 'Mã số thuế tối đa 32 ký tự').optional().or(z.literal('')),
  contactEmail: z.string().trim().email('Email liên hệ không hợp lệ'),
  userRole: z.enum(['owner', 'workspace_admin', 'company_admin'], {
    message: 'Vui lòng chọn vai trò người dùng',
  }),
})

export type PlatformSetupRequest = z.infer<typeof platformSetupSchema>

export type PlatformSetupResponse = {
  message: string
  company: {
    id: number | string
    name: string
    slug: string
    type: string
    tax_code?: string | null
    owner_email?: string | null
    status: string
  }
  workspace: {
    id: number | string
    name: string
    slug: string
    type: 'court' | 'team' | 'shop' | 'company'
    owner_email?: string | null
    status: 'active' | 'pending' | 'disabled'
  }
  installed_apps?: PlatformAppDto[]
  user_role: string
}

export type PlatformCustomerServiceDto = {
  workspace_id: number | string
  workspace_name: string
  workspace_slug: string
  company_id?: number | string | null
  company_name?: string | null
  company_slug?: string | null
  app_code: string
  app_name: string
  category: string
  customer_entry_path: string
}

export type PlatformCustomerServicesDto = {
  services: PlatformCustomerServiceDto[]
}

function extractErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const response = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })
      .response

    if (response?.data?.message) return response.data.message
    if (response?.data?.errors) {
      const first = Object.values(response.data.errors).flat()[0]
      if (first) return first
    }
  }

  if (err instanceof Error) return err.message

  return fallback
}

export const platformApi = {
  home: () => api.get<PlatformHomeDto, PlatformHomeDto>('/platform/home'),
  appStore: (params?: { query?: string; category?: string; status?: PlatformAppStatus | 'all' }) =>
    api.get<PlatformAppStoreDto, PlatformAppStoreDto>('/platform/app-store', { params }),
  appDetail: (slug: string) => api.get<PlatformAppDto, PlatformAppDto>(`/platform/apps/${slug}`),
  installApp: (workspaceId: string, appCode: string) =>
    api.post<PlatformAppDto, PlatformAppDto>(`/platform/workspaces/${workspaceId}/apps/${appCode}/install`),
  uninstallApp: (workspaceId: string, appCode: string) =>
    api.delete<{ message: string }, { message: string }>(`/platform/workspaces/${workspaceId}/apps/${appCode}/uninstall`),
  openApp: (workspaceId: string, appCode: string) =>
    api.post<OpenPlatformAppDto, OpenPlatformAppDto>(`/platform/workspaces/${workspaceId}/apps/${appCode}/open`),
  customerServices: () =>
    api.get<PlatformCustomerServicesDto, PlatformCustomerServicesDto>('/platform/customer/services'),
  adminApps: () => api.get<{ apps: PlatformAppDto[] }, { apps: PlatformAppDto[] }>('/platform/admin/apps'),
  reloadApps: () =>
    api.post<{ message: string; synced: PlatformAppDto[] }, { message: string; synced: PlatformAppDto[] }>(
      '/platform/admin/apps/reload',
    ),
  updateAdminApp: (app: string, data: Partial<PlatformAppDto>) =>
    api.patch<PlatformAppDto, PlatformAppDto>(`/platform/admin/apps/${app}`, data),
  async setup(data: PlatformSetupRequest): Promise<PlatformSetupResponse> {
    try {
      return await api.post<PlatformSetupResponse, PlatformSetupResponse>('/platform/setup', data)
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Thiết lập doanh nghiệp thất bại'))
    }
  },
}
