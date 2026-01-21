import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
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
import { Line } from 'react-chartjs-2'
import AdminLayout from '../components/AdminLayout'
import { fetchHealthSummary, fetchHealthTrends } from '../services/health'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend)

const formatCurrency = (value: number) => `Bs ${value.toFixed(2)}`

const HealthPage = () => {
  const { data: summary } = useQuery({
    queryKey: ['health-summary'],
    queryFn: fetchHealthSummary,
  })

  const { data: trends } = useQuery({
    queryKey: ['health-trends'],
    queryFn: () => fetchHealthTrends(14),
  })

  const lineData = useMemo(() => {
    return {
      labels: trends?.map((point) => point.date) ?? [],
      datasets: [
        {
          label: 'Ordenes pagadas',
          data: trends?.map((point) => point.paidOrders) ?? [],
          borderColor: '#2c7a7b',
          backgroundColor: 'rgba(44, 122, 123, 0.18)',
          tension: 0.35,
          yAxisID: 'y',
        },
        {
          label: 'Revenue',
          data: trends?.map((point) => point.revenue) ?? [],
          borderColor: '#c9784b',
          backgroundColor: 'rgba(201, 120, 75, 0.2)',
          tension: 0.35,
          yAxisID: 'y1',
        },
      ],
    }
  }, [trends])

  const options = useMemo(() => {
    return {
      responsive: true,
      plugins: { legend: { display: true } },
      scales: {
        y: { position: 'left', grid: { color: 'rgba(31, 42, 51, 0.08)' } },
        y1: { position: 'right', grid: { drawOnChartArea: false } },
      },
    }
  }, [])

  return (
    <AdminLayout
      title="Health del SaaS"
      subtitle="Monitor rapido del estado general del servicio y la operacion de la plataforma."
    >
      <section className="card health-grid">
        <div className="kpi-card">
          <span className="kpi-label">Database</span>
          <strong className={summary?.databaseConnected ? 'status-ok' : 'status-warn'}>
            {summary?.databaseConnected ? 'Conectada' : 'Sin conexion'}
          </strong>
          <span className="kpi-meta">Uptime {summary ? `${summary.uptimeHours.toFixed(1)}h` : '--'}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Tenants activos</span>
          <strong>{summary?.activeTenants ?? 0}</strong>
          <span className="kpi-meta">Total {summary?.totalTenants ?? 0}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Tenants con actividad 30d</span>
          <strong>{summary?.activeTenantsLast30Days ?? 0}</strong>
          <span className="kpi-meta">Ultimo tenant {summary?.lastTenantAt ? new Date(summary.lastTenantAt).toLocaleDateString() : '--'}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Ordenes pagadas 24h</span>
          <strong>{summary?.paidOrdersLast24Hours ?? 0}</strong>
          <span className="kpi-meta">7d {summary?.paidOrdersLast7Days ?? 0}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Revenue 24h</span>
          <strong>{formatCurrency(summary?.revenueLast24Hours ?? 0)}</strong>
          <span className="kpi-meta">7d {formatCurrency(summary?.revenueLast7Days ?? 0)}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Ordenes pendientes</span>
          <strong>{summary?.pendingOrders ?? 0}</strong>
          <span className="kpi-meta">Canceladas {summary?.cancelledOrders ?? 0}</span>
        </div>
      </section>

      <section className="card">
        <div className="tagline">Tendencias</div>
        <h2>Ordenes pagadas y revenue (14 dias)</h2>
        <Line data={lineData} options={options} />
      </section>

      <section className="card">
        <div className="tagline">Actividad global</div>
        <div className="metrics-grid">
          <div>
            <h3>Ultima orden</h3>
            <p>{summary?.lastOrderAt ? new Date(summary.lastOrderAt).toLocaleString() : 'Sin ordenes'}</p>
          </div>
          <div>
            <h3>Ultimo usuario</h3>
            <p>{summary?.lastUserAt ? new Date(summary.lastUserAt).toLocaleString() : 'Sin usuarios'}</p>
          </div>
          <div>
            <h3>Ultimo tenant creado</h3>
            <p>{summary?.lastTenantAt ? new Date(summary.lastTenantAt).toLocaleString() : 'Sin tenants'}</p>
          </div>
        </div>
      </section>
    </AdminLayout>
  )
}

export default HealthPage
