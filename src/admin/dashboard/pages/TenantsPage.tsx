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
import ConfirmDialog from '../components/ConfirmDialog'
import Toast from '../components/Toast'
import { fetchHealthSummary } from '../services/health'
import {
  createTenant,
  exportTenants,
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
  const [createdFrom, setCreatedFrom] = useState('')
  const [createdTo, setCreatedTo] = useState('')
  const [minSales, setMinSales] = useState('')
  const [maxSales, setMaxSales] = useState('')
  const [minOrders, setMinOrders] = useState('')
  const [maxOrders, setMaxOrders] = useState('')
  const [activityDays, setActivityDays] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(8)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<{
    title: string
    description: string
    confirmLabel?: string
    onConfirm: () => void
  } | null>(null)

  const parseNumber = (value: string) => {
    if (!value) return undefined
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }

  const formatCurrency = (value: number) => `Bs ${value.toFixed(2)}`

  const { data: summary } = useQuery({
    queryKey: ['tenant-summary'],
    queryFn: fetchTenantSummary,
  })

  const { data: healthSummary } = useQuery({
    queryKey: ['health-summary'],
    queryFn: fetchHealthSummary,
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
    queryKey: [
      'tenants',
      search,
      statusFilter,
      typeFilter,
      createdFrom,
      createdTo,
      minSales,
      maxSales,
      minOrders,
      maxOrders,
      activityDays,
      page,
      pageSize,
    ],
    queryFn: () =>
      fetchTenants({
        search: search || undefined,
        page,
        pageSize,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
        businessType: typeFilter === 'all' ? undefined : Number(typeFilter),
        createdFrom: createdFrom || undefined,
        createdTo: createdTo || undefined,
        minSales: parseNumber(minSales),
        maxSales: parseNumber(maxSales),
        minOrders: parseNumber(minOrders),
        maxOrders: parseNumber(maxOrders),
        activityDays: parseNumber(activityDays),
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
      setToast('Tenant creado')
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
      setToast('Estado actualizado')
    },
  })

  const regenerateMutation = useMutation({
    mutationFn: (tenantId: number) => regenerateTenantApiKey(tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
      setToast('API key regenerada')
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
      totalSales: summary?.totalSales ?? 0,
      paidOrders: summary?.paidOrders ?? 0,
      pendingOrders: summary?.pendingOrders ?? 0,
      cancelledOrders: summary?.cancelledOrders ?? 0,
      activeLast30Days: summary?.activeLast30Days ?? 0,
    }
  }, [summary])

  const health = useMemo(() => {
    return {
      dbOk: healthSummary?.databaseConnected ?? false,
      uptimeHours: healthSummary?.uptimeHours ?? 0,
      orders24h: healthSummary?.paidOrdersLast24Hours ?? 0,
      revenue7d: healthSummary?.revenueLast7Days ?? 0,
      pending: healthSummary?.pendingOrders ?? 0,
    }
  }, [healthSummary])

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
    setToast('API key copiada')
  }

  const handleExport = async () => {
    setError(null)
    try {
      const csv = await exportTenants({
        search: search || undefined,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
        businessType: typeFilter === 'all' ? undefined : Number(typeFilter),
        createdFrom: createdFrom || undefined,
        createdTo: createdTo || undefined,
        minSales: parseNumber(minSales),
        maxSales: parseNumber(maxSales),
        minOrders: parseNumber(minOrders),
        maxOrders: parseNumber(maxOrders),
        activityDays: parseNumber(activityDays),
      })
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `tenants-${new Date().toISOString().slice(0, 10)}.csv`
      link.click()
      URL.revokeObjectURL(url)
      setToast('Exportacion lista')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo exportar'
      setError(message)
    }
  }

  const handleClearFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setTypeFilter('all')
    setCreatedFrom('')
    setCreatedTo('')
    setMinSales('')
    setMaxSales('')
    setMinOrders('')
    setMaxOrders('')
    setActivityDays('')
    setPage(1)
  }

  const openConfirm = (payload: {
    title: string
    description: string
    confirmLabel?: string
    onConfirm: () => void
  }) => {
    setConfirmAction(payload)
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
            <div>
              <div className="pill">Ventas total</div>
              <p>{formatCurrency(stats.totalSales)}</p>
            </div>
            <div>
              <div className="pill">Ordenes pagadas</div>
              <p>{stats.paidOrders}</p>
            </div>
            <div>
              <div className="pill">Ordenes pendientes</div>
              <p>{stats.pendingOrders}</p>
            </div>
            <div>
              <div className="pill">Activos 30 dias</div>
              <p>{stats.activeLast30Days}</p>
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
        <div className="card-header">
          <div>
            <div className="tagline">Health preview</div>
            <h2>Estado general del SaaS</h2>
          </div>
          <button className="ghost-btn" onClick={() => navigate('/admin/health')}>
            Ver detalle
          </button>
        </div>
        <div className="health-preview">
          <div className="kpi-card">
            <span className="kpi-label">DB</span>
            <strong className={health.dbOk ? 'status-ok' : 'status-warn'}>
              {health.dbOk ? 'Conectada' : 'Sin conexion'}
            </strong>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Uptime</span>
            <strong>{health.uptimeHours.toFixed(1)}h</strong>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Ordenes 24h</span>
            <strong>{health.orders24h}</strong>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Revenue 7d</span>
            <strong>{formatCurrency(health.revenue7d)}</strong>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Pendientes</span>
            <strong>{health.pending}</strong>
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
            Alta desde
            <input
              type="date"
              value={createdFrom}
              onChange={(event) => {
                setCreatedFrom(event.target.value)
                setPage(1)
              }}
            />
          </label>
          <label className="input-group">
            Alta hasta
            <input
              type="date"
              value={createdTo}
              onChange={(event) => {
                setCreatedTo(event.target.value)
                setPage(1)
              }}
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
          <label className="input-group">
            Min ventas (Bs)
            <input
              type="number"
              min="0"
              value={minSales}
              onChange={(event) => {
                setMinSales(event.target.value)
                setPage(1)
              }}
              placeholder="0"
            />
          </label>
          <label className="input-group">
            Max ventas (Bs)
            <input
              type="number"
              min="0"
              value={maxSales}
              onChange={(event) => {
                setMaxSales(event.target.value)
                setPage(1)
              }}
              placeholder="1000"
            />
          </label>
          <label className="input-group">
            Min ordenes
            <input
              type="number"
              min="0"
              value={minOrders}
              onChange={(event) => {
                setMinOrders(event.target.value)
                setPage(1)
              }}
              placeholder="0"
            />
          </label>
          <label className="input-group">
            Max ordenes
            <input
              type="number"
              min="0"
              value={maxOrders}
              onChange={(event) => {
                setMaxOrders(event.target.value)
                setPage(1)
              }}
              placeholder="100"
            />
          </label>
          <label className="input-group">
            Actividad
            <select
              value={activityDays}
              onChange={(event) => {
                setActivityDays(event.target.value)
                setPage(1)
              }}
            >
              <option value="">Todas</option>
              <option value="7">Ultimos 7 dias</option>
              <option value="30">Ultimos 30 dias</option>
              <option value="90">Ultimos 90 dias</option>
            </select>
          </label>
        </div>
        <div className="toolbar-actions">
          <button className="ghost-btn" type="button" onClick={handleClearFilters}>
            Limpiar filtros
          </button>
          <button className="primary-btn" type="button" onClick={handleExport}>
            Exportar CSV
          </button>
        </div>
      </section>

      <section className="card">
        <h2>Listado general</h2>
        {isLoading ? (
          <p>Cargando tenants...</p>
        ) : tenantsData?.items.length ? (
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>API Key</th>
                <th>Ventas</th>
                <th>Ordenes 30d</th>
                <th>Ultima actividad</th>
                <th>Estado</th>
                <th>Creado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tenantsData?.items.map((tenant) => {
                const type = businessTypes.find((item) => item.value === tenant.businessType)
                const lastActivity = tenant.lastActivityAt
                  ? new Date(tenant.lastActivityAt).toLocaleDateString()
                  : 'Sin actividad'
                const staleThreshold = new Date()
                staleThreshold.setDate(staleThreshold.getDate() - 30)
                const isStale = tenant.lastActivityAt
                  ? new Date(tenant.lastActivityAt) < staleThreshold
                  : true
                return (
                  <tr key={tenant.id}>
                    <td>{tenant.name}</td>
                    <td>{type?.label ?? tenant.businessType}</td>
                    <td className="cell-compact">
                      <span className="truncate">{tenant.apiKey}</span>
                    </td>
                    <td>{formatCurrency(tenant.totalSales ?? 0)}</td>
                    <td>{tenant.ordersLast30Days ?? 0}</td>
                    <td>
                      <span className={`status-pill ${isStale ? 'status-off' : 'status-on'}`}>
                        {lastActivity}
                      </span>
                    </td>
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
                            openConfirm({
                              title: tenant.isActive ? 'Desactivar tenant' : 'Activar tenant',
                              description: tenant.isActive
                                ? `El tenant ${tenant.name} quedara inactivo.`
                                : `El tenant ${tenant.name} volvera a estar activo.`,
                              confirmLabel: tenant.isActive ? 'Desactivar' : 'Activar',
                              onConfirm: () =>
                                statusMutation.mutate({ tenantId: tenant.id, isActive: !tenant.isActive }),
                            })
                          }
                        >
                          {tenant.isActive ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          className="ghost-btn"
                          onClick={() =>
                            openConfirm({
                              title: 'Regenerar API Key',
                              description: `La key anterior del tenant ${tenant.name} quedara invalida.`,
                              confirmLabel: 'Regenerar',
                              onConfirm: () => regenerateMutation.mutate(tenant.id),
                            })
                          }
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
        ) : (
          <p>No se encontraron tenants con esos filtros.</p>
        )}

        <div className="pagination">
          <label className="input-group inline">
            Por pagina
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value))
                setPage(1)
              }}
            >
              <option value={8}>8</option>
              <option value={12}>12</option>
              <option value={16}>16</option>
              <option value={24}>24</option>
            </select>
          </label>
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
      {confirmAction ? (
        <ConfirmDialog
          open
          title={confirmAction.title}
          description={confirmAction.description}
          confirmLabel={confirmAction.confirmLabel}
          onClose={() => setConfirmAction(null)}
          onConfirm={() => {
            confirmAction.onConfirm()
            setConfirmAction(null)
          }}
        />
      ) : null}
      {toast ? <Toast message={toast} onClose={() => setToast(null)} /> : null}
    </AdminLayout>
  )
}

export default TenantsPage
