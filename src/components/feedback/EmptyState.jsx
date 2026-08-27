export function EmptyState({ title = 'Nessun elemento', description, action }) {
  return (
    <div className="content-state content-state-bordered">
      <span className="empty-illustration" aria-hidden="true">—</span>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {action}
    </div>
  )
}
