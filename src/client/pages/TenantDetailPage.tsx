import { FormEvent, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import ClientLayout from '../components/ClientLayout'
import {
  createOwnerUser,
  fetchOwnerTenantStats,
  fetchOwnerTenants,
  fetchOwnerUsers,
  resetOwnerUserPassword,
  checkOwnerTenantSlug,
  updateOwnerTenantSlug,
} from '../services/tenants'

const businessTypes: Record<number, string> = {
  1: 'Commerce',
  2: 'Events',
  3: 'Hybrid',
}

const roleOptions = [
  { value: 2, label: 'Admin' },
  { value: 3, label: 'Validator' },
]

const TenantDetailPage = () => {
  const params = useParams()
  const tenantId = Number(params.id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState(2)
  const [error, setError] = useState<string | null>(null)
  const [resetUserId, setResetUserId] = useState<number | null>(null)
  const [resetPassword, setResetPassword] = useState('')
  const [slug, setSlug] = useState('')
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')

  const generateSlug = (value: string) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
  }

  const { data: tenants } = useQuery({
    queryKey: ['owner-tenants'],
    queryFn: fetchOwnerTenants,
  })

  const tenant = useMemo(() => tenants?.find((item) => item.id === tenantId), [tenants, tenantId])

  const slugMutation = useMutation({
    mutationFn: (value: string) => updateOwnerTenantSlug(tenantId, value),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['owner-tenants'] })
      setSlug(updated.slug)
    },
  })

  const validateSlug = async (value: string) => {
    if (!value) {
      setSlugStatus('idle')
      return
    }

    setSlugStatus('checking')
    try {
      const response = await checkOwnerTenantSlug(tenantId, value)
      setSlug(response.normalizedSlug)
      setSlugStatus(response.available ? 'available' : 'taken')
    } catch {
      setSlugStatus('idle')
    }
  }

  const { data: stats } = useQuery({
    queryKey: ['owner-tenant-stats', tenantId],
    queryFn: () => fetchOwnerTenantStats(tenantId),
    enabled: Number.isFinite(tenantId),
  })

  const { data: users } = useQuery({
    queryKey: ['owner-tenant-users', tenantId],
    queryFn: () => fetchOwnerUsers(tenantId),
    enabled: Number.isFinite(tenantId),
  })

  const mutation = useMutation({
    mutationFn: () => createOwnerUser(tenantId, { email, password, role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-tenant-users', tenantId] })
      setEmail('')
      setPassword('')
      setRole(2)
      setError(null)
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : 'No se pudo invitar usuario'
      setError(message)
    },
  })

  const resetMutation = useMutation({
    mutationFn: () => {
      if (!resetUserId) {
        throw new Error('Selecciona un usuario')
      }
      return resetOwnerUserPassword(tenantId, resetUserId, resetPassword)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-tenant-users', tenantId] })
      setResetUserId(null)
      setResetPassword('')
    },
  })

  if (!tenant) {
    return (
      <ClientLayout title="Detalle del negocio" subtitle="Selecciona un negocio valido.">
        <section className="card">
          <p>No se encontro el negocio.</p>
          <button className="ghost-btn" onClick={() => navigate('/client/tenants')}>
            Volver a mis negocios
          </button>
        </section>
      </ClientLayout>
    )
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    mutation.mutate()
  }

  return (
    <ClientLayout title={tenant.name} subtitle="Metricas y usuarios del negocio.">
      <section className="card split">
        <div>
          <div className="tagline">Resumen</div>
          <h2>{tenant.name}</h2>
          <p>Tipo: {businessTypes[tenant.businessType]}</p>
          <p className="mono">Slug actual: {tenant.slug}</p>
          <p>
            Estado:{' '}
            <span className={`status-pill ${tenant.isActive ? 'status-on' : 'status-off'}`}>
              {tenant.isActive ? 'Activo' : 'Inactivo'}
            </span>
          </p>
          <p>API Key</p>
          <p className="api-key mono">{tenant.apiKey}</p>
          <button className="ghost-btn" onClick={() => navigator.clipboard.writeText(tenant.slug)}>
            Copiar slug
          </button>
        </div>
        <div className="metrics-grid">
          <div>
            <h3>Usuarios</h3>
            <p>{stats?.usersCount ?? 0}</p>
          </div>
          <div>
            <h3>Productos</h3>
            <p>{stats?.productsCount ?? 0}</p>
          </div>
          <div>
            <h3>Eventos</h3>
            <p>{stats?.eventsCount ?? 0}</p>
          </div>
          <div>
            <h3>Ordenes</h3>
            <p>{stats?.ordersCount ?? 0}</p>
          </div>
          <div>
            <h3>Ventas</h3>
            <p>Bs {stats?.totalSales.toFixed(2) ?? '0.00'}</p>
          </div>
        </div>
      </section>

      <section className="card">
        <h2>Editar slug</h2>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            slugMutation.mutate(slug || tenant.slug)
          }}
          className="split"
        >
          <label className="input-group">
            Nuevo slug
            <input
              value={slug}
              onChange={(event) => {
                setSlug(event.target.value)
              }}
              onBlur={(event) => validateSlug(event.target.value)}
              placeholder={tenant.slug}
            />
            {slugStatus === 'checking' ? <span className="status-chip">Verificando...</span> : null}
            {slugStatus === 'available' ? <span className="status-chip ok">Disponible</span> : null}
            {slugStatus === 'taken' ? <span className="status-chip warn">No disponible</span> : null}
          </label>
          <button className="primary-btn" type="submit" disabled={slugMutation.isPending}>
            {slugMutation.isPending ? 'Guardando...' : 'Actualizar slug'}
          </button>
          <button
            className="ghost-btn"
            type="button"
            onClick={() => {
              const autoSlug = `${generateSlug(tenant.name)}-${tenant.id}`
              setSlug(autoSlug)
              validateSlug(autoSlug)
            }}
          >
            Generar slug
          </button>
        </form>
      </section>

      <section className="card">
        <h2>Invitar usuarios</h2>
        <form onSubmit={handleSubmit} className="split">
          <label className="input-group">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@empresa.com"
              required
            />
          </label>
          <label className="input-group">
            Password temporal
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="********"
              required
            />
          </label>
          <label className="input-group">
            Rol
            <select value={role} onChange={(event) => setRole(Number(event.target.value))}>
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          {error ? <div className="error">{error}</div> : null}
          <button className="primary-btn" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Invitando...' : 'Crear usuario'}
          </button>
        </form>
      </section>

      <section className="card">
        <h2>Reset de password</h2>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            resetMutation.mutate()
          }}
          className="split"
        >
          <label className="input-group">
            Usuario
            <select
              value={resetUserId ?? ''}
              onChange={(event) => setResetUserId(Number(event.target.value))}
            >
              <option value="">Selecciona usuario</option>
              {users?.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.email}
                </option>
              ))}
            </select>
          </label>
          <label className="input-group">
            Nuevo password
            <input
              type="password"
              value={resetPassword}
              onChange={(event) => setResetPassword(event.target.value)}
              required
            />
          </label>
          <button className="primary-btn" type="submit" disabled={resetMutation.isPending}>
            {resetMutation.isPending ? 'Actualizando...' : 'Resetear password'}
          </button>
        </form>
      </section>

      <section className="card">
        <h2>Usuarios del negocio</h2>
        {users?.length ? (
          <table className="table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Rol</th>
                <th>Creado</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td>{user.role === 2 ? 'Admin' : 'Validator'}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No hay usuarios creados aun.</p>
        )}
      </section>
    </ClientLayout>
  )
}

export default TenantDetailPage
