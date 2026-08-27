import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="route-state">
      <p className="route-code">404</p>
      <h1>Pagina non trovata</h1>
      <p>La pagina richiesta non esiste oppure è stata spostata.</p>
      <Link className="button button-primary link-button" to="/dashboard">Torna alla dashboard</Link>
    </div>
  )
}
