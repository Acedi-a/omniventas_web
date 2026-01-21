const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

export const getClientToken = () => localStorage.getItem('client_token')

type HttpOptions = {
  method?: string
  body?: unknown
  auth?: boolean
  headers?: Record<string, string>
}

const buildHeaders = (auth: boolean, headers?: Record<string, string>) => {
  const token = getClientToken()
  return {
    ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  }
}

export const apiFetch = async <T>(path: string, options: HttpOptions = {}): Promise<T> => {
  const { auth = true, body, headers, method } = options

  const response = await fetch(`${API_URL}${path}`, {
    method: method ?? (body ? 'POST' : 'GET'),
    headers: {
      'Content-Type': 'application/json',
      ...buildHeaders(auth, headers),
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
