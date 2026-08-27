export function LoadingState({ label = 'Caricamento in corso…' }) {
  return (
    <div className="content-state" aria-live="polite" aria-busy="true">
      <span className="spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  )
}
