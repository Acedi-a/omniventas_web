import { apiFetch } from './http'

export type OwnerTenant = {
  id: number
  name: string
  slug: string
  apiKey: string
  businessType: number
  isActive: boolean
  createdAt: string
}

export type OwnerTenantStats = {
  tenantId: number
  name: string
  usersCount: number
  productsCount: number
  eventsCount: number
  ordersCount: number
  totalSales: number
}

export type OwnerUser = {
  id: number
  email: string
  role: number
  createdAt: string
}

export type CreateTenantPayload = {
  name: string
  businessType: number
}

export const fetchOwnerTenants = () => apiFetch<OwnerTenant[]>('/api/owner/tenants')

export const fetchOwnerTenantStats = (tenantId: number) =>
  apiFetch<OwnerTenantStats>(`/api/owner/tenants/${tenantId}/stats`)

export const fetchOwnerUsers = (tenantId: number) =>
  apiFetch<OwnerUser[]>(`/api/owner/tenants/${tenantId}/users`)

export const createOwnerUser = (tenantId: number, payload: { email: string; password: string; role: number }) =>
  apiFetch<OwnerUser>(`/api/owner/tenants/${tenantId}/users`, { method: 'POST', body: payload })

export const resetOwnerUserPassword = (tenantId: number, userId: number, newPassword: string) =>
  apiFetch<OwnerUser>(`/api/owner/tenants/${tenantId}/users/${userId}/reset-password`, {
    method: 'POST',
    body: { newPassword },
  })

export const createOwnerTenant = (payload: CreateTenantPayload) =>
  apiFetch<OwnerTenant>('/api/owner/tenants', { method: 'POST', body: payload })

export const updateOwnerTenantSlug = (tenantId: number, slug: string) =>
  apiFetch<OwnerTenant>(`/api/owner/tenants/${tenantId}/slug`, {
    method: 'PATCH',
    body: { slug },
  })

export const checkOwnerTenantSlug = (tenantId: number, slug: string) =>
  apiFetch<{ available: boolean; normalizedSlug: string }>(
    `/api/owner/tenants/${tenantId}/slug-availability?slug=${encodeURIComponent(slug)}`
  )
