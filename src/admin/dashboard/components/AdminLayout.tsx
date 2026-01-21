import { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { logoutAdmin } from '../services/auth'

type AdminLayoutProps = {
  title: string
  subtitle?: string
  children: ReactNode
}

const AdminLayout = ({ title, subtitle, children }: AdminLayoutProps) => {
  const navigate = useNavigate()
  const lastLogin = localStorage.getItem('admin_last_login')
  const sessionExpires = localStorage.getItem('admin_token_expires')
  const formatDate = (value: string | null) => {
    if (!value) return null
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? null : parsed.toLocaleString()
  }
  const lastLoginLabel = formatDate(lastLogin)
  const expiresLabel = formatDate(sessionExpires)

  const handleLogout = () => {
    logoutAdmin()
    navigate('/admin/login')
  }

  const { pathname } = useLocation()
  const isTenants = pathname.startsWith('/admin/tenants')
  const isHealth = pathname.startsWith('/admin/health')
  const isAudit = pathname.startsWith('/admin/audit')

  return (
    <div className="page-shell">
      <header className="header-bar">
        <div>
          <div className="tagline">Super Admin</div>
          <div className="brand-title">SaaS OmniVenta</div>
          {lastLoginLabel ? <div className="header-meta">Ultimo login: {lastLoginLabel}</div> : null}
          {expiresLabel ? <div className="header-meta">Sesion expira: {expiresLabel}</div> : null}
        </div>
        <nav className="nav-links">
          <Link className={`nav-link ${isTenants ? 'active' : ''}`} to="/admin/tenants">
            Tenants
          </Link>
          <Link className={`nav-link ${isAudit ? 'active' : ''}`} to="/admin/audit">
            Auditoria
          </Link>
          <Link className={`nav-link ${isHealth ? 'active' : ''}`} to="/admin/health">
            Health
          </Link>
        </nav>
        <div>
          <button className="ghost-btn" onClick={handleLogout}>
            Cerrar sesion
          </button>
        </div>
      </header>

      <main className="layout-grid">
        <section className="card">
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </section>
        {children}
      </main>
    </div>
  )
}

export default AdminLayout
