import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginClient } from '../services/auth'

const LoginPage = () => {
  const navigate = useNavigate()
  const [apiKey, setApiKey] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await loginClient({ apiKey, email, password })
      navigate('/client/dashboard')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo iniciar sesion'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-shell client-auth">
      <div className="login-wrap">
        <div className="login-hero client-hero">
          <div className="tagline">Portal de negocios</div>
          <h1>Gestiona tu tienda con OmniVenta</h1>
          <p>Accede al panel para controlar productos, eventos, ventas y la API de tu negocio.</p>
        </div>

        <div className="card">
          <h2>Ingresar</h2>
          <form onSubmit={handleSubmit} className="split">
            <label className="input-group">
              API Key
              <input
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                placeholder="tn_live_xxx"
                required
              />
            </label>
            <label className="input-group">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="tu@email.com"
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
              <span>¿No tienes cuenta?</span>
              <Link to="/client/register">Crear negocio</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
