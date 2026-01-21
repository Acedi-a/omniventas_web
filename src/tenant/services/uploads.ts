const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

export const uploadTenantImage = async (file: File, onProgress?: (value: number) => void) => {
  const token = localStorage.getItem('tenant_token')
  const formData = new FormData()
  formData.append('file', file)

  return new Promise<{ url: string }>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${API_URL}/api/tenant/uploads`)
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100)
        onProgress(percent)
      }
    }

    xhr.onerror = () => reject(new Error('No se pudo subir la imagen'))
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText) as { url: string }
          const resolvedUrl = data.url.startsWith('http') ? data.url : `${API_URL}${data.url}`
          resolve({ url: resolvedUrl })
        } catch {
          reject(new Error('Respuesta invalida del servidor'))
        }
      } else {
        try {
          const data = JSON.parse(xhr.responseText)
          reject(new Error(data?.error ?? 'No se pudo subir la imagen'))
        } catch {
          reject(new Error('No se pudo subir la imagen'))
        }
      }
    }

    xhr.send(formData)
  })
}
