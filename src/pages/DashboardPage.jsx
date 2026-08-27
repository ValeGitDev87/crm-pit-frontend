import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDashboard } from '../api/dashboard'
import { Badge } from '../components/common/Badge'
import { Card } from '../components/common/Card'
import { DataTable } from '../components/common/DataTable'
import { PageHeader } from '../components/common/PageHeader'
import { StatCard } from '../components/common/StatCard'
import { EmptyState } from '../components/feedback/EmptyState'
import { ErrorState } from '../components/feedback/ErrorState'
import { LoadingState } from '../components/feedback/LoadingState'
import { useAuth } from '../hooks/useAuth'
import { formatDateTime, humanize } from '../utils/formatters'

const OPERATOR_STATS = [
  ['assigned_leads', 'Lead assegnati', 'blue'],
  ['new_leads', 'Nuovi lead', 'success'],
  ['callbacks_today', 'Richiami oggi', 'violet'],
  ['overdue_tasks', 'Attività scadute', 'danger'],
  ['in_progress', 'In lavorazione', 'orange'],
  ['open_practices', 'Pratiche aperte', 'neutral'],
]

const ADMIN_STATS = [
  ['leads', 'Lead globali', 'blue'],
  ['open_leads', 'Lead aperti', 'success'],
  ['closed_leads', 'Lead chiusi', 'neutral'],
  ['recycled_leads', 'Lead riciclati', 'violet'],
  ['unassigned_leads', 'Non assegnati', 'danger'],
  ['open_practices', 'Pratiche aperte', 'orange'],
]

function OperationalList({ title, items, kind }) {
  return (
    <Card className="dashboard-section">
      <div className="section-heading"><h2>{title}</h2><span>{items?.length || 0}</span></div>
      {!items?.length ? (
        <EmptyState title="Tutto sotto controllo" description="Non ci sono elementi in questa lista." />
      ) : (
        <ul className="operational-list">
          {items.map((item) => {
            const isPractice = kind === 'practice'
            const target = isPractice ? `/practices/${item.id}` : `/leads/${item.lead_id || item.id}`
            return (
              <li key={item.id}>
                <Link to={target}>
                  <div><strong>{item.contact_name}</strong><span>{item.title || item.origin || (isPractice ? 'Pratica aperta' : 'Lead')}</span></div>
                  <time>{formatDateTime(item.due_at || item.opened_at || item.last_received_at)}</time>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}

function OperatorDashboard({ dashboard }) {
  return (
    <>
      <div className="stat-grid">
        {OPERATOR_STATS.map(([key, label, tone]) => <StatCard key={key} label={label} value={dashboard.counts?.[key]} tone={tone} />)}
      </div>
      <div className="dashboard-grid">
        <OperationalList title="Nuovi lead" items={dashboard.new_leads} kind="lead" />
        <OperationalList title="Richiami di oggi" items={dashboard.callbacks_today} kind="task" />
        <OperationalList title="Attività scadute" items={dashboard.overdue_tasks} kind="task" />
        <OperationalList title="Pratiche aperte" items={dashboard.open_practices} kind="practice" />
      </div>
    </>
  )
}

function AdminDashboard({ dashboard }) {
  const originColumns = [
    { key: 'origin', label: 'Provenienza', render: (row) => <strong>{row.origin?.name}</strong> },
    { key: 'leads', label: 'Lead' },
    { key: 'recycled', label: 'Riciclati' },
    { key: 'unassigned', label: 'Non assegnati' },
  ]
  const operatorColumns = [
    { key: 'operator', label: 'Operatore', render: (row) => <strong>{row.operator?.name}</strong> },
    { key: 'leads', label: 'Lead' },
    { key: 'new', label: 'Nuovi' },
    { key: 'recycled', label: 'Riciclati' },
  ]

  return (
    <>
      <div className="stat-grid">
        {ADMIN_STATS.map(([key, label, tone]) => <StatCard key={key} label={label} value={dashboard.global?.[key]} tone={tone} />)}
      </div>
      <div className="sync-grid">
        {(dashboard.sync_status || []).map((sync) => (
          <Card className="sync-card" key={sync.source_system}>
            <div><p>Sincronizzazione {humanize(sync.source_system)}</p><Badge tone={sync.status === 'success' ? 'success' : sync.status === 'failed' ? 'danger' : 'neutral'}>{humanize(sync.status)}</Badge></div>
            <strong>{sync.finished_at ? `Ultima esecuzione ${formatDateTime(sync.finished_at)}` : 'Nessuna esecuzione completata'}</strong>
            {sync.error_message && <small>{sync.error_message}</small>}
          </Card>
        ))}
      </div>
      <div className="dashboard-grid">
        <Card className="dashboard-section"><div className="section-heading"><h2>Lead per provenienza</h2></div><DataTable columns={originColumns} rows={dashboard.by_origin} rowKey="origin.id" emptyTitle="Nessuna provenienza" /></Card>
        <Card className="dashboard-section"><div className="section-heading"><h2>Carico per operatore</h2></div><DataTable columns={operatorColumns} rows={dashboard.by_operator} rowKey="operator.id" emptyTitle="Nessun operatore attivo" /></Card>
      </div>
    </>
  )
}

export function DashboardPage() {
  const { user } = useAuth()
  const [state, setState] = useState({ loading: true, data: null, error: null })

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }))
    try {
      const data = await getDashboard()
      setState({ loading: false, data, error: null })
    } catch (error) {
      setState({ loading: false, data: null, error })
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(load, 0)
    return () => window.clearTimeout(timer)
  }, [load])

  return (
    <>
      <PageHeader
        eyebrow={user?.role === 'admin' ? 'Vista amministratore' : 'Area personale'}
        title={`Ciao, ${user?.name}`}
        description="Una sintesi aggiornata delle attività commerciali."
      />
      {state.loading && <LoadingState label="Caricamento dashboard…" />}
      {!state.loading && state.error && <ErrorState message={state.error.message} onRetry={load} />}
      {!state.loading && state.data?.role === 'operator' && <OperatorDashboard dashboard={state.data} />}
      {!state.loading && state.data?.role === 'admin' && <AdminDashboard dashboard={state.data} />}
      {!state.loading && state.data && !['admin', 'operator'].includes(state.data.role) && <ErrorState message="Il ruolo restituito dalla dashboard non è supportato." />}
    </>
  )
}
