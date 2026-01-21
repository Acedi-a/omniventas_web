import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerClient } from '../services/auth'

const businessTypes = [
  { value: 1, label: 'Commerce' },
  { value: 2, label: 'Events' },
  { value: 3, label: 'Hybrid' },
]

const RegisterPage = () => {
  const navigate = useNavigate()
  const [tenantName, setTenantName] = useState('')
  const [businessType, setBusinessType] = useState(1)
  const [adminEmail, setAdminEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await registerClient({ tenantName, businessType, adminEmail, password })
      navigate('/client/onboarding')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo crear la cuenta'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-shell client-auth">
      <div className="login-wrap">
        <div className="login-hero client-hero">
          <div className="tagline">Nuevo negocio</div>
          <h1>Activa tu cuenta en minutos</h1>
          <p>Registra tu negocio, genera tu API key y empieza a vender productos o eventos.</p>
        </div>

        <div className="card">
          <h2>Crear negocio</h2>
          <form onSubmit={handleSubmit} className="split">
            <label className="input-group">
              Nombre del negocio
              <input
                value={tenantName}
                onChange={(event) => setTenantName(event.target.value)}
                placeholder="Mi negocio"
                required
              />
            </label>
            <label className="input-group">
              Tipo de negocio
              <select
                value={businessType}
                onChange={(event) => setBusinessType(Number(event.target.value))}
              >
                {businessTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="input-group">
              Email administrador
              <input
                type="email"
                value={adminEmail}
                onChange={(event) => setAdminEmail(event.target.value)}
                placeholder="admin@negocio.com"
                required
              />
            </label>
            <label className="input-group">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="********"
                required
              />
            </label>
            {error ? <div className="error">{error}</div> : null}
            <button className="primary-btn" type="submit" disabled={loading}>
              {loading ? 'Registrando...' : 'Crear cuenta'}
            </button>
            <div className="helper-row">
              <span>¿Ya tienes cuenta?</span>
              <Link to="/client/login">Inicia sesion</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
