import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import ClientLayout from '../components/ClientLayout'
import ConfirmDialog from '../../admin/dashboard/components/ConfirmDialog'
import Toast from '../../admin/dashboard/components/Toast'
import { fetchTenantProfile, regenerateApiKey } from '../services/tenant'

const ApiKeyPage = () => {
  const queryClient = useQueryClient()
  const [toast, setToast] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const { data: profile } = useQuery({
    queryKey: ['client-tenant-profile'],
    queryFn: fetchTenantProfile,
  })

  const mutation = useMutation({
    mutationFn: regenerateApiKey,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['client-tenant-profile'] })
      localStorage.setItem('client_api_key', data.apiKey)
      setToast('API key regenerada')
    },
  })

  return (
    <ClientLayout title="API Key" subtitle="Gestiona la llave API de tu negocio.">
      <section className="card">
        <div className="tagline">Credenciales</div>
        <h2>API Key</h2>
        <p>Usa esta llave para autenticar tus aplicaciones moviles o integraciones.</p>
        <div className="api-key highlight">
          <strong>{profile?.apiKey ?? 'Cargando...'}</strong>
        </div>
        <div className="action-row">
          <button
            className="ghost-btn"
            onClick={async () => {
              if (!profile?.apiKey) return
              await navigator.clipboard.writeText(profile.apiKey)
              setToast('API key copiada')
            }}
          >
            Copiar API key
          </button>
          <button className="primary-btn" onClick={() => setConfirmOpen(true)}>
            Regenerar API key
          </button>
        </div>
      </section>

      {confirmOpen ? (
        <ConfirmDialog
          open
          title="Regenerar API Key"
          description="La key anterior dejara de ser valida inmediatamente."
          confirmLabel="Regenerar"
          onClose={() => setConfirmOpen(false)}
          onConfirm={() => {
            mutation.mutate()
            setConfirmOpen(false)
          }}
        />
      ) : null}
      {toast ? <Toast message={toast} onClose={() => setToast(null)} /> : null}
    </ClientLayout>
  )
}

export default ApiKeyPage
