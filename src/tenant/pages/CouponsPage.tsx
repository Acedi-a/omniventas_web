import { FormEvent, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import TenantLayout from '../components/TenantLayout'
import { createCoupon, fetchCoupons } from '../services/coupons'

const CouponsPage = () => {
  const queryClient = useQueryClient()
  const [code, setCode] = useState('')
  const [discountPercentage, setDiscountPercentage] = useState(10)
  const [maxUses, setMaxUses] = useState(100)
  const [expiresAt, setExpiresAt] = useState('')
  const [error, setError] = useState<string | null>(null)

  const { data: coupons } = useQuery({
    queryKey: ['tenant-coupons'],
    queryFn: fetchCoupons,
  })

  const mutation = useMutation({
    mutationFn: createCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-coupons'] })
      setCode('')
      setDiscountPercentage(10)
      setMaxUses(100)
      setExpiresAt('')
      setError(null)
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : 'No se pudo crear el cupon'
      setError(message)
    },
  })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    mutation.mutate({ code, discountPercentage, maxUses, expiresAt })
  }

  return (
    <TenantLayout title="Cupones" subtitle="Crea promociones para aumentar las ventas.">
      <section className="card split">
        <form onSubmit={handleSubmit} className="split">
          <label className="input-group">
            Codigo
            <input value={code} onChange={(event) => setCode(event.target.value)} required />
          </label>
          <label className="input-group">
            Descuento (%)
            <input
              type="number"
              value={discountPercentage}
              onChange={(event) => setDiscountPercentage(Number(event.target.value))}
            />
          </label>
          <label className="input-group">
            Max usos
            <input type="number" value={maxUses} onChange={(event) => setMaxUses(Number(event.target.value))} />
          </label>
          <label className="input-group">
            Expira
            <input type="datetime-local" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} />
          </label>
          {error ? <div className="error">{error}</div> : null}
          <button className="primary-btn" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Creando...' : 'Crear cupon'}
          </button>
        </form>
      </section>

      <section className="card">
        <h2>Cupones activos</h2>
        {coupons?.length ? (
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
          <p>Aun no tienes cupones.</p>
        )}
      </section>
    </TenantLayout>
  )
}

export default CouponsPage
