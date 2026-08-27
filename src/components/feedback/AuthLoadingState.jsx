export function AuthLoadingState() {
  return (
    <main className="centered-state" aria-live="polite" aria-busy="true">
      <span className="spinner" aria-hidden="true" />
      <p>Verifica della sessione…</p>
    </main>
  )
}
