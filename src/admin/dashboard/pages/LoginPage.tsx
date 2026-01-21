import { FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginAdmin } from '../services/auth'

const LoginPage = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      navigate('/admin/tenants')
    }
  }, [navigate])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await loginAdmin({ email, password })
      navigate('/admin/tenants')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesion'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-shell">
      <div className="login-wrap">
        <div className="login-hero">
          <div className="tagline">Control central</div>
          <h1>Panel maestro de OmniVenta</h1>
          <p>
            Gestiona todos los tenants, activa nuevas cuentas y monitorea el estado general
            del SaaS desde un solo lugar.
          </p>
        </div>

        <div className="card">
          <h2>Ingresar como superadmin</h2>
          <form onSubmit={handleSubmit} className="split">
            <label className="input-group">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="superadmin@saaseventos.local"
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
              {loading ? 'Ingresando...' : 'Entrar al dashboard'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
