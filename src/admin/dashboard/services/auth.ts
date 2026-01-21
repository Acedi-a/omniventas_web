import { apiFetch } from './http'

export type LoginPayload = {
  email: string
  password: string
}

export type LoginResponse = {
  token: string
  expiresAt: string
}

export const loginAdmin = async (payload: LoginPayload) => {
  const response = await apiFetch<LoginResponse>('/api/admin/login', {
    method: 'POST',
    body: payload,
    auth: false,
  })

  localStorage.setItem('admin_token', response.token)
  localStorage.setItem('admin_token_expires', response.expiresAt)
  localStorage.setItem('admin_last_login', new Date().toISOString())
  return response
}

export const logoutAdmin = () => {
  localStorage.removeItem('admin_token')
  localStorage.removeItem('admin_token_expires')
}
