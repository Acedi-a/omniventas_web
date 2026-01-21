import { FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginClient } from '../services/auth'

const LoginPage = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('owner_token')
    if (token) {
      navigate('/client/tenants')
    }
  }, [navigate])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await loginClient({ email, password })
      navigate('/client/tenants')
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
          <div className="tagline">Portal empresarial</div>
          <h1>Administra tus negocios desde un solo lugar</h1>
          <p>Controla multiples marcas, llaves API y configuraciones de cada negocio.</p>
        </div>

        <div className="card">
          <h2>Ingresar</h2>
          <form onSubmit={handleSubmit} className="split">
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
              <Link to="/client/register">Crear cuenta</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
