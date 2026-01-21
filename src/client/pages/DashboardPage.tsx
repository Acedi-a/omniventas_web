import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import ClientLayout from '../components/ClientLayout'
import { fetchSalesStats, fetchTopProducts } from '../services/analytics'

const DashboardPage = () => {
  const { data: sales } = useQuery({
    queryKey: ['client-sales'],
    queryFn: () => fetchSalesStats('month'),
  })

  const { data: topProducts } = useQuery({
    queryKey: ['client-top-products'],
    queryFn: () => fetchTopProducts(5),
  })

  const kpis = useMemo(() => {
    return [
      { label: 'Ventas mes', value: sales?.totalSales ?? 0, suffix: 'Bs' },
      { label: 'Ordenes', value: sales?.orderCount ?? 0 },
      { label: 'Ticket promedio', value: sales?.averageOrderValue ?? 0, suffix: 'Bs' },
    ]
  }, [sales])

  return (
    <ClientLayout title="Dashboard" subtitle="Resumen rapido de ventas y productos mas vendidos.">
      <section className="card health-grid">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="kpi-card">
            <span className="kpi-label">{kpi.label}</span>
            <strong>
              {kpi.suffix ? `${kpi.suffix} ${Number(kpi.value).toFixed(2)}` : kpi.value}
            </strong>
          </div>
        ))}
      </section>

      <section className="card">
        <div className="tagline">Top productos</div>
        {topProducts?.length ? (
          <div className="list-grid">
            {topProducts.map((product) => (
              <div key={product.productId} className="list-card">
                <strong>{product.name}</strong>
                <span>{product.quantitySold} vendidos</span>
                <span>Bs {product.revenue.toFixed(2)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p>Aun no hay ventas registradas.</p>
        )}
      </section>
    </ClientLayout>
  )
}

export default DashboardPage
