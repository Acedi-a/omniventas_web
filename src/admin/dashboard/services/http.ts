const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

export const getAuthToken = () => localStorage.getItem('admin_token')

type HttpOptions = {
  method?: string
  body?: unknown
  auth?: boolean
  headers?: Record<string, string>
}

export const apiFetch = async <T>(path: string, options: HttpOptions = {}): Promise<T> => {
  const { auth = true, body, headers, method } = options
  const token = getAuthToken()

  const response = await fetch(`${API_URL}${path}`, {
    method: method ?? (body ? 'POST' : 'GET'),
    headers: {
      'Content-Type': 'application/json',
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    let message = 'Error inesperado'
    try {
      const data = await response.json()
      message = data?.error ?? message
    } catch {
      // ignore
    }
    throw new Error(message)
  }

  return response.json() as Promise<T>
}
