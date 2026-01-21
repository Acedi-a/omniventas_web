import { apiFetch } from './http'

export type Tenant = {
  id: number
  name: string
  apiKey: string
  businessType: number
  isActive: boolean
  createdAt: string
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
}

export type TenantStats = {
  tenantId: number
  name: string
  usersCount: number
  productsCount: number
  eventsCount: number
  ordersCount: number
  totalSales: number
}

export type TenantTrendPoint = {
  date: string
  count: number
}

export type RecentTenant = {
  id: number
  name: string
  businessType: number
  isActive: boolean
  createdAt: string
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
  page?: number
  pageSize?: number
}

const buildQuery = (query: TenantsQuery) => {
  const params = new URLSearchParams()
  if (query.search) params.set('search', query.search)
  if (query.businessType) params.set('businessType', String(query.businessType))
  if (query.isActive !== undefined) params.set('isActive', String(query.isActive))
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
