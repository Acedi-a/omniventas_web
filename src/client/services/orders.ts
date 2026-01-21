import { apiFetch } from './http'

export type TenantOrder = {
  id: number
  buyerEmail: string
  total: number
  status: number
  createdAt: string
  paidAt: string | null
}

export const fetchTenantOrders = () => apiFetch<TenantOrder[]>('/api/client/orders')
