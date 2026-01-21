import { FormEvent, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js'
import { Doughnut, Line } from 'react-chartjs-2'
import AdminLayout from '../components/AdminLayout'
import {
  createTenant,
  fetchRecentTenants,
  fetchTenantSummary,
  fetchTenantTrends,
  fetchTenants,
  regenerateTenantApiKey,
  updateTenantStatus,
} from '../services/tenants'

const businessTypes = [
  { value: 1, label: 'Commerce' },
  { value: 2, label: 'Events' },
  { value: 3, label: 'Hybrid' },
]

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend)

const TenantsPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [businessType, setBusinessType] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [error, setError] = useState<string | null>(null)

  const { data: summary } = useQuery({
    queryKey: ['tenant-summary'],
    queryFn: fetchTenantSummary,
  })

  const { data: trends } = useQuery({
    queryKey: ['tenant-trends'],
    queryFn: () => fetchTenantTrends(30),
  })

  const { data: recentTenants } = useQuery({
    queryKey: ['tenant-recent'],
    queryFn: () => fetchRecentTenants(5),
  })

  const { data: tenantsData, isLoading } = useQuery({
    queryKey: ['tenants', search, statusFilter, typeFilter, page],
    queryFn: () =>
      fetchTenants({
        search: search || undefined,
        page,
        pageSize: 8,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
        businessType: typeFilter === 'all' ? undefined : Number(typeFilter),
      }),
  })

  const mutation = useMutation({
    mutationFn: createTenant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
      queryClient.invalidateQueries({ queryKey: ['tenant-summary'] })
      setName('')
      setBusinessType(1)
      setError(null)
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : 'No se pudo crear el tenant'
      setError(message)
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ tenantId, isActive }: { tenantId: number; isActive: boolean }) =>
      updateTenantStatus(tenantId, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
      queryClient.invalidateQueries({ queryKey: ['tenant-summary'] })
    },
  })

  const regenerateMutation = useMutation({
    mutationFn: (tenantId: number) => regenerateTenantApiKey(tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
    },
  })

  const stats = useMemo(() => {
    return {
      total: summary?.totalTenants ?? 0,
      active: summary?.activeTenants ?? 0,
      inactive: summary?.inactiveTenants ?? 0,
      last7: summary?.newLast7Days ?? 0,
      last30: summary?.newLast30Days ?? 0,
      commerce: summary?.commerceTenants ?? 0,
      events: summary?.eventsTenants ?? 0,
      hybrid: summary?.hybridTenants ?? 0,
    }
  }, [summary])

  const lineData = useMemo(() => {
    return {
      labels: trends?.map((point) => point.date) ?? [],
      datasets: [
        {
          label: 'Nuevos tenants',
          data: trends?.map((point) => point.count) ?? [],
          borderColor: '#2c7a7b',
          backgroundColor: 'rgba(44, 122, 123, 0.2)',
          tension: 0.35,
        },
      ],
    }
  }, [trends])

  const typeData = useMemo(() => {
    return {
      labels: ['Commerce', 'Events', 'Hybrid'],
      datasets: [
        {
          data: [stats.commerce, stats.events, stats.hybrid],
          backgroundColor: ['#2c7a7b', '#c9784b', '#7c6f4f'],
        },
      ],
    }
  }, [stats])

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    mutation.mutate({ name, businessType })
  }

  const handleCopy = async (value: string) => {
    await navigator.clipboard.writeText(value)
  }

  const totalPages = tenantsData ? Math.ceil(tenantsData.totalCount / tenantsData.pageSize) : 1

  return (
    <AdminLayout
      title="Tenants activos"
      subtitle="Crea negocios nuevos y controla las llaves API desde el panel maestro."
    >
      <section className="card split">
        <div>
          <div className="tagline">Resumen rapido</div>
          <h2>{stats.total} tenants registrados</h2>
          <div className="split">
            <div>
              <div className="pill">Activos</div>
              <p>{stats.active} activos</p>
            </div>
            <div>
              <div className="pill">Inactivos</div>
              <p>{stats.inactive} inactivos</p>
            </div>
            <div>
              <div className="pill">Nuevos 7 dias</div>
              <p>{stats.last7} altas</p>
            </div>
            <div>
              <div className="pill">Nuevos 30 dias</div>
              <p>{stats.last30} altas</p>
            </div>
            <div>
              <div className="pill">Commerce</div>
              <p>{stats.commerce}</p>
            </div>
            <div>
              <div className="pill">Events</div>
              <p>{stats.events}</p>
            </div>
            <div>
              <div className="pill">Hybrid</div>
              <p>{stats.hybrid}</p>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="split">
          <label className="input-group">
            Nombre del negocio
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nuevo tenant"
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
            {mutation.isPending ? 'Creando...' : 'Crear tenant'}
          </button>
        </form>
      </section>

      <section className="card charts-grid">
        <div className="chart-card">
          <h2>Crecimiento de tenants</h2>
          <Line data={lineData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </div>
        <div className="chart-card">
          <h2>Distribucion por tipo</h2>
          <Doughnut data={typeData} />
        </div>
        <div className="chart-card">
          <h2>Actividad reciente</h2>
          <div className="recent-list">
            {recentTenants?.map((tenant) => {
              const type = businessTypes.find((item) => item.value === tenant.businessType)
              return (
                <button
                  key={tenant.id}
                  className="recent-item"
                  onClick={() => navigate(`/admin/tenants/${tenant.id}`)}
                >
                  <div>
                    <strong>{tenant.name}</strong>
                    <div className="pill">{type?.label ?? tenant.businessType}</div>
                  </div>
                  <span>{new Date(tenant.createdAt).toLocaleDateString()}</span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section className="card">
        <div className="toolbar">
          <label className="input-group">
            Buscar tenant
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              placeholder="Nombre o keyword"
            />
          </label>
          <label className="input-group">
            Tipo
            <select
              value={typeFilter}
              onChange={(event) => {
                setTypeFilter(event.target.value)
                setPage(1)
              }}
            >
              <option value="all">Todos</option>
              {businessTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </label>
          <label className="input-group">
            Estado
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value)
                setPage(1)
              }}
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </label>
        </div>
      </section>

      <section className="card">
        <h2>Listado general</h2>
        {isLoading ? (
          <p>Cargando tenants...</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>API Key</th>
                <th>Estado</th>
                <th>Creado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tenantsData?.items.map((tenant) => {
                const type = businessTypes.find((item) => item.value === tenant.businessType)
                return (
                  <tr key={tenant.id}>
                    <td>{tenant.name}</td>
                    <td>{type?.label ?? tenant.businessType}</td>
                    <td>{tenant.apiKey}</td>
                    <td>
                      <span className={`status-pill ${tenant.isActive ? 'status-on' : 'status-off'}`}>
                        {tenant.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>{new Date(tenant.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-row">
                        <button className="ghost-btn" onClick={() => navigate(`/admin/tenants/${tenant.id}`)}>
                          Ver
                        </button>
                        <button className="ghost-btn" onClick={() => handleCopy(tenant.apiKey)}>
                          Copiar key
                        </button>
                        <button
                          className="ghost-btn"
                          onClick={() =>
                            statusMutation.mutate({ tenantId: tenant.id, isActive: !tenant.isActive })
                          }
                        >
                          {tenant.isActive ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          className="ghost-btn"
                          onClick={() => regenerateMutation.mutate(tenant.id)}
                        >
                          Regenerar key
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        <div className="pagination">
          <button
            className="ghost-btn"
            disabled={page <= 1}
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          >
            Anterior
          </button>
          <span>
            Pagina {page} de {totalPages}
          </span>
          <button
            className="ghost-btn"
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          >
            Siguiente
          </button>
        </div>
      </section>
    </AdminLayout>
  )
}

export default TenantsPage
