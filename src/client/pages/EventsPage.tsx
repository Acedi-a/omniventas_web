import { FormEvent, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import ClientLayout from '../components/ClientLayout'
import Toast from '../../admin/dashboard/components/Toast'
import { createEvent, fetchEvents } from '../services/events'

const EventsPage = () => {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [location, setLocation] = useState('')
  const [maxCapacity, setMaxCapacity] = useState('')
  const [price, setPrice] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { data: events, isLoading } = useQuery({
    queryKey: ['client-events'],
    queryFn: fetchEvents,
  })

  const mutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-events'] })
      setName('')
      setEventDate('')
      setLocation('')
      setMaxCapacity('')
      setPrice('')
      setError(null)
      setToast('Evento creado')
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : 'No se pudo crear el evento'
      setError(message)
    },
  })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    mutation.mutate({
      name,
      eventDate,
      location,
      maxCapacity: Number(maxCapacity),
      price: Number(price),
    })
  }

  return (
    <ClientLayout title="Eventos" subtitle="Programa y administra tus eventos.">
      <section className="card split">
        <div>
          <div className="tagline">Nuevo evento</div>
          <h2>Agenda un evento</h2>
          <p>Define fecha, capacidad y precio para la venta de entradas.</p>
        </div>
        <form onSubmit={handleSubmit} className="split">
          <label className="input-group">
            Nombre
            <input value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
          <label className="input-group">
            Fecha y hora
            <input
              type="datetime-local"
              value={eventDate}
              onChange={(event) => setEventDate(event.target.value)}
              required
            />
          </label>
          <label className="input-group">
            Ubicacion
            <input value={location} onChange={(event) => setLocation(event.target.value)} required />
          </label>
          <label className="input-group">
            Capacidad maxima
            <input
              type="number"
              min="1"
              value={maxCapacity}
              onChange={(event) => setMaxCapacity(event.target.value)}
              required
            />
          </label>
          <label className="input-group">
            Precio entrada
            <input
              type="number"
              min="0"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              required
            />
          </label>
          {error ? <div className="error">{error}</div> : null}
          <button className="primary-btn" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Guardando...' : 'Crear evento'}
          </button>
        </form>
      </section>

      <section className="card">
        <h2>Eventos programados</h2>
        {isLoading ? (
          <p>Cargando eventos...</p>
        ) : events?.length ? (
          <table className="table">
            <thead>
              <tr>
                <th>Evento</th>
                <th>Fecha</th>
                <th>Disponibles</th>
                <th>Precio</th>
              </tr>
            </thead>
            <tbody>
              {events.map((eventItem) => (
                <tr key={eventItem.id}>
                  <td>{eventItem.name}</td>
                  <td>{new Date(eventItem.eventDate).toLocaleString()}</td>
                  <td>{eventItem.availableTickets}</td>
                  <td>Bs {eventItem.price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No hay eventos registrados.</p>
        )}
      </section>
      {toast ? <Toast message={toast} onClose={() => setToast(null)} /> : null}
    </ClientLayout>
  )
}

export default EventsPage
