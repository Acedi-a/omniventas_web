import { apiFetch } from './http'

export type EventItem = {
  id: number
  name: string
  eventDate: string
  location: string
  maxCapacity: number
  availableTickets: number
  price: number
  createdAt: string
}

export type CreateEventPayload = {
  name: string
  eventDate: string
  location: string
  maxCapacity: number
  price: number
}

export const fetchEvents = () => apiFetch<EventItem[]>('/api/events')

export const createEvent = (payload: CreateEventPayload) =>
  apiFetch<EventItem>('/api/events', { method: 'POST', body: payload })
