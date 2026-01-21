import { apiFetch } from './http'

export type TenantProfile = {
  id: number
  name: string
  apiKey: string
  businessType: number
  isActive: boolean
  createdAt: string
}

export const fetchTenantProfile = () => apiFetch<TenantProfile>('/api/client/tenant/profile')

export const regenerateApiKey = () =>
  apiFetch<TenantProfile>('/api/client/tenant/regenerate-api-key', { method: 'POST' })
