import { apiFetch } from './http'

export type ClientRegisterPayload = {
  tenantName: string
  businessType: number
  adminEmail: string
  password: string
}

export type ClientLoginPayload = {
  apiKey: string
  email: string
  password: string
}

export type ClientAuthResponse = {
  token: string
  expiresAt: string
  tenantId: number
  tenantName: string
  apiKey: string
  businessType: number
}

const persistAuth = (response: ClientAuthResponse) => {
  localStorage.setItem('client_token', response.token)
  localStorage.setItem('client_token_expires', response.expiresAt)
  localStorage.setItem('client_tenant_id', String(response.tenantId))
  localStorage.setItem('client_tenant_name', response.tenantName)
  localStorage.setItem('client_api_key', response.apiKey)
  localStorage.setItem('client_business_type', String(response.businessType))
}

export const registerClient = async (payload: ClientRegisterPayload) => {
  const response = await apiFetch<ClientAuthResponse>('/api/client/auth/register', {
    method: 'POST',
    body: payload,
    auth: false,
  })
  persistAuth(response)
  localStorage.setItem('client_onboarding', 'true')
  return response
}

export const loginClient = async (payload: ClientLoginPayload) => {
  const response = await apiFetch<ClientAuthResponse>('/api/client/auth/login', {
    method: 'POST',
    body: payload,
    auth: false,
  })
  persistAuth(response)
  return response
}

export const logoutClient = () => {
  localStorage.removeItem('client_token')
  localStorage.removeItem('client_token_expires')
  localStorage.removeItem('client_tenant_id')
  localStorage.removeItem('client_tenant_name')
  localStorage.removeItem('client_api_key')
  localStorage.removeItem('client_business_type')
  localStorage.removeItem('client_onboarding')
}
