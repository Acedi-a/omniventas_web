import { FormEvent, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import ClientLayout from '../components/ClientLayout'
import Toast from '../../admin/dashboard/components/Toast'
import { createProduct, fetchProducts } from '../services/products'

const ProductsPage = () => {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { data: products, isLoading } = useQuery({
    queryKey: ['client-products'],
    queryFn: fetchProducts,
  })

  const mutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-products'] })
      setName('')
      setDescription('')
      setPrice('')
      setStock('')
      setImageUrl('')
      setError(null)
      setToast('Producto creado')
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : 'No se pudo crear el producto'
      setError(message)
    },
  })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    mutation.mutate({
      name,
      description: description || undefined,
      price: Number(price),
      stock: Number(stock),
      imageUrl: imageUrl || undefined,
    })
  }

  return (
    <ClientLayout title="Productos" subtitle="Crea y administra tu catalogo de productos.">
      <section className="card split">
        <div>
          <div className="tagline">Nuevo producto</div>
          <h2>Agrega un producto</h2>
          <p>Configura nombre, precio y stock disponible para tus clientes.</p>
        </div>
        <form onSubmit={handleSubmit} className="split">
          <label className="input-group">
            Nombre
            <input value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
          <label className="input-group">
            Descripcion
            <input value={description} onChange={(event) => setDescription(event.target.value)} />
          </label>
          <label className="input-group">
            Precio
            <input
              type="number"
              min="0"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              required
            />
          </label>
          <label className="input-group">
            Stock
            <input
              type="number"
              min="0"
              value={stock}
              onChange={(event) => setStock(event.target.value)}
              required
            />
          </label>
          <label className="input-group">
            Imagen (URL)
            <input value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} />
          </label>
          {error ? <div className="error">{error}</div> : null}
          <button className="primary-btn" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Guardando...' : 'Crear producto'}
          </button>
        </form>
      </section>

      <section className="card">
        <h2>Catalogo</h2>
        {isLoading ? (
          <p>Cargando productos...</p>
        ) : products?.length ? (
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Creado</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>Bs {product.price.toFixed(2)}</td>
                  <td>{product.stock}</td>
                  <td>{new Date(product.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No hay productos registrados.</p>
        )}
      </section>
      {toast ? <Toast message={toast} onClose={() => setToast(null)} /> : null}
    </ClientLayout>
  )
}

export default ProductsPage
