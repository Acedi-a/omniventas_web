import { apiFetch } from './http'

export type TenantLoginPayload = {
  tenantSlug: string
  email: string
  password: string
}

export type TenantLoginResponse = {
  token: string
  expiresAt: string
  tenantId: number
  tenantName: string
  apiKey: string
  role: number
}

const persistAuth = (response: TenantLoginResponse) => {
  localStorage.setItem('tenant_token', response.token)
  localStorage.setItem('tenant_token_expires', response.expiresAt)
  localStorage.setItem('tenant_id', String(response.tenantId))
  localStorage.setItem('tenant_name', response.tenantName)
  localStorage.setItem('tenant_role', String(response.role))
  localStorage.setItem('tenant_api_key', response.apiKey)
  localStorage.setItem('tenant_slug', response.tenantSlug)
}

export const loginTenant = async (payload: TenantLoginPayload) => {
  const response = await apiFetch<TenantLoginResponse>('/api/tenant/login', {
    method: 'POST',
    body: payload,
    auth: false,
  })

  persistAuth(response)
  return response
}

export const requestTenantPasswordReset = async (payload: { tenantSlug: string; email: string }) =>
  apiFetch<{ token: string; expiresAt: string }>('/api/tenant/password/forgot', {
    method: 'POST',
    body: payload,
    auth: false,
  })

export const resetTenantPassword = async (payload: { token: string; newPassword: string }) =>
  apiFetch<{ success: boolean }>('/api/tenant/password/reset', {
    method: 'POST',
    body: payload,
    auth: false,
  })

export const logoutTenant = () => {
  localStorage.removeItem('tenant_token')
  localStorage.removeItem('tenant_token_expires')
  localStorage.removeItem('tenant_id')
  localStorage.removeItem('tenant_name')
  localStorage.removeItem('tenant_role')
}
