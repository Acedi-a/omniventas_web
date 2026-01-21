import { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { logoutAdmin } from '../services/auth'

type AdminLayoutProps = {
  title: string
  subtitle?: string
  children: ReactNode
}

const AdminLayout = ({ title, subtitle, children }: AdminLayoutProps) => {
  const navigate = useNavigate()

  const handleLogout = () => {
    logoutAdmin()
    navigate('/admin/login')
  }

  return (
    <div className="page-shell">
      <header className="header-bar">
        <div>
          <div className="tagline">Super Admin</div>
          <div className="brand-title">SaaS OmniVenta</div>
        </div>
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
