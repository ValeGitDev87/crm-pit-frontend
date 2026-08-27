import { EmptyState } from '../feedback/EmptyState'

export function DataTable({ columns, rows, rowKey = 'id', emptyTitle = 'Nessun dato disponibile' }) {
  if (!rows?.length) return <EmptyState title={emptyTitle} description="Non ci sono elementi da mostrare in questo momento." />

  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead><tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr></thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row[rowKey] ?? index}>
              {columns.map((column) => <td key={column.key}>{column.render ? column.render(row) : row[column.key] ?? '—'}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
