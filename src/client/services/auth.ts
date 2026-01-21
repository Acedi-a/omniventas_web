import { apiFetch } from './http'

export type OwnerRegisterPayload = {
  name: string
  email: string
  password: string
}

export type OwnerLoginPayload = {
  email: string
  password: string
}

export type OwnerAuthResponse = {
  token: string
  expiresAt: string
}

const persistAuth = (response: OwnerAuthResponse, email: string) => {
  localStorage.setItem('owner_token', response.token)
  localStorage.setItem('owner_token_expires', response.expiresAt)
  localStorage.setItem('owner_email', email)
}

export const registerClient = async (payload: OwnerRegisterPayload) => {
  await apiFetch<{ success: boolean }>('/api/owner/register', {
    method: 'POST',
    body: payload,
    auth: false,
  })

  return loginClient({ email: payload.email, password: payload.password })
}

export const loginClient = async (payload: OwnerLoginPayload) => {
  const response = await apiFetch<OwnerAuthResponse>('/api/owner/login', {
    method: 'POST',
    body: payload,
    auth: false,
  })
  persistAuth(response, payload.email)
  return response
}

export const logoutClient = () => {
  localStorage.removeItem('owner_token')
  localStorage.removeItem('owner_token_expires')
  localStorage.removeItem('owner_email')
}
