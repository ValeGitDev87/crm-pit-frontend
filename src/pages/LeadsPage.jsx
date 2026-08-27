import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminUsers, getLeadStatuses, getOrigins } from '../api/admin'
import { getLeads } from '../api/leads'
import { Badge } from '../components/common/Badge'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { PageHeader } from '../components/common/PageHeader'
import { Pagination } from '../components/common/Pagination'
import { StatusBadge } from '../components/common/StatusBadge'
import { ErrorState } from '../components/feedback/ErrorState'
import { LoadingState } from '../components/feedback/LoadingState'
import { useAuth } from '../hooks/useAuth'
import { formatCurrency, formatDateTime } from '../utils/formatters'

const EMPTY_FILTERS = {
  operator: '', origin: '', status: '', recycled: '', unassigned: '', date_from: '', date_to: '', per_page: '20',
}

function LeadCard({ lead, isAdmin }) {
  const contactName = [lead.contact?.first_name, lead.contact?.last_name].filter(Boolean).join(' ') || 'Senza nome'
  return (
    <article className="lead-card">
      <header>
        <div className="lead-card-person">
          <span className="lead-avatar" aria-hidden="true">{contactName.charAt(0).toUpperCase()}</span>
          <div><p>Lead #{lead.id}</p><h2>{contactName}</h2></div>
        </div>
      </header>

      <div className="lead-card-badges">
        <StatusBadge status={lead.current_status} />
        {lead.recycle_count > 0 && <Badge tone="violet">Rientrato x{lead.recycle_count}</Badge>}
        {!lead.current_assigned_user && <Badge tone="danger">Non assegnato</Badge>}
      </div>

      <dl className="lead-card-info">
        <div><dt>Provenienza</dt><dd>{lead.origin?.name || '—'}</dd></div>
        <div><dt>Ultimo ingresso</dt><dd>{formatDateTime(lead.last_received_at)}</dd></div>
        <div><dt>Ciclo</dt><dd>#{lead.current_cycle_number} · {lead.recycle_count || 0} ricircoli</dd></div>
        <div><dt>Importo</dt><dd>{formatCurrency(lead.current_cycle?.desired_amount)}</dd></div>
        {isAdmin && <div className="lead-card-admin"><dt>Gestore attuale</dt><dd>{lead.current_assigned_user?.name || 'Da assegnare'}</dd></div>}
      </dl>

      <div className="lead-card-contact">
        <span>{lead.contact?.phone || lead.contact?.email || 'Nessun recapito disponibile'}</span>
      </div>
      <Link className="button button-primary lead-manage-button" to={`/leads/${lead.id}`}>Gestisci</Link>
    </article>
  )
}

export function LeadsPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [draftFilters, setDraftFilters] = useState(EMPTY_FILTERS)
  const [query, setQuery] = useState({ ...EMPTY_FILTERS, page: 1 })
  const [options, setOptions] = useState({ operators: [], origins: [], statuses: [] })
  const [state, setState] = useState({ loading: true, data: [], meta: {}, error: null })

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }))
    try {
      const [result, filterOptions] = await Promise.all([
        getLeads(query),
        isAdmin
          ? Promise.all([getAdminUsers(), getOrigins(), getLeadStatuses()])
          : Promise.resolve(null),
      ])
      if (filterOptions) {
        const [users, origins, statuses] = filterOptions
        setOptions({
          operators: users.filter((item) => item.role === 'operator' && item.active),
          origins: origins.filter((item) => item.active),
          statuses: statuses.filter((item) => item.active),
        })
      }
      setState({ loading: false, data: result.data, meta: result.meta, error: null })
    } catch (error) {
      setState({ loading: false, data: [], meta: {}, error })
    }
  }, [isAdmin, query])

  useEffect(() => {
    const timer = window.setTimeout(load, 0)
    return () => window.clearTimeout(timer)
  }, [load])

  function updateDraft(event) {
    const { name, value } = event.target
    setDraftFilters((current) => ({ ...current, [name]: value }))
  }

  function applyFilters(event) {
    event.preventDefault()
    setQuery({ ...draftFilters, page: 1 })
  }

  function resetFilters() {
    setDraftFilters(EMPTY_FILTERS)
    setQuery({ ...EMPTY_FILTERS, page: 1 })
  }

  return (
    <>
      <PageHeader
        eyebrow={isAdmin ? 'Vista globale' : 'Portafoglio personale'}
        title={isAdmin ? 'Lead' : 'I miei lead'}
        description={isAdmin ? 'Consulta il portafoglio commerciale e applica i filtri operativi.' : 'Visualizzi esclusivamente i lead assegnati a te dal backend.'}
      />

      {isAdmin && (
        <Card className="filters-card">
          <form onSubmit={applyFilters}>
            <label><span>Operatore</span><select name="operator" value={draftFilters.operator} onChange={updateDraft}><option value="">Tutti</option>{options.operators.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            <label><span>Provenienza</span><select name="origin" value={draftFilters.origin} onChange={updateDraft}><option value="">Tutte</option>{options.origins.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            <label><span>Stato</span><select name="status" value={draftFilters.status} onChange={updateDraft}><option value="">Tutti</option>{options.statuses.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            <label><span>Ricircoli</span><select name="recycled" value={draftFilters.recycled} onChange={updateDraft}><option value="">Tutti</option><option value="1">Solo riciclati</option><option value="0">Mai riciclati</option></select></label>
            <label><span>Assegnazione</span><select name="unassigned" value={draftFilters.unassigned} onChange={updateDraft}><option value="">Tutti</option><option value="1">Non assegnati</option><option value="0">Assegnati</option></select></label>
            <label><span>Dal</span><input type="date" name="date_from" value={draftFilters.date_from} onChange={updateDraft} /></label>
            <label><span>Al</span><input type="date" name="date_to" value={draftFilters.date_to} onChange={updateDraft} /></label>
            <label><span>Per pagina</span><select name="per_page" value={draftFilters.per_page} onChange={updateDraft}><option value="20">20</option><option value="50">50</option><option value="100">100</option></select></label>
            <div className="filter-actions"><Button type="button" variant="secondary" onClick={resetFilters}>Azzera</Button><Button type="submit">Applica filtri</Button></div>
          </form>
        </Card>
      )}

      {state.loading && <LoadingState label="Caricamento lead…" />}
      {!state.loading && state.error && <ErrorState message={state.error.message} onRetry={load} />}
      {!state.loading && !state.error && (
        <div className="leads-results">
          {state.data.length ? (
            <div className="leads-card-grid">
              {state.data.map((lead) => <LeadCard key={lead.id} lead={lead} isAdmin={isAdmin} />)}
            </div>
          ) : (
            <Card><div className="content-state"><span className="empty-illustration" aria-hidden="true">—</span><h2>Nessun lead trovato</h2><p>Modifica i filtri oppure attendi nuovi ingressi.</p></div></Card>
          )}
          <Pagination meta={state.meta} onPageChange={(page) => setQuery((current) => ({ ...current, page }))} />
        </div>
      )}
    </>
  )
}
