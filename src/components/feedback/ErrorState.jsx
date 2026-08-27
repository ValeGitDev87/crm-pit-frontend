import { Button } from '../common/Button'

export function ErrorState({ title = 'Qualcosa è andato storto', message, onRetry }) {
  return (
    <div className="content-state content-state-bordered" role="alert">
      <span className="state-icon" aria-hidden="true">!</span>
      <h2>{title}</h2>
      <p>{message || 'Non è stato possibile caricare i dati.'}</p>
      {onRetry && <Button type="button" onClick={onRetry}>Riprova</Button>}
    </div>
  )
}
