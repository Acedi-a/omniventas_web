import { apiFetch } from './http'

export type HealthSummary = {
  startedAt: string
  uptimeHours: number
  databaseConnected: boolean
  totalTenants: number
  activeTenants: number
  activeTenantsLast30Days: number
  paidOrdersLast24Hours: number
  paidOrdersLast7Days: number
  revenueLast24Hours: number
  revenueLast7Days: number
  pendingOrders: number
  cancelledOrders: number
  lastOrderAt: string | null
  lastTenantAt: string | null
  lastUserAt: string | null
}

export type HealthTrendPoint = {
  date: string
  paidOrders: number
  revenue: number
}

export const fetchHealthSummary = () => apiFetch<HealthSummary>('/api/admin/health/summary')

export const fetchHealthTrends = (days = 14) =>
  apiFetch<HealthTrendPoint[]>(`/api/admin/health/trends?days=${days}`)
