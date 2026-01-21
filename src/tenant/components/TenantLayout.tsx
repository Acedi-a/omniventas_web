import { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { logoutTenant } from '../services/auth'

type TenantLayoutProps = {
  title: string
  subtitle?: string
  children: ReactNode
}

const TenantLayout = ({ title, subtitle, children }: TenantLayoutProps) => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const tenantName = localStorage.getItem('tenant_name') ?? 'Negocio'

  const handleLogout = () => {
    logoutTenant()
    navigate('/tenant/login')
  }

  const links = [
    { to: '/tenant/products', label: 'Productos' },
    { to: '/tenant/events', label: 'Eventos' },
    { to: '/tenant/orders', label: 'Ordenes' },
    { to: '/tenant/coupons', label: 'Cupones' },
    { to: '/tenant/api-key', label: 'API Key' },
    { to: '/tenant/audit', label: 'Auditoria' },
  ]

  return (
    <div className="page-shell tenant-shell">
      <header className="header-bar tenant-header">
        <div>
          <div className="tagline">Panel del negocio</div>
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

export default TenantLayout
