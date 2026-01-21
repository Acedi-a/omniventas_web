import { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { logoutClient } from '../services/auth'

type ClientLayoutProps = {
  title: string
  subtitle?: string
  children: ReactNode
}

const ClientLayout = ({ title, subtitle, children }: ClientLayoutProps) => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const tenantName = localStorage.getItem('client_tenant_name') ?? 'Tu negocio'

  const handleLogout = () => {
    logoutClient()
    navigate('/client/login')
  }

  const links = [
    { to: '/client/dashboard', label: 'Dashboard' },
    { to: '/client/products', label: 'Productos' },
    { to: '/client/events', label: 'Eventos' },
    { to: '/client/orders', label: 'Ordenes' },
    { to: '/client/coupons', label: 'Cupones' },
    { to: '/client/api-key', label: 'API Key' },
  ]

  return (
    <div className="page-shell client-shell">
      <header className="header-bar client-header">
        <div>
          <div className="tagline">Cliente SaaS</div>
          <div className="brand-title">{tenantName}</div>
        </div>
        <nav className="nav-links">
          {links.map((link) => (
            <Link
              key={link.to}
              className={`nav-link ${pathname.startsWith(link.to) ? 'active' : ''}`}
              to={link.to}
            >
              {link.label}
            </Link>
          ))}
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

export default ClientLayout
