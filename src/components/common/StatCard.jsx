import { formatInteger } from '../../utils/formatters'

export function StatCard({ label, value, tone = 'blue', note }) {
  return (
    <article className="stat-card">
      <span className={`stat-dot stat-dot-${tone}`} aria-hidden="true" />
      <p>{label}</p>
      <strong>{formatInteger(value)}</strong>
      {note && <small>{note}</small>}
    </article>
  )
}
