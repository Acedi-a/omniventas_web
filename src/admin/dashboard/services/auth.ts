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
  return response
}

export const logoutAdmin = () => {
  localStorage.removeItem('admin_token')
}
