import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './admin/dashboard/pages/LoginPage'
import TenantDetailPage from './admin/dashboard/pages/TenantDetailPage'
import TenantsPage from './admin/dashboard/pages/TenantsPage'

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem('admin_token')
  if (!token) {
    return <Navigate to="/admin/login" replace />
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
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
