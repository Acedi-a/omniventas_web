import { FormEvent, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import TenantLayout from '../components/TenantLayout'
import { createEvent, fetchEvents } from '../services/events'

const EventsPage = () => {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [location, setLocation] = useState('')
  const [price, setPrice] = useState(0)
  const [maxCapacity, setMaxCapacity] = useState(50)
  const [error, setError] = useState<string | null>(null)

  const { data: events } = useQuery({
    queryKey: ['tenant-events'],
    queryFn: fetchEvents,
  })

  const mutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-events'] })
      setName('')
      setEventDate('')
      setLocation('')
      setPrice(0)
      setMaxCapacity(50)
      setError(null)
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : 'No se pudo crear el evento'
      setError(message)
    },
  })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    mutation.mutate({ name, eventDate, location, price, maxCapacity })
  }

  return (
    <TenantLayout title="Eventos" subtitle="Planifica experiencias y controla entradas.">
      <section className="card split">
        <form onSubmit={handleSubmit} className="split">
          <label className="input-group">
            Nombre
            <input value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
          <label className="input-group">
            Fecha
            <input type="datetime-local" value={eventDate} onChange={(event) => setEventDate(event.target.value)} />
          </label>
          <label className="input-group">
            Lugar
            <input value={location} onChange={(event) => setLocation(event.target.value)} />
          </label>
          <label className="input-group">
            Capacidad
            <input
              type="number"
              value={maxCapacity}
              onChange={(event) => setMaxCapacity(Number(event.target.value))}
            />
          </label>
          <label className="input-group">
            Precio
            <input type="number" value={price} onChange={(event) => setPrice(Number(event.target.value))} />
          </label>
          {error ? <div className="error">{error}</div> : null}
          <button className="primary-btn" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Creando...' : 'Crear evento'}
          </button>
        </form>
      </section>

      <section className="card">
        <h2>Eventos activos</h2>
        {events?.length ? (
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Fecha</th>
                <th>Precio</th>
                <th>Tickets</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td>{event.name}</td>
                  <td>{new Date(event.eventDate).toLocaleString()}</td>
                  <td>Bs {event.price.toFixed(2)}</td>
                  <td>{event.availableTickets}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Aun no tienes eventos.</p>
        )}
      </section>
    </TenantLayout>
  )
}

export default EventsPage
