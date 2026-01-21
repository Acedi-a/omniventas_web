import { useQuery } from '@tanstack/react-query'
import ClientLayout from '../components/ClientLayout'
import { fetchTenantOrders } from '../services/orders'

const statusLabels: Record<number, string> = {
  1: 'Pendiente',
  2: 'Pagada',
  3: 'Cancelada',
}

const OrdersPage = () => {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['client-orders'],
    queryFn: fetchTenantOrders,
  })

  return (
    <ClientLayout title="Ordenes" subtitle="Monitorea las ventas realizadas en tu negocio.">
      <section className="card">
        <h2>Ordenes recientes</h2>
        {isLoading ? (
          <p>Cargando ordenes...</p>
        ) : orders?.length ? (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Creado</th>
                <th>Pago</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.buyerEmail}</td>
                  <td>Bs {order.total.toFixed(2)}</td>
                  <td>
                    <span className={`status-pill ${order.status === 2 ? 'status-on' : 'status-off'}`}>
                      {statusLabels[order.status] ?? order.status}
                    </span>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleString()}</td>
                  <td>{order.paidAt ? new Date(order.paidAt).toLocaleString() : '---'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No hay ordenes registradas.</p>
        )}
      </section>
    </ClientLayout>
  )
}

export default OrdersPage
