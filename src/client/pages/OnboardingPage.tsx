import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Toast from '../../admin/dashboard/components/Toast'
import { fetchTenantProfile } from '../services/tenant'

const OnboardingPage = () => {
  const navigate = useNavigate()
  const [apiKey, setApiKey] = useState(localStorage.getItem('client_api_key') ?? '')
  const [tenantName, setTenantName] = useState(localStorage.getItem('client_tenant_name') ?? '')
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    const hasOnboarding = localStorage.getItem('client_onboarding') === 'true'
    if (!hasOnboarding) {
      navigate('/client/dashboard')
    }
  }, [navigate])

  useEffect(() => {
    if (!apiKey) {
      fetchTenantProfile()
        .then((profile) => {
          setApiKey(profile.apiKey)
          setTenantName(profile.name)
        })
        .catch(() => undefined)
    }
  }, [apiKey])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(apiKey)
    setToast('API key copiada')
  }

  return (
    <div className="page-shell client-auth">
      <div className="card">
        <div className="tagline">Bienvenido</div>
        <h2>Tu cuenta ya esta lista</h2>
        <p>
          {tenantName} ya puede operar con OmniVenta. Guarda tu API key para conectar apps moviles y
          servicios externos.
        </p>
        <div className="api-key highlight">
          <strong>{apiKey || 'Cargando API key...'}</strong>
        </div>
        <div className="action-row">
          <button className="ghost-btn" onClick={handleCopy}>
            Copiar API key
          </button>
          <button
            className="primary-btn"
            onClick={() => {
              localStorage.removeItem('client_onboarding')
              navigate('/client/dashboard')
            }}
          >
            Ir al dashboard
          </button>
        </div>
        <div className="helper-row">
          <span>URL base API:</span>
          <span className="mono">http://localhost:5000</span>
        </div>
      </div>
      {toast ? <Toast message={toast} onClose={() => setToast(null)} /> : null}
    </div>
  )
}

export default OnboardingPage
