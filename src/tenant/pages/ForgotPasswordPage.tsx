import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { requestTenantPasswordReset } from '../services/auth'

const ForgotPasswordPage = () => {
  const [tenantSlug, setTenantSlug] = useState('')
  const [email, setEmail] = useState('')
  const [token, setToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await requestTenantPasswordReset({ tenantSlug, email })
      setToken(response.token)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo solicitar el reset'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-shell tenant-auth">
      <div className="login-wrap">
        <div className="login-hero tenant-hero">
          <div className="tagline">Recuperacion</div>
          <h1>Restablecer password</h1>
          <p>Genera un token temporal para restablecer la clave del usuario.</p>
        </div>
        <div className="card">
          <h2>Solicitar token</h2>
          <form onSubmit={handleSubmit} className="split">
            <label className="input-group">
              Slug del negocio
              <input value={tenantSlug} onChange={(event) => setTenantSlug(event.target.value)} required />
            </label>
            <label className="input-group">
              Email
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </label>
            {error ? <div className="error">{error}</div> : null}
            {token ? (
              <div className="card highlight">
                Token generado: <span className="mono">{token}</span>
              </div>
            ) : null}
            <button className="primary-btn" type="submit" disabled={loading}>
              {loading ? 'Generando...' : 'Generar token'}
            </button>
            <div className="helper-row">
              <span>¿Ya tienes token?</span>
              <Link to="/tenant/reset">Restablecer</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
