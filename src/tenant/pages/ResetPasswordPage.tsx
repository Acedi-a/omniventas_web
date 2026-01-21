import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { resetTenantPassword } from '../services/auth'

const ResetPasswordPage = () => {
  const navigate = useNavigate()
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await resetTenantPassword({ token, newPassword })
      navigate('/tenant/login')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo restablecer'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-shell tenant-auth">
      <div className="login-wrap">
        <div className="login-hero tenant-hero">
          <div className="tagline">Nuevo acceso</div>
          <h1>Configura un nuevo password</h1>
          <p>Ingresa el token recibido y establece una nueva clave.</p>
        </div>
        <div className="card">
          <h2>Restablecer password</h2>
          <form onSubmit={handleSubmit} className="split">
            <label className="input-group">
              Token
              <input value={token} onChange={(event) => setToken(event.target.value)} required />
            </label>
            <label className="input-group">
              Nuevo password
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
              />
            </label>
            {error ? <div className="error">{error}</div> : null}
            <button className="primary-btn" type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Actualizar password'}
            </button>
            <div className="helper-row">
              <span>Volver</span>
              <Link to="/tenant/login">Iniciar sesion</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage
