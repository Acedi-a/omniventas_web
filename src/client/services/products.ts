import { apiFetch } from './http'

export type Product = {
  id: number
  name: string
  description?: string | null
  price: number
  stock: number
  imageUrl?: string | null
  createdAt: string
}

export type CreateProductPayload = {
  name: string
  description?: string
  price: number
  stock: number
  imageUrl?: string
}

export const fetchProducts = () => apiFetch<Product[]>('/api/products')

export const createProduct = (payload: CreateProductPayload) =>
  apiFetch<Product>('/api/products', { method: 'POST', body: payload })
