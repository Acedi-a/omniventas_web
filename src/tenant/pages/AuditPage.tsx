import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import TenantLayout from '../components/TenantLayout'
import { fetchTenantAuditLogs } from '../services/audit'

const AuditPage = () => {
  const [action, setAction] = useState('')
  const [userId, setUserId] = useState('')
  const [metadata, setMetadata] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState(1)

  const { data } = useQuery({
    queryKey: ['tenant-audit', action, userId, metadata, from, to, page],
    queryFn: () =>
      fetchTenantAuditLogs({
        action: action || undefined,
        userId: userId || undefined,
        metadata: metadata || undefined,
        from: from || undefined,
        to: to || undefined,
        page,
        pageSize: 20,
      }),
  })

  const totalPages = data ? Math.ceil(data.totalCount / data.pageSize) : 1

  return (
    <TenantLayout title="Auditoria" subtitle="Historial de accesos y acciones del negocio.">
      <section className="card toolbar">
        <label className="input-group">
          Accion
          <input value={action} onChange={(event) => setAction(event.target.value)} placeholder="tenant.login" />
        </label>
        <label className="input-group">
          User ID
          <input value={userId} onChange={(event) => setUserId(event.target.value)} placeholder="15" />
        </label>
        <label className="input-group">
          Metadata
          <input value={metadata} onChange={(event) => setMetadata(event.target.value)} placeholder="slug" />
        </label>
        <label className="input-group">
          Desde
          <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
        </label>
        <label className="input-group">
          Hasta
          <input type="date" value={to} onChange={(event) => setTo(event.target.value)} />
        </label>
      </section>

      <section className="card">
        <h2>Logs</h2>
        {data?.items.length ? (
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Accion</th>
                <th>User</th>
                <th>Metadata</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.createdAt).toLocaleString()}</td>
                  <td>{log.action}</td>
                  <td>{log.userId ?? '-'}</td>
                  <td className="truncate">{log.metadata ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No hay registros aun.</p>
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
    </TenantLayout>
  )
}

export default AuditPage
