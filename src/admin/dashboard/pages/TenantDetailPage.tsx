import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import {
  fetchTenantDetail,
  fetchTenantStats,
  regenerateTenantApiKey,
  updateTenantStatus,
} from '../services/tenants'

const businessTypes: Record<number, string> = {
  1: 'Commerce',
  2: 'Events',
  3: 'Hybrid',
}

const TenantDetailPage = () => {
  const params = useParams()
  const tenantId = Number(params.id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: tenant } = useQuery({
    queryKey: ['tenant-detail', tenantId],
    queryFn: () => fetchTenantDetail(tenantId),
    enabled: Number.isFinite(tenantId),
  })

  const { data: stats } = useQuery({
    queryKey: ['tenant-stats', tenantId],
    queryFn: () => fetchTenantStats(tenantId),
    enabled: Number.isFinite(tenantId),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) => updateTenantStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-detail', tenantId] })
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
      queryClient.invalidateQueries({ queryKey: ['tenant-summary'] })
    },
  })

  const regenMutation = useMutation({
    mutationFn: (id: number) => regenerateTenantApiKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-detail', tenantId] })
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
    },
  })

  if (!tenant) {
    return (
      <AdminLayout title="Detalle del tenant" subtitle="Cargando informacion...">
        <section className="card">
          <p>No se encontro el tenant.</p>
          <button className="ghost-btn" onClick={() => navigate('/admin/tenants')}>
            Volver al listado
          </button>
        </section>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title={tenant.name} subtitle="Informacion del tenant y actividad reciente.">
      <section className="card split">
        <div>
          <div className="tagline">Perfil</div>
          <h2>{tenant.name}</h2>
          <p>Tipo: {businessTypes[tenant.businessType] ?? tenant.businessType}</p>
          <p>Creado: {new Date(tenant.createdAt).toLocaleDateString()}</p>
          <p>
            Estado:{' '}
            <span className={`status-pill ${tenant.isActive ? 'status-on' : 'status-off'}`}>
              {tenant.isActive ? 'Activo' : 'Inactivo'}
            </span>
          </p>
        </div>
        <div>
          <div className="tagline">API Key</div>
          <p className="api-key">{tenant.apiKey}</p>
          <div className="action-row">
            <button className="ghost-btn" onClick={() => navigator.clipboard.writeText(tenant.apiKey)}>
              Copiar key
            </button>
            <button className="ghost-btn" onClick={() => regenMutation.mutate(tenant.id)}>
              Regenerar key
            </button>
            <button
              className="ghost-btn"
              onClick={() => statusMutation.mutate({ id: tenant.id, isActive: !tenant.isActive })}
            >
              {tenant.isActive ? 'Desactivar' : 'Activar'}
            </button>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="tagline">Metricas</div>
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
            <h3>Ventas totales</h3>
            <p>Bs {stats?.totalSales.toFixed(2) ?? '0.00'}</p>
          </div>
        </div>
      </section>
    </AdminLayout>
  )
}

export default TenantDetailPage
