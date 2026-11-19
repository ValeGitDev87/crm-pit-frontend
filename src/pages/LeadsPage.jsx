import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { getAdminUsers, getLeadStatuses, getOrigins } from '../api/admin'
import { getLead, getLeads } from '../api/leads'
import { downloadDocument } from '../api/practices'
import { Badge } from '../components/common/Badge'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { PageHeader } from '../components/common/PageHeader'
import { Pagination } from '../components/common/Pagination'
import { StatusBadge } from '../components/common/StatusBadge'
import { ErrorState } from '../components/feedback/ErrorState'
import { LoadingState } from '../components/feedback/LoadingState'
import { useAuth } from '../hooks/useAuth'
import { formatCurrency, humanize } from '../utils/formatters'

const EMPTY_FILTERS = {
  operator: '', origin: '', status: '', unassigned: '', date_from: '', date_to: '', per_page: '20',
}

function DocumentsDialog({ lead, documents, onClose }) {
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(null)

  useEffect(() => () => {
    if (preview?.url) URL.revokeObjectURL(preview.url)
  }, [preview])

  async function viewDocument(document) {
    setBusy(document.id)
    setError('')
    try {
      const blob = await downloadDocument(document.id)
      const url = URL.createObjectURL(blob)
      setPreview({
        url,
        name: document.original_name || document.name,
        mimeType: blob.type || document.mime_type || '',
      })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusy(null)
    }
  }

  return createPortal((
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div className="modal documents-modal" role="dialog" aria-modal="true" aria-labelledby={`documents-title-${lead.id}`} onMouseDown={(event) => event.stopPropagation()}>
        <h2 id={`documents-title-${lead.id}`}>Documenti</h2>
        <p>Documenti della pratica corrente di {[lead.contact?.first_name, lead.contact?.last_name].filter(Boolean).join(' ')}.</p>
        {error && <div className="alert alert-error" role="alert">{error}</div>}
        <div className="quick-documents-list">
          {documents.map((document) => (
            <article key={document.id}>
              <div><strong>{document.name}</strong><span>Stato: {humanize(document.status)}</span></div>
              {document.has_file && <Button type="button" variant="secondary" disabled={busy !== null} onClick={() => viewDocument(document)}>{busy === document.id ? 'Apertura…' : 'Vedi'}</Button>}
            </article>
          ))}
        </div>
        <div className="modal-actions"><Button type="button" variant="secondary" onClick={onClose} disabled={busy !== null}>Chiudi</Button></div>
      </div>
      {preview && (
        <div className="modal-backdrop document-preview-backdrop" role="presentation" onMouseDown={(event) => { event.stopPropagation(); setPreview(null) }}>
          <div className="modal document-preview-modal" role="dialog" aria-modal="true" aria-labelledby={`preview-title-${lead.id}`} onMouseDown={(event) => event.stopPropagation()}>
            <div className="document-preview-heading"><h2 id={`preview-title-${lead.id}`}>Anteprima {preview.name}</h2><Button type="button" variant="secondary" onClick={() => setPreview(null)}>Chiudi anteprima</Button></div>
            {preview.mimeType.startsWith('image/')
              ? <img src={preview.url} alt={preview.name} />
              : <iframe src={preview.url} title={`Anteprima ${preview.name}`} />}
          </div>
        </div>
      )}
    </div>
  ), window.document.body)
}

function LeadCard({ lead }) {
  const contactName = [lead.contact?.first_name, lead.contact?.last_name].filter(Boolean).join(' ') || 'Senza nome'
  const [documentsOpen, setDocumentsOpen] = useState(false)
  const documents = lead.quickDocuments || []
  return (
    <article className="lead-card">
      <header>
        <div className="lead-card-person">
          <span className="lead-avatar" aria-hidden="true">{contactName.charAt(0).toUpperCase()}</span>
          <div><p>Cliente</p><h2>{contactName}</h2></div>
        </div>
      </header>

      <div className="lead-card-badges">
        <StatusBadge status={lead.current_status} />
        {!lead.current_assigned_user && <Badge tone="danger">Non assegnato</Badge>}
      </div>

      <dl className="lead-card-info">
        <div className="lead-card-manager"><dt>Gestore</dt><dd>{lead.current_assigned_user?.name || 'Da assegnare'}</dd></div>
        <div><dt>Provenienza</dt><dd>{lead.origin?.name || '—'}</dd></div>
        <div><dt>Importo</dt><dd>{formatCurrency(lead.current_cycle?.desired_amount)}</dd></div>
      </dl>

      <div className="lead-card-contact">
        <span>{lead.contact?.phone || lead.contact?.email || 'Nessun recapito disponibile'}</span>
      </div>
      <div className="lead-card-actions">
        {documents.length > 0 && <Button type="button" variant="secondary" onClick={() => setDocumentsOpen(true)}>Vedi documenti ({documents.length})</Button>}
        <Link className="button button-primary lead-manage-button" to={`/leads/${lead.id}`}>Gestisci</Link>
      </div>
      {documentsOpen && <DocumentsDialog lead={lead} documents={documents} onClose={() => setDocumentsOpen(false)} />}
    </article>
  )
}

async function addDocumentSummaries(leads) {
  return Promise.all(leads.map(async (lead) => {
    const inlineDocuments = lead.current_cycle?.practice?.documents
    if (Array.isArray(inlineDocuments)) return { ...lead, quickDocuments: inlineDocuments }

    try {
      const detail = await getLead(lead.id)
      const currentCycle = detail?.cycles?.find((cycle) => cycle.cycle_number === detail.current_cycle_number)
      return { ...lead, quickDocuments: currentCycle?.practice?.documents || [] }
    } catch {
      return { ...lead, quickDocuments: [] }
    }
  }))
}

export function LeadsPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [draftFilters, setDraftFilters] = useState(EMPTY_FILTERS)
  const [query, setQuery] = useState({ ...EMPTY_FILTERS, page: 1 })
  const [options, setOptions] = useState({ operators: [], origins: [], statuses: [] })
  const [state, setState] = useState({ loading: true, data: [], meta: {}, error: null })
  const loadRequest = useRef(0)

  const load = useCallback(async () => {
    const requestId = ++loadRequest.current
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
      const leadsWithDocuments = await addDocumentSummaries(result.data)
      if (requestId === loadRequest.current) {
        setState({ loading: false, data: leadsWithDocuments, meta: result.meta, error: null })
      }
    } catch (error) {
      if (requestId === loadRequest.current) setState({ loading: false, data: [], meta: {}, error })
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
              {state.data.map((lead) => <LeadCard key={lead.id} lead={lead} />)}
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
