import { apiFetch } from './http'

export type AuditLog = {
  id: number
  action: string
  accountId?: number | null
  tenantId?: number | null
  userId?: number | null
  metadata?: string | null
  createdAt: string
}

export type AuditPagedResponse = {
  items: AuditLog[]
  totalCount: number
  page: number
  pageSize: number
}

export type AuditQuery = {
  action?: string
  tenantId?: string
  accountId?: string
  userId?: string
  metadata?: string
  from?: string
  to?: string
  page?: number
  pageSize?: number
}

const buildQuery = (query: AuditQuery) => {
  const params = new URLSearchParams()
  if (query.action) params.set('action', query.action)
  if (query.tenantId) params.set('tenantId', query.tenantId)
  if (query.accountId) params.set('accountId', query.accountId)
  if (query.userId) params.set('userId', query.userId)
  if (query.metadata) params.set('metadata', query.metadata)
  if (query.from) params.set('from', query.from)
  if (query.to) params.set('to', query.to)
  if (query.page) params.set('page', String(query.page))
  if (query.pageSize) params.set('pageSize', String(query.pageSize))
  const suffix = params.toString()
  return suffix ? `?${suffix}` : ''
}

export const fetchAuditLogs = (query: AuditQuery) =>
  apiFetch<AuditPagedResponse>(`/api/admin/audit${buildQuery(query)}`)
