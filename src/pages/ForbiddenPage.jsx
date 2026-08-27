import { Link } from 'react-router-dom'

export function ForbiddenPage() {
  return (
    <div className="route-state">
      <p className="route-code">403</p>
      <h1>Accesso non autorizzato</h1>
      <p>Questa sezione è riservata agli amministratori.</p>
      <Link className="button button-primary link-button" to="/dashboard">Torna alla dashboard</Link>
    </div>
  )
}
