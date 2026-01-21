import { FormEvent, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import ClientLayout from '../components/ClientLayout'
import Toast from '../../admin/dashboard/components/Toast'
import { createCoupon, fetchCoupons } from '../services/coupons'

const CouponsPage = () => {
  const queryClient = useQueryClient()
  const [code, setCode] = useState('')
  const [discountPercentage, setDiscountPercentage] = useState('')
  const [maxUses, setMaxUses] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { data: coupons, isLoading } = useQuery({
    queryKey: ['client-coupons'],
    queryFn: fetchCoupons,
  })

  const mutation = useMutation({
    mutationFn: createCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-coupons'] })
      setCode('')
      setDiscountPercentage('')
      setMaxUses('')
      setExpiresAt('')
      setError(null)
      setToast('Cupon creado')
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : 'No se pudo crear el cupon'
      setError(message)
    },
  })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    mutation.mutate({
      code,
      discountPercentage: Number(discountPercentage),
      maxUses: Number(maxUses),
      expiresAt,
    })
  }

  return (
    <ClientLayout title="Cupones" subtitle="Crea descuentos para potenciar tus ventas.">
      <section className="card split">
        <div>
          <div className="tagline">Nuevo cupon</div>
          <h2>Campana promocional</h2>
          <p>Define codigo, porcentaje y fecha de expiracion.</p>
        </div>
        <form onSubmit={handleSubmit} className="split">
          <label className="input-group">
            Codigo
            <input value={code} onChange={(event) => setCode(event.target.value)} required />
          </label>
          <label className="input-group">
            % Descuento
            <input
              type="number"
              min="1"
              max="100"
              value={discountPercentage}
              onChange={(event) => setDiscountPercentage(event.target.value)}
              required
            />
          </label>
          <label className="input-group">
            Max usos
            <input
              type="number"
              min="1"
              value={maxUses}
              onChange={(event) => setMaxUses(event.target.value)}
              required
            />
          </label>
          <label className="input-group">
            Expira en
            <input
              type="date"
              value={expiresAt}
              onChange={(event) => setExpiresAt(event.target.value)}
              required
            />
          </label>
          {error ? <div className="error">{error}</div> : null}
          <button className="primary-btn" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Guardando...' : 'Crear cupon'}
          </button>
        </form>
      </section>

      <section className="card">
        <h2>Cupones activos</h2>
        {isLoading ? (
          <p>Cargando cupones...</p>
        ) : coupons?.length ? (
          <table className="table">
            <thead>
              <tr>
                <th>Codigo</th>
                <th>Descuento</th>
                <th>Usos</th>
                <th>Expira</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id}>
                  <td>{coupon.code}</td>
                  <td>{coupon.discountPercentage}%</td>
                  <td>
                    {coupon.currentUses}/{coupon.maxUses}
                  </td>
                  <td>{new Date(coupon.expiresAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No hay cupones registrados.</p>
        )}
      </section>
      {toast ? <Toast message={toast} onClose={() => setToast(null)} /> : null}
    </ClientLayout>
  )
}

export default CouponsPage
