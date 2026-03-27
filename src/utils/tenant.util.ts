export interface TenantConfig {
  id: string
  name: string
  slug: string
  logo?: string
  primaryColor: string
  secondaryColor: string
}

const MOCK_TENANTS: Record<string, TenantConfig> = {
  proarena: {
    id: 't1',
    name: 'ProArena Sport Club',
    slug: 'proarena',
    primaryColor: '#10b981', // Emerald 500
    secondaryColor: '#064e3b', // Emerald 900
  },
  vietnet: {
    id: 't2',
    name: 'VietNet Badminton Center',
    slug: 'vietnet',
    primaryColor: '#3b82f6', // Blue 500
    secondaryColor: '#1e3a8a', // Blue 900
  },
  default: {
    id: 'default',
    name: 'SportCenter OS',
    slug: 'default',
    primaryColor: '#0f172a', // Slate 900
    secondaryColor: '#334155', // Slate 700
  },
}

export const getTenantFromHostname = (): TenantConfig => {
  const hostname = window.location.hostname
  const searchParams = new URLSearchParams(window.location.search)

  // 1. Check URL Parameter (highest priority for dev testing)
  const tenantParam = searchParams.get('tenant')
  if (tenantParam && MOCK_TENANTS[tenantParam]) {
    return MOCK_TENANTS[tenantParam]
  }

  // 2. Check Subdomain (for production)
  // Example: proarena.mins-os.com -> proarena
  const parts = hostname.split('.')
  if (parts.length > 2) {
    const subdomain = parts[0]
    if (MOCK_TENANTS[subdomain]) {
      return MOCK_TENANTS[subdomain]
    }
  }

  // 3. Fallback to default
  return MOCK_TENANTS.default
}
