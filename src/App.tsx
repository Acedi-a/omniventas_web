import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './admin/dashboard/pages/LoginPage'
import TenantDetailPage from './admin/dashboard/pages/TenantDetailPage'
import TenantsPage from './admin/dashboard/pages/TenantsPage'
import HealthPage from './admin/dashboard/pages/HealthPage'
import AdminAuditPage from './admin/dashboard/pages/AuditPage'
import ClientLoginPage from './client/pages/LoginPage'
import ClientRegisterPage from './client/pages/RegisterPage'
import ClientDashboardPage from './client/pages/DashboardPage'
import ClientTenantDetailPage from './client/pages/TenantDetailPage'
import ClientAuditPage from './client/pages/AuditPage'
import TenantLoginPage from './tenant/pages/LoginPage'
import TenantForgotPasswordPage from './tenant/pages/ForgotPasswordPage'
import TenantResetPasswordPage from './tenant/pages/ResetPasswordPage'
import TenantProductsPage from './tenant/pages/ProductsPage'
import TenantEventsPage from './tenant/pages/EventsPage'
import TenantOrdersPage from './tenant/pages/OrdersPage'
import TenantCouponsPage from './tenant/pages/CouponsPage'
import TenantApiKeyPage from './tenant/pages/ApiKeyPage'
import TenantAuditPage from './tenant/pages/AuditPage'

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem('admin_token')
  const expiresAt = localStorage.getItem('admin_token_expires')
  const expiresDate = expiresAt ? new Date(expiresAt) : null
  const isExpired = expiresDate ? Number.isNaN(expiresDate.getTime()) || expiresDate <= new Date() : false
  if (!token || isExpired) {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_token_expires')
    return <Navigate to="/admin/login" replace />
  }

  return children
}

const RequireClientAuth = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem('owner_token')
  const expiresAt = localStorage.getItem('owner_token_expires')
  const expiresDate = expiresAt ? new Date(expiresAt) : null
  const isExpired = expiresDate ? Number.isNaN(expiresDate.getTime()) || expiresDate <= new Date() : false
  if (!token || isExpired) {
    localStorage.removeItem('owner_token')
    localStorage.removeItem('owner_token_expires')
    return <Navigate to="/client/login" replace />
  }

  return children
}

const RequireTenantAuth = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem('tenant_token')
  const expiresAt = localStorage.getItem('tenant_token_expires')
  const expiresDate = expiresAt ? new Date(expiresAt) : null
  const isExpired = expiresDate ? Number.isNaN(expiresDate.getTime()) || expiresDate <= new Date() : false
  if (!token || isExpired) {
    localStorage.removeItem('tenant_token')
    localStorage.removeItem('tenant_token_expires')
    return <Navigate to="/tenant/login" replace />
  }

  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route
          path="/admin/tenants"
          element={
            <RequireAuth>
              <TenantsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/tenants/:id"
          element={
            <RequireAuth>
              <TenantDetailPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/health"
          element={
            <RequireAuth>
              <HealthPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/audit"
          element={
            <RequireAuth>
              <AdminAuditPage />
            </RequireAuth>
          }
        />
        <Route path="/client" element={<Navigate to="/client/login" replace />} />
        <Route path="/client/login" element={<ClientLoginPage />} />
        <Route path="/client/register" element={<ClientRegisterPage />} />
        <Route
          path="/client/tenants"
          element={
            <RequireClientAuth>
              <ClientDashboardPage />
            </RequireClientAuth>
          }
        />
        <Route
          path="/client/audit"
          element={
            <RequireClientAuth>
              <ClientAuditPage />
            </RequireClientAuth>
          }
        />
        <Route
          path="/client/tenants/:id"
          element={
            <RequireClientAuth>
              <ClientTenantDetailPage />
            </RequireClientAuth>
          }
        />
        <Route path="/tenant" element={<Navigate to="/tenant/login" replace />} />
        <Route path="/tenant/login" element={<TenantLoginPage />} />
        <Route path="/tenant/forgot" element={<TenantForgotPasswordPage />} />
        <Route path="/tenant/reset" element={<TenantResetPasswordPage />} />
        <Route
          path="/tenant/products"
          element={
            <RequireTenantAuth>
              <TenantProductsPage />
            </RequireTenantAuth>
          }
        />
        <Route
          path="/tenant/events"
          element={
            <RequireTenantAuth>
              <TenantEventsPage />
            </RequireTenantAuth>
          }
        />
        <Route
          path="/tenant/orders"
          element={
            <RequireTenantAuth>
              <TenantOrdersPage />
            </RequireTenantAuth>
          }
        />
        <Route
          path="/tenant/coupons"
          element={
            <RequireTenantAuth>
              <TenantCouponsPage />
            </RequireTenantAuth>
          }
        />
        <Route
          path="/tenant/api-key"
          element={
            <RequireTenantAuth>
              <TenantApiKeyPage />
            </RequireTenantAuth>
          }
        />
        <Route
          path="/tenant/audit"
          element={
            <RequireTenantAuth>
              <TenantAuditPage />
            </RequireTenantAuth>
          }
        />
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
