import { Button } from './Button'

export function Pagination({ meta, onPageChange, disabled = false }) {
  const current = Number(meta?.current_page || 1)
  const last = Number(meta?.last_page || 1)
  if (last <= 1) return null

  return (
    <nav className="pagination" aria-label="Paginazione">
      <p>Pagina <strong>{current}</strong> di <strong>{last}</strong> · {meta?.total || 0} risultati</p>
      <div>
        <Button type="button" variant="secondary" disabled={disabled || current <= 1} onClick={() => onPageChange(current - 1)}>Precedente</Button>
        <Button type="button" variant="secondary" disabled={disabled || current >= last} onClick={() => onPageChange(current + 1)}>Successiva</Button>
      </div>
    </nav>
  )
}
