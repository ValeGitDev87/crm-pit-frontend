import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { assignLead, getOrigin } from '../api/admin'
import { ApiError } from '../api/client'
import { getLead } from '../api/leads'
import { Badge } from '../components/common/Badge'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { StatusBadge } from '../components/common/StatusBadge'
import { EmptyState } from '../components/feedback/EmptyState'
import { ErrorState } from '../components/feedback/ErrorState'
import { LoadingState } from '../components/feedback/LoadingState'
import { useAuth } from '../hooks/useAuth'
import { formatCurrency, formatDate, formatDateTime, humanize } from '../utils/formatters'
import { ForbiddenPage } from './ForbiddenPage'
import { NotFoundPage } from './NotFoundPage'

function InfoItem({ label, children }) {
  return <div className="info-item"><dt>{label}</dt><dd>{children || '—'}</dd></div>
}

function MiniTimeline({ items, type }) {
  if (!items?.length) return <p className="muted-copy">Nessuno storico disponibile.</p>
  return (
    <ol className="mini-timeline">
      {items.map((item) => (
        <li key={item.id}>
          <span aria-hidden="true" />
          <div>
            <strong>{type === 'assignment' ? item.user?.name : item.status?.name}</strong>
            <p>{type === 'assignment' ? humanize(item.assignment_type) : `Modificato da ${item.changed_by?.name || 'sistema'}`}</p>
            <time>{formatDateTime(type === 'assignment' ? item.started_at : item.changed_at)}</time>
          </div>
        </li>
      ))}
    </ol>
  )
}

