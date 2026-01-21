import TenantLayout from '../components/TenantLayout'

const ApiKeyPage = () => {
  const apiKey = localStorage.getItem('tenant_api_key')
  const tenantName = localStorage.getItem('tenant_name') ?? 'Negocio'

  return (
    <TenantLayout title="API Key" subtitle="Comparte esta llave solo con integraciones seguras.">
      <section className="card">
        <h2>{tenantName}</h2>
        <p className="api-key mono">{apiKey ?? 'Sin API Key asignada.'}</p>
      </section>
    </TenantLayout>
  )
}

export default ApiKeyPage
