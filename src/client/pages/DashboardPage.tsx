import { FormEvent, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import ClientLayout from '../components/ClientLayout'
import { createOwnerTenant, fetchOwnerTenants } from '../services/tenants'

const businessTypes = [
  { value: 1, label: 'Commerce' },
  { value: 2, label: 'Events' },
  { value: 3, label: 'Hybrid' },
]

const DashboardPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [businessType, setBusinessType] = useState(1)
  const [error, setError] = useState<string | null>(null)

  const { data: tenants } = useQuery({
    queryKey: ['owner-tenants'],
    queryFn: fetchOwnerTenants,
  })

  const mutation = useMutation({
    mutationFn: createOwnerTenant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-tenants'] })
      setName('')
      setBusinessType(1)
      setError(null)
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : 'No se pudo crear el negocio'
      setError(message)
    },
  })

  const stats = useMemo(() => {
    return {
      total: tenants?.length ?? 0,
      active: tenants?.filter((tenant) => tenant.isActive).length ?? 0,
      inactive: tenants?.filter((tenant) => !tenant.isActive).length ?? 0,
    }
  }, [tenants])

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    mutation.mutate({ name, businessType })
  }

  return (
    <ClientLayout
      title="Mis negocios"
      subtitle="Crea y administra los negocios asociados a tu cuenta empresarial."
    >
      <section className="card split">
        <div>
          <div className="tagline">Resumen</div>
          <h2>{stats.total} negocios registrados</h2>
          <div className="split">
            <div>
              <div className="pill">Activos</div>
              <p>{stats.active}</p>
            </div>
            <div>
              <div className="pill">Inactivos</div>
              <p>{stats.inactive}</p>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="split">
          <label className="input-group">
            Nombre del negocio
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nombre comercial"
              required
            />
          </label>
          <label className="input-group">
            Tipo de negocio
            <select
              value={businessType}
              onChange={(event) => setBusinessType(Number(event.target.value))}
            >
              {businessTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </label>
          {error ? <div className="error">{error}</div> : null}
          <button className="primary-btn" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Creando...' : 'Crear negocio'}
          </button>
        </form>
      </section>

      <section className="card">
        <h2>Lista de negocios</h2>
        {tenants?.length ? (
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>API Key</th>
                <th>Estado</th>
                <th>Creado</th>
                <th>Slug</th>
                <th>Accion</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant) => (
                <tr key={tenant.id}>
                  <td>{tenant.name}</td>
                  <td>{businessTypes.find((type) => type.value === tenant.businessType)?.label}</td>
                  <td className="mono">{tenant.apiKey}</td>
                  <td>
                    <span className={`status-pill ${tenant.isActive ? 'status-on' : 'status-off'}`}>
                      {tenant.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>{new Date(tenant.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className="pill mono">{tenant.slug}</span>
                    <button className="ghost-btn" onClick={() => navigator.clipboard.writeText(tenant.slug)}>
                      Copiar
                    </button>
                  </td>
                  <td>
                    <button className="ghost-btn" onClick={() => navigate(`/client/tenants/${tenant.id}`)}>
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Aun no has creado negocios.</p>
        )}
      </section>
    </ClientLayout>
  )
}

export default DashboardPage
