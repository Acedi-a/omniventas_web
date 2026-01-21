import { apiFetch, apiFetchText } from './http'

export type Tenant = {
  id: number
  name: string
  slug: string
  apiKey: string
  businessType: number
  isActive: boolean
  createdAt: string
  usersCount?: number
  ordersCount?: number
  paidOrdersCount?: number
  ordersLast30Days?: number
  totalSales?: number
  lastOrderAt?: string | null
  lastUserAt?: string | null
  lastEventAt?: string | null
  lastActivityAt?: string | null
}

export type TenantSummary = {
  totalTenants: number
  activeTenants: number
  inactiveTenants: number
  commerceTenants: number
  eventsTenants: number
  hybridTenants: number
  newLast7Days: number
  newLast30Days: number
  activeLast30Days: number
  paidOrders: number
  pendingOrders: number
  cancelledOrders: number
  totalSales: number
}

export type TenantStats = {
  tenantId: number
  name: string
  usersCount: number
  productsCount: number
  eventsCount: number
  ordersCount: number
  totalSales: number
  paidOrdersCount: number
  pendingOrdersCount: number
  cancelledOrdersCount: number
  activeCouponsCount: number
  lastOrderAt: string | null
  lastOrderTotal: number | null
  lastUserAt: string | null
  lastEventAt: string | null
}

export type TenantTrendPoint = {
  date: string
  count: number
}

export type RecentTenant = {
  id: number
  name: string
  slug?: string
  businessType: number
  isActive: boolean
  createdAt: string
}

export type TenantActivityItem = {
  type: string
  title: string
  description: string
  occurredAt: string
  amount: number | null
  referenceId: number | null
}

export type PagedResponse<T> = {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
}

export type CreateTenantPayload = {
  name: string
  businessType: number
}

export type TenantsQuery = {
  search?: string
  businessType?: number
  isActive?: boolean
  createdFrom?: string
  createdTo?: string
  minSales?: number
  maxSales?: number
  minOrders?: number
  maxOrders?: number
  activityDays?: number
  page?: number
  pageSize?: number
}

const buildQuery = (query: TenantsQuery) => {
  const params = new URLSearchParams()
  if (query.search) params.set('search', query.search)
  if (query.businessType) params.set('businessType', String(query.businessType))
  if (query.isActive !== undefined) params.set('isActive', String(query.isActive))
  if (query.createdFrom) params.set('createdFrom', query.createdFrom)
  if (query.createdTo) params.set('createdTo', query.createdTo)
  if (query.minSales !== undefined) params.set('minSales', String(query.minSales))
  if (query.maxSales !== undefined) params.set('maxSales', String(query.maxSales))
  if (query.minOrders !== undefined) params.set('minOrders', String(query.minOrders))
  if (query.maxOrders !== undefined) params.set('maxOrders', String(query.maxOrders))
  if (query.activityDays !== undefined) params.set('activityDays', String(query.activityDays))
  if (query.page) params.set('page', String(query.page))
  if (query.pageSize) params.set('pageSize', String(query.pageSize))
  const suffix = params.toString()
  return suffix ? `?${suffix}` : ''
}

export const fetchTenants = (query: TenantsQuery) =>
  apiFetch<PagedResponse<Tenant>>(`/api/admin/tenants${buildQuery(query)}`)

export const fetchTenantSummary = () => apiFetch<TenantSummary>('/api/admin/tenants/summary')

export const fetchTenantTrends = (days = 30) =>
  apiFetch<TenantTrendPoint[]>(`/api/admin/tenants/trends?days=${days}`)

export const fetchRecentTenants = (limit = 5) =>
  apiFetch<RecentTenant[]>(`/api/admin/tenants/recent?limit=${limit}`)

export const fetchTenantDetail = (tenantId: number) =>
  apiFetch<Tenant>(`/api/admin/tenants/${tenantId}`)

export const fetchTenantStats = (tenantId: number) =>
  apiFetch<TenantStats>(`/api/admin/tenants/${tenantId}/stats`)

export const fetchTenantActivity = (tenantId: number, limit = 8) =>
  apiFetch<TenantActivityItem[]>(`/api/admin/tenants/${tenantId}/activity?limit=${limit}`)

export const updateTenantStatus = (tenantId: number, isActive: boolean) =>
  apiFetch<Tenant>(`/api/admin/tenants/${tenantId}/status`, {
    method: 'PATCH',
    body: { isActive },
  })

export const regenerateTenantApiKey = (tenantId: number) =>
  apiFetch<Tenant>(`/api/admin/tenants/${tenantId}/regenerate-api-key`, {
    method: 'POST',
  })

export const createTenant = (payload: CreateTenantPayload) =>
  apiFetch<Tenant>('/api/admin/tenants', { method: 'POST', body: payload })

export const exportTenants = (query: TenantsQuery) =>
  apiFetchText(`/api/admin/tenants/export${buildQuery(query)}`)
