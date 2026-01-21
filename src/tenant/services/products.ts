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

export type UpdateProductPayload = {
  name: string
  description?: string | null
  price: number
  stock: number
  imageUrl?: string | null
}

export const fetchProducts = () => apiFetch<Product[]>('/api/products')

export const createProduct = (payload: CreateProductPayload) =>
  apiFetch<Product>('/api/products', { method: 'POST', body: payload })

export const updateProduct = (id: number, payload: UpdateProductPayload) =>
  apiFetch<Product>(`/api/products/${id}`, { method: 'PUT', body: payload })

export const deleteProduct = (id: number) => apiFetch<void>(`/api/products/${id}`, { method: 'DELETE' })
