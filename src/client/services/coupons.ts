import { apiFetch } from './http'

export type Coupon = {
  id: number
  code: string
  discountPercentage: number
  maxUses: number
  currentUses: number
  expiresAt: string
}

export type CreateCouponPayload = {
  code: string
  discountPercentage: number
  maxUses: number
  expiresAt: string
}

export const fetchCoupons = () => apiFetch<Coupon[]>('/api/coupons')

export const createCoupon = (payload: CreateCouponPayload) =>
  apiFetch<Coupon>('/api/coupons', { method: 'POST', body: payload })
