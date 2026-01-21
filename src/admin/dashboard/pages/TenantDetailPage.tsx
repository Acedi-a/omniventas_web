import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import ConfirmDialog from '../components/ConfirmDialog'
import Toast from '../components/Toast'
import {
  fetchTenantDetail,
  fetchTenantActivity,
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
  const [toast, setToast] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<{
    title: string
    description: string
    confirmLabel?: string
    onConfirm: () => void
  } | null>(null)

  const openConfirm = (payload: {
    title: string
    description: string
    confirmLabel?: string
    onConfirm: () => void
  }) => {
    setConfirmAction(payload)
  }

  const activityLabels: Record<string, string> = {
    order: 'Orden',
    user: 'Usuario',
    product: 'Producto',
    event: 'Evento',
    coupon: 'Cupon',
  }

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

  const { data: activity } = useQuery({
    queryKey: ['tenant-activity', tenantId],
    queryFn: () => fetchTenantActivity(tenantId, 8),
    enabled: Number.isFinite(tenantId),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) => updateTenantStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-detail', tenantId] })
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
      queryClient.invalidateQueries({ queryKey: ['tenant-summary'] })
      setToast('Estado actualizado')
    },
  })

  const regenMutation = useMutation({
    mutationFn: (id: number) => regenerateTenantApiKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-detail', tenantId] })
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
      setToast('API key regenerada')
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
            <button
              className="ghost-btn"
              onClick={async () => {
                await navigator.clipboard.writeText(tenant.apiKey)
                setToast('API key copiada')
              }}
            >
              Copiar key
            </button>
            <button
              className="ghost-btn"
              onClick={() =>
                openConfirm({
                  title: 'Regenerar API Key',
                  description: 'La key anterior quedara invalida para este tenant.',
                  confirmLabel: 'Regenerar',
                  onConfirm: () => regenMutation.mutate(tenant.id),
                })
              }
            >
              Regenerar key
            </button>
            <button
              className="ghost-btn"
              onClick={() =>
                openConfirm({
                  title: tenant.isActive ? 'Desactivar tenant' : 'Activar tenant',
                  description: tenant.isActive
                    ? 'El tenant quedara inactivo y no podra operar.'
                    : 'El tenant volvera a estar activo.',
                  confirmLabel: tenant.isActive ? 'Desactivar' : 'Activar',
                  onConfirm: () => statusMutation.mutate({ id: tenant.id, isActive: !tenant.isActive }),
                })
              }
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
            <h3>Pagadas</h3>
            <p>{stats?.paidOrdersCount ?? 0}</p>
          </div>
          <div>
            <h3>Pendientes</h3>
            <p>{stats?.pendingOrdersCount ?? 0}</p>
          </div>
          <div>
            <h3>Canceladas</h3>
            <p>{stats?.cancelledOrdersCount ?? 0}</p>
          </div>
          <div>
            <h3>Cupones activos</h3>
            <p>{stats?.activeCouponsCount ?? 0}</p>
          </div>
          <div>
            <h3>Ventas totales</h3>
            <p>Bs {stats?.totalSales.toFixed(2) ?? '0.00'}</p>
          </div>
          <div>
            <h3>Ultima orden</h3>
            <p>
              {stats?.lastOrderAt ? new Date(stats.lastOrderAt).toLocaleString() : 'Sin ordenes'}
            </p>
          </div>
          <div>
            <h3>Monto ultima orden</h3>
            <p>
              {stats?.lastOrderTotal !== null && stats?.lastOrderTotal !== undefined
                ? `Bs ${stats.lastOrderTotal.toFixed(2)}`
                : '---'}
            </p>
          </div>
          <div>
            <h3>Ultimo usuario</h3>
            <p>{stats?.lastUserAt ? new Date(stats.lastUserAt).toLocaleDateString() : '---'}</p>
          </div>
          <div>
            <h3>Ultimo evento</h3>
            <p>{stats?.lastEventAt ? new Date(stats.lastEventAt).toLocaleDateString() : '---'}</p>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="tagline">Actividad reciente</div>
        {activity?.length ? (
          <div className="activity-list">
            {activity.map((item) => (
                <div key={`${item.type}-${item.referenceId}-${item.occurredAt}`} className="activity-item">
                  <div>
                    <div className="pill">{activityLabels[item.type] ?? item.type}</div>
                    <strong>{item.title}</strong>
                    <p>{item.description}</p>
                  </div>
                  <div className="activity-meta">
                    <span>{new Date(item.occurredAt).toLocaleString()}</span>
                    {item.amount !== null && item.amount !== undefined ? (
                      <span>Bs {item.amount.toFixed(2)}</span>
                    ) : null}
                  </div>
                </div>
            ))}
          </div>
        ) : (
          <p>No hay actividad reciente.</p>
        )}
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

export default TenantDetailPage
