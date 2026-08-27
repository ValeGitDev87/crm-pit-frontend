export function SessionErrorState({ message, onRetry }) {
  return (
    <main className="centered-state">
      <div className="state-card" role="alert">
        <span className="state-icon" aria-hidden="true">!</span>
        <h1>CRM non raggiungibile</h1>
        <p>{message || 'Non è stato possibile verificare la sessione.'}</p>
        <button className="button button-primary" type="button" onClick={onRetry}>
          Riprova
        </button>
      </div>
    </main>
  )
}
