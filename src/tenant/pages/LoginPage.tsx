import { FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginTenant } from '../services/auth'

const LoginPage = () => {
  const navigate = useNavigate()
  const [tenantSlug, setTenantSlug] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('tenant_token')
    if (token) {
      navigate('/tenant/products')
    }
  }, [navigate])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await loginTenant({ tenantSlug, email, password })
      navigate('/tenant/products')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo iniciar sesion'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-shell tenant-auth">
      <div className="login-wrap">
        <div className="login-hero tenant-hero">
          <div className="tagline">Panel operativo</div>
          <h1>Acceso para administradores del negocio</h1>
          <p>Gestiona productos, eventos, ventas y cupones desde el panel operativo.</p>
        </div>

        <div className="card">
          <h2>Ingresar al negocio</h2>
          <form onSubmit={handleSubmit} className="split">
            <label className="input-group">
              Slug del negocio
              <input
                value={tenantSlug}
                onChange={(event) => setTenantSlug(event.target.value)}
                placeholder="vinos-aranjuez"
                required
              />
            </label>
            <label className="input-group">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
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
              {loading ? 'Ingresando...' : 'Entrar al panel'}
            </button>
            <div className="helper-row">
              <span>¿Olvidaste tu clave?</span>
              <a href="/tenant/forgot">Recuperar</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
