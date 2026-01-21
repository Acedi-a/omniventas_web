import { apiFetch } from './http'

export type SalesStats = {
  totalSales: number
  orderCount: number
  averageOrderValue: number
}

export type TopProduct = {
  productId: number
  name: string
  quantitySold: number
  revenue: number
}

export const fetchSalesStats = (period: 'week' | 'month' | 'year' = 'month') =>
  apiFetch<SalesStats>(`/api/analytics/sales?period=${period}`)

export const fetchTopProducts = (limit = 5) =>
  apiFetch<TopProduct[]>(`/api/analytics/top-products?limit=${limit}`)
