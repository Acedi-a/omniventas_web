import { FormEvent, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import ConfirmDialog from '../components/ConfirmDialog'
import TenantLayout from '../components/TenantLayout'
import { createProduct, deleteProduct, fetchProducts, updateProduct } from '../services/products'
import { uploadTenantImage } from '../services/uploads'

const ProductsPage = () => {
  const queryClient = useQueryClient()
  const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [price, setPrice] = useState(0)
  const [stock, setStock] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [editingProductId, setEditingProductId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editImageUrl, setEditImageUrl] = useState('')
  const [editPrice, setEditPrice] = useState(0)
  const [editStock, setEditStock] = useState(0)
  const [editUploadProgress, setEditUploadProgress] = useState(0)
  const [editUploadError, setEditUploadError] = useState<string | null>(null)
  const [editUploading, setEditUploading] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<{
    title: string
    description: string
    confirmLabel?: string
    onConfirm: () => void
  } | null>(null)

  const { data: products } = useQuery({
    queryKey: ['tenant-products'],
    queryFn: fetchProducts,
  })

  const mutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-products'] })
      setName('')
      setDescription('')
      setImageUrl('')
      setPrice(0)
      setStock(0)
      setError(null)
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : 'No se pudo crear el producto'
      setError(message)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Parameters<typeof updateProduct>[1] }) =>
      updateProduct(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-products'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-products'] })
    },
  })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    mutation.mutate({ name, description: description || undefined, imageUrl: imageUrl || undefined, price, stock })
  }

  const resolveImageUrl = (url?: string | null) => {
    if (!url) return ''
    return url.startsWith('http') ? url : `${apiBaseUrl}${url}`
  }

  const handleImageFile = async (file?: File | null) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setUploadError('Solo se permiten imagenes')
      return
    }
    if (file.size > 5_000_000) {
      setUploadError('Maximo 5MB por imagen')
      return
    }
    setUploading(true)
    setUploadError(null)
    setUploadProgress(0)
    try {
      const response = await uploadTenantImage(file, setUploadProgress)
      setImageUrl(resolveImageUrl(response.url))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo subir la imagen'
      setUploadError(message)
    } finally {
      setUploading(false)
    }
  }

  const handleClearImage = (id: number) => {
    const product = products?.find((item) => item.id === id)
    if (!product) return
    updateMutation.mutate({
      id,
      payload: {
        name: product.name,
        description: product.description ?? null,
        price: product.price,
        stock: product.stock,
        imageUrl: null,
      },
    })
  }

  const openEditModal = (id: number) => {
    const product = products?.find((item) => item.id === id)
    if (!product) return
    setEditingProductId(id)
    setEditName(product.name)
    setEditDescription(product.description ?? '')
    setEditImageUrl(product.imageUrl ?? '')
    setEditPrice(product.price)
    setEditStock(product.stock)
    setEditUploadError(null)
    setEditUploadProgress(0)
    setEditError(null)
  }

  const closeEditModal = () => {
    setEditingProductId(null)
  }

  const handleEditImageFile = async (file?: File | null) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setEditUploadError('Solo se permiten imagenes')
      return
    }
    if (file.size > 5_000_000) {
      setEditUploadError('Maximo 5MB por imagen')
      return
    }
    setEditUploading(true)
    setEditUploadError(null)
    setEditUploadProgress(0)
    try {
      const response = await uploadTenantImage(file, setEditUploadProgress)
      setEditImageUrl(resolveImageUrl(response.url))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo subir la imagen'
      setEditUploadError(message)
    } finally {
      setEditUploading(false)
    }
  }

  const handleUpdate = () => {
    if (!editingProductId) return
    if (!editName.trim()) {
      setEditError('El nombre es obligatorio')
      return
    }
    if (editPrice < 0 || editStock < 0) {
      setEditError('Precio y stock deben ser positivos')
      return
    }
    setEditError(null)
    setConfirmAction({
      title: 'Guardar cambios',
      description: 'Se actualizara la informacion del producto.',
      confirmLabel: 'Guardar',
      onConfirm: () => {
        updateMutation.mutate({
          id: editingProductId,
          payload: {
            name: editName,
            description: editDescription || null,
            price: editPrice,
            stock: editStock,
            imageUrl: editImageUrl || null,
          },
        })
        closeEditModal()
      },
    })
  }

  const openDeleteConfirm = (id: number) => {
    const product = products?.find((item) => item.id === id)
    if (!product) return
    setConfirmAction({
      title: 'Eliminar producto',
      description: `Se eliminara ${product.name} del catalogo.`,
      confirmLabel: 'Eliminar',
      onConfirm: () => deleteMutation.mutate(id),
    })
  }

  return (
    <TenantLayout title="Productos" subtitle="Gestiona el catalogo del negocio.">
      <section className="card split">
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
            URL de imagen
            <input value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} />
          </label>
          <label className="input-group">
            Subir imagen
            <input type="file" accept="image/*" onChange={(event) => handleImageFile(event.target.files?.[0])} />
          </label>
          {uploading ? (
            <div className="status-chip">
              Subiendo imagen... {uploadProgress}%
            </div>
          ) : null}
          {uploadError ? <div className="error">{uploadError}</div> : null}
          {imageUrl ? <img className="thumb preview" src={resolveImageUrl(imageUrl)} alt="Preview" /> : null}
          <label className="input-group">
            Precio
            <input
              type="number"
              value={price}
              onChange={(event) => setPrice(Number(event.target.value))}
              required
            />
          </label>
          <label className="input-group">
            Stock
            <input
              type="number"
              value={stock}
              onChange={(event) => setStock(Number(event.target.value))}
              required
            />
          </label>
          {error ? <div className="error">{error}</div> : null}
          <button className="primary-btn" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Creando...' : 'Crear producto'}
          </button>
        </form>
      </section>

      <section className="card">
        <h2>Catalogo</h2>
        {products?.length ? (
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripcion</th>
                <th>Imagen</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.description ?? '-'}</td>
                  <td>
                    {product.imageUrl ? (
                      <img className="thumb" src={resolveImageUrl(product.imageUrl)} alt={product.name} />
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>Bs {product.price.toFixed(2)}</td>
                  <td>{product.stock}</td>
                  <td>
                    {product.imageUrl ? (
                      <button className="ghost-btn" onClick={() => handleClearImage(product.id)}>
                        Quitar imagen
                      </button>
                    ) : (
                      '-'
                    )}
                    <button className="ghost-btn" onClick={() => openEditModal(product.id)}>
                      Editar
                    </button>
                    <button className="ghost-btn" onClick={() => openDeleteConfirm(product.id)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Aun no tienes productos.</p>
        )}
      </section>
      {editingProductId ? (
        <div className="modal-backdrop" onClick={closeEditModal}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <h2>Editar producto</h2>
            <div className="split">
              <label className="input-group">
                Nombre
                <input value={editName} onChange={(event) => setEditName(event.target.value)} />
              </label>
              <label className="input-group">
                Descripcion
                <input value={editDescription} onChange={(event) => setEditDescription(event.target.value)} />
              </label>
              <label className="input-group">
                URL de imagen
                <input value={editImageUrl} onChange={(event) => setEditImageUrl(event.target.value)} />
              </label>
              <label className="input-group">
                Subir imagen
                <input type="file" accept="image/*" onChange={(event) => handleEditImageFile(event.target.files?.[0])} />
              </label>
              {editUploading ? (
                <div className="status-chip">Subiendo imagen... {editUploadProgress}%</div>
              ) : null}
              {editUploadError ? <div className="error">{editUploadError}</div> : null}
              {editError ? <div className="error">{editError}</div> : null}
              {editImageUrl ? <img className="thumb preview" src={resolveImageUrl(editImageUrl)} alt="Preview" /> : null}
              <label className="input-group">
                Precio
                <input type="number" value={editPrice} onChange={(event) => setEditPrice(Number(event.target.value))} />
              </label>
              <label className="input-group">
                Stock
                <input type="number" value={editStock} onChange={(event) => setEditStock(Number(event.target.value))} />
              </label>
            </div>
            <div className="toolbar-actions">
              <button className="ghost-btn" type="button" onClick={closeEditModal}>
                Cancelar
              </button>
              <button className="primary-btn" type="button" onClick={handleUpdate}>
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      ) : null}
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
    </TenantLayout>
  )
}

export default ProductsPage