function CycleCard({ cycle, current }) {
  return (
    <details className="cycle-card" open={current}>
      <summary>
        <div><strong>Ciclo #{cycle.cycle_number}</strong><span>{humanize(cycle.trigger)} · {formatDateTime(cycle.started_at)}</span></div>
        <div>{current && <Badge tone="blue">Corrente</Badge>}{cycle.final_status && <StatusBadge status={cycle.final_status} />}</div>
      </summary>
      <div className="cycle-content">
        <section>
          <h3>Snapshot commerciale</h3>
          <dl className="info-grid info-grid-compact">
            <InfoItem label="Importo richiesto">{formatCurrency(cycle.desired_amount)}</InfoItem>
            <InfoItem label="Professione">{cycle.profession}</InfoItem>
            <InfoItem label="Residenza">{cycle.residence}</InfoItem>
            <InfoItem label="Sistema sorgente">{humanize(cycle.source_system)}</InfoItem>
            <InfoItem label="Origine ricevuta">{cycle.raw_origin}</InfoItem>
            <InfoItem label="Fine ciclo">{formatDateTime(cycle.ended_at)}</InfoItem>
          </dl>
        </section>
        <div className="history-grid">
          <section><h3>Assegnazioni</h3><MiniTimeline items={cycle.assignments} type="assignment" /></section>
          <section><h3>Storico stati</h3><MiniTimeline items={cycle.status_history} type="status" /></section>
        </div>
        <div className="cycle-summary-grid">
          <section><h3>Note</h3>{cycle.notes?.length ? cycle.notes.map((note) => <article className="compact-item" key={note.id}><strong>{note.author?.name}</strong><p>{note.body}</p><time>{formatDateTime(note.created_at)}</time></article>) : <p className="muted-copy">Nessuna nota nel ciclo.</p>}</section>
          <section><h3>Attività</h3>{cycle.tasks?.length ? cycle.tasks.map((task) => <article className="compact-item" key={task.id}><div><strong>{task.title}</strong><Badge tone={task.status === 'pending' ? 'blue' : 'neutral'}>{humanize(task.status)}</Badge></div><p>{humanize(task.type)} · {formatDateTime(task.due_at)}</p></article>) : <p className="muted-copy">Nessuna attività nel ciclo.</p>}</section>
          <section><h3>Pratica</h3>{cycle.practice ? <Link className="practice-link" to={`/practices/${cycle.practice.id}`}><strong>Pratica #{cycle.practice.id}</strong><Badge tone="violet">{humanize(cycle.practice.status)}</Badge></Link> : <p className="muted-copy">Nessuna pratica nel ciclo.</p>}</section>
        </div>
      </div>
    </details>
  )
}

function ReassignmentDialog({ lead, open, onClose, onAssigned }) {
  const [operators, setOperators] = useState([])
  const [selected, setSelected] = useState('')
  const [state, setState] = useState({ loading: false, saving: false, error: '' })

  useEffect(() => {
    if (!open) return undefined
    let active = true
    const timer = window.setTimeout(() => {
      setState({ loading: true, saving: false, error: '' })
      getOrigin(lead.origin.id)
        .then((origin) => {
          if (!active) return
          const eligible = (origin.operators || []).filter((item) => item.active && item.receives_leads)
          setOperators(eligible)
          setSelected(String(lead.current_assigned_user?.id || eligible[0]?.id || ''))
          setState({ loading: false, saving: false, error: '' })
        })
        .catch((error) => active && setState({ loading: false, saving: false, error: error.message }))
    }, 0)
    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [lead, open])

  if (!open) return null

  async function submit(event) {
    event.preventDefault()
    if (!selected) return
    setState((current) => ({ ...current, saving: true, error: '' }))
    try {
      await assignLead(lead.id, selected)
      await onAssigned()
      onClose()
    } catch (error) {
      const message = error instanceof ApiError && error.fieldErrors.user_id?.[0]
        ? error.fieldErrors.user_id[0]
        : error.message
      setState((current) => ({ ...current, saving: false, error: message }))
    }
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <form className="modal" role="dialog" aria-modal="true" aria-labelledby="reassign-title" onSubmit={submit}>
        <h2 id="reassign-title">Riassegna lead</h2>
        <p>Gli operatori disponibili provengono dalla configurazione della provenienza {lead.origin.name}.</p>
        {state.error && <div className="alert alert-error" role="alert">{state.error}</div>}
        {state.loading ? <LoadingState label="Caricamento operatori…" /> : operators.length ? (
          <label className="dialog-field"><span>Nuovo operatore</span><select value={selected} onChange={(event) => setSelected(event.target.value)}>{operators.map((operator) => <option key={operator.id} value={operator.id}>{operator.name}</option>)}</select></label>
        ) : <EmptyState title="Nessun operatore eleggibile" description="Configura gli operatori della provenienza prima di riassegnare il lead." />}
        <div className="modal-actions"><Button type="button" variant="secondary" onClick={onClose} disabled={state.saving}>Annulla</Button><Button type="submit" disabled={state.loading || state.saving || !selected}>{state.saving ? 'Salvataggio…' : 'Riassegna'}</Button></div>
      </form>
    </div>
  )
}

export function LeadDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [state, setState] = useState({ loading: true, data: null, error: null })
  const [reassignOpen, setReassignOpen] = useState(false)
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }))
    try {
      setState({ loading: false, data: await getLead(id), error: null })
    } catch (error) {
      setState({ loading: false, data: null, error })
    }
  }, [id])

  useEffect(() => {
    const timer = window.setTimeout(load, 0)
    return () => window.clearTimeout(timer)
  }, [load])

  if (state.loading) return <LoadingState label="Caricamento scheda lead…" />
  if (state.error?.status === 403) return <ForbiddenPage />
  if (state.error?.status === 404) return <NotFoundPage />
  if (state.error) return <ErrorState message={state.error.message} onRetry={load} />

  const lead = state.data
  const contactName = [lead.contact?.first_name, lead.contact?.last_name].filter(Boolean).join(' ') || 'Contatto senza nome'

  async function handleAssigned() {
    await load()
    setNotice('Lead riassegnato correttamente.')
  }

  return (
    <>
      <Link className="back-link" to="/leads">← Torna ai lead</Link>
      <header className="lead-header">
        <div><p className="eyebrow">Lead #{lead.id}</p><h1>{contactName}</h1><div className="lead-badges"><StatusBadge status={lead.current_status} /><Badge tone="neutral">{lead.origin?.name}</Badge>{lead.recycle_count > 0 && <Badge tone="violet">Rientrato x{lead.recycle_count}</Badge>}</div></div>
        {user?.role === 'admin' && <Button type="button" variant="secondary" onClick={() => setReassignOpen(true)}>Riassegna</Button>}
      </header>
      {notice && <div className="alert alert-success" role="status">{notice}</div>}

      <div className="lead-overview">
        <Card className="detail-card">
          <div className="detail-card-heading"><h2>Anagrafica</h2></div>
          <dl className="info-grid">
            <InfoItem label="Email">{lead.contact?.email}</InfoItem>
            <InfoItem label="Telefono">{lead.contact?.phone}</InfoItem>
            <InfoItem label="Data di nascita">{formatDate(lead.contact?.birth_date)}</InfoItem>
            <InfoItem label="Professione">{lead.contact?.profession}</InfoItem>
            <InfoItem label="Residenza">{lead.contact?.residence}</InfoItem>
          </dl>
        </Card>
        <Card className="detail-card">
          <div className="detail-card-heading"><h2>Situazione corrente</h2></div>
          <dl className="info-grid">
            <InfoItem label="Operatore">{lead.current_assigned_user?.name || <Badge tone="danger">Non assegnato</Badge>}</InfoItem>
            <InfoItem label="Ciclo corrente">#{lead.current_cycle_number}</InfoItem>
            <InfoItem label="Primo ingresso">{formatDateTime(lead.first_received_at)}</InfoItem>
            <InfoItem label="Ultimo ingresso">{formatDateTime(lead.last_received_at)}</InfoItem>
          </dl>
        </Card>
      </div>

      <section className="cycles-section">
        <div className="section-title"><div><p className="eyebrow">Storico completo</p><h2>Cicli del lead</h2></div><Badge tone="neutral">{lead.cycles?.length || 0} cicli</Badge></div>
        {lead.cycles?.length ? lead.cycles.map((cycle) => <CycleCard key={cycle.id} cycle={cycle} current={cycle.cycle_number === lead.current_cycle_number} />) : <EmptyState title="Nessun ciclo disponibile" description="Il backend non ha restituito cicli per questo lead." />}
      </section>

      <ReassignmentDialog lead={lead} open={reassignOpen} onClose={() => setReassignOpen(false)} onAssigned={handleAssigned} />
    </>
  )
}
