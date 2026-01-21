import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './admin/dashboard/pages/LoginPage'
import TenantDetailPage from './admin/dashboard/pages/TenantDetailPage'
import TenantsPage from './admin/dashboard/pages/TenantsPage'
import HealthPage from './admin/dashboard/pages/HealthPage'
import ClientLoginPage from './client/pages/LoginPage'
import ClientRegisterPage from './client/pages/RegisterPage'
import ClientOnboardingPage from './client/pages/OnboardingPage'
import ClientDashboardPage from './client/pages/DashboardPage'
import ClientProductsPage from './client/pages/ProductsPage'
import ClientEventsPage from './client/pages/EventsPage'
import ClientOrdersPage from './client/pages/OrdersPage'
import ClientCouponsPage from './client/pages/CouponsPage'
import ClientApiKeyPage from './client/pages/ApiKeyPage'

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

function App() {
  const RequireClientAuth = ({ children }: { children: JSX.Element }) => {
    const token = localStorage.getItem('client_token')
    const expiresAt = localStorage.getItem('client_token_expires')
    const expiresDate = expiresAt ? new Date(expiresAt) : null
    const isExpired = expiresDate ? Number.isNaN(expiresDate.getTime()) || expiresDate <= new Date() : false
    if (!token || isExpired) {
      localStorage.removeItem('client_token')
      localStorage.removeItem('client_token_expires')
      return <Navigate to="/client/login" replace />
    }

    return children
  }

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
        <Route path="/client" element={<Navigate to="/client/login" replace />} />
        <Route path="/client/login" element={<ClientLoginPage />} />
        <Route path="/client/register" element={<ClientRegisterPage />} />
        <Route
          path="/client/onboarding"
          element={
            <RequireClientAuth>
              <ClientOnboardingPage />
            </RequireClientAuth>
          }
        />
        <Route
          path="/client/dashboard"
          element={
            <RequireClientAuth>
              <ClientDashboardPage />
            </RequireClientAuth>
          }
        />
        <Route
          path="/client/products"
          element={
            <RequireClientAuth>
              <ClientProductsPage />
            </RequireClientAuth>
          }
        />
        <Route
          path="/client/events"
          element={
            <RequireClientAuth>
              <ClientEventsPage />
            </RequireClientAuth>
          }
        />
        <Route
          path="/client/orders"
          element={
            <RequireClientAuth>
              <ClientOrdersPage />
            </RequireClientAuth>
          }
        />
        <Route
          path="/client/coupons"
          element={
            <RequireClientAuth>
              <ClientCouponsPage />
            </RequireClientAuth>
          }
        />
        <Route
          path="/client/api-key"
          element={
            <RequireClientAuth>
              <ClientApiKeyPage />
            </RequireClientAuth>
          }
        />
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
